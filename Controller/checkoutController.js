const admin = require("../firebaseConfig");
const db = admin.firestore();
const ArkamaController = require("./arkamaController");
const HofficePayController = require("./hofficepayController");
const EventsFacebookController = require("./eventsFacebookController");

/* Functions Formats data */

function isPhoneFormatted(phone) {
  const phoneRegex = /^\(\d{2}\)\d{5}-\d{4}$/;
  return phoneRegex.test(phone);
}

function formatPhone(phone) {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
/* Gerar e-mail aleatorio */

function gerarEmailAleatorio() {
  const dominios = ["@gmail.com", "@hotmail.com", "@outlook.com"];
  const letras = "abcdefghijklmnopqrstuvwxyz";
  let email = "";
  for (let i = 0; i < 10; i++) {
    email += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  email += dominios[Math.floor(Math.random() * dominios.length)];

  return email;
}

const createNewClient = async (req, res) => {
  try {
    const {
      hashUser,
      newCustomer,
      product,
      valueOffer,
      typeBank,
      tracking,
      utmsData,
    } = req.body;
    const docRef = db.collection("users").doc(hashUser);
    const docUser = await docRef.get();

    /* 
    typeBank: é o tipo de banco. Atualiza essa anotação, estou trabalhando com o ARKAMA, HOFFICEPAY 
    typeBank:[{
      name: 'arkama', 
      active: true
    }, 
    {
      name: 'hofficepay', 
      active: true
    }]
    */

    if (docUser.exists) {
      const dataUser = docUser.data();
      const UIDOrdens = dataUser.uidOrdensDocument;

      let typeBankData = dataUser.typeBankData;
      let activeBank = typeBankData.find((bank) => bank.active);

      let tokenArkama = dataUser.tokenArkama;
      if (
        typeBank == "arkama" &&
        typeBankData.name === "arkama" &&
        typeBankData.active
      ) {
        let dataCustomer = {
          tokenArkama: tokenArkama,
          customer: {
            name: newCustomer.name,
            email: newCustomer.email ? newCustomer.email : emailAleatorio,
            document: newCustomer.document,
            cellphone: newCustomer.cellphone
              ? (newCustomer.cellphone = formatPhone(newCustomer.cellphone))
              : "(11)99999-9999",
          },
          value: valueOffer || 10,
          paymentMethod: "pix",
          items: [
            {
              title: product.name || "Taxa de abertura",
              unitPrice: product.unitPrice || 10.0,
              quantity: 1,
              isDigital: true,
            },
          ],
          ip: newCustomer.ip,
        };

        const CreateOrdemArkama = await ArkamaController.createNewOrderInArkama(
          dataCustomer
        );

        if (CreateOrdemArkama) {
          console.log("entrou na Etapa 8 - Criou no arkama e agora é update");
          let customerSpeedPays = {
            customerUID: CreateOrdemArkama.id,
            arkamaDataID: CreateOrdemArkama.id,
            name: CreateOrdemArkama.customer.name,
            email: CreateOrdemArkama.customer.email,
            cellphone: CreateOrdemArkama.customer.cellphone,
            document: CreateOrdemArkama.customer.document,
            ip: CreateOrdemArkama.ip,
            payloadPix: CreateOrdemArkama.pix.payload,
            URLPixQrCode: CreateOrdemArkama.qrCodeUrl,
            status: CreateOrdemArkama.status,
          };

          const documentRef = db.collection("ordens").doc(UIDOrdens);

          try {
            await documentRef.update({
              customer: admin.firestore.FieldValue.arrayUnion({
                ...customerSpeedPays,
              }),
            });

            let dataResponse = {
              usID: dataUser.uid,
              pdID: dataUser.uidProductsDocument,
              hhID: dataUser.uidOrdensDocument,
              crID: CreateOrdemArkama.id,
            };
            return res.status(200).json({
              message:
                "Checkout Criado com sucesso, use esses dados para criar seu checkout",
              dataResponse,
            });
          } catch (error) {
            console.error("Erro ao atualizar o documento:", error);
            res.status(500).json({ message: "Erro ao atualizar o documento" });
          }
        } else {
          return res.status(200).json({ mensage: "Ordem não encontrada" });
        }
      } else if (
        activeBank &&
        typeBank == activeBank.name &&
        typeBank == "hofficepay"
      ) {
        /* filtro de tipo de banco adicionar na variavel e passa o token */

        console.log("entrou na criação da hoffipay");
        const emailUser = newCustomer.email
          ? newCustomer.email
          : "email@gmail.com";
        const cellphoneUser = newCustomer.cellphone
          ? newCustomer.cellphone.replace(/\D/g, "")
          : "5511999999999";

        let dataCustomer = {
          name: newCustomer.name,
          email: emailUser,
          cpf: newCustomer.cpf,
          phone: cellphoneUser,
          offerId: product.offerId,
          utmQuery: tracking.utms,
          utmsData: utmsData.length > 0 ? utmsData : null,
        };

        const responseHofficePay =
          await HofficePayController.createNewOrderInHofficePay(dataCustomer);

        if (responseHofficePay && Object.keys(responseHofficePay).length > 0) {
          //PIX foi gerado com sucesso no adquirente. Vamos levar para o front-end aqui

          /* Gerar ultimo nome */

          console.log("entrou para criar usuario no bda");
          const customerSpeedPays = {
            customerUID: responseHofficePay.paymentId,
            hashOrdem: responseHofficePay.paymentId,
            name: newCustomer.name,
            document: newCustomer.cpf,
            email: emailUser,
            cellphone: cellphoneUser,
            lastName: "",
            gener: newCustomer.gener ? newCustomer.gener : "",
            dateBorn: newCustomer.gener ? newCustomer.gener : "",
            cep: newCustomer.cep ? newCustomer.cep : "",
            stateOfCity: newCustomer.stateOfCity ? newCustomer.stateOfCity : "",
            city: newCustomer.city ? newCustomer.city : "",
            productValue: product.productValue ? product.productValue : 0.0,
            client_ip_address: newCustomer.client_ip_address
              ? newCustomer.client_ip_address
              : "",
            payloadPix: responseHofficePay.pixCode,
            URLPixQrCode: responseHofficePay.pixQRCODE,
            status: "PENDING",
            utms: utmsData
              ? {
                  fbc: utmsData.fbc ? utmsData.fbc : "",
                  fbp: utmsData.fbp ? utmsData.fbp : "",
                  utm_id: utmsData.utm_id ? utmsData.utm_id : "",
                  utm_source: utmsData.utm_source ? utmsData.utm_source : "",
                  utm_medium: utmsData.utm_medium ? utmsData.utm_medium : "",
                  utm_campaign: utmsData.utm_campaign
                    ? utmsData.utm_campaign
                    : "",
                  utm_term: utmsData.utm_term ? utmsData.utm_term : "",
                  utm_content: utmsData.utm_content ? utmsData.utm_content : "",
                }
              : {},
          };
          const documentRef = db.collection("ordens").doc(UIDOrdens);

          try {
            await documentRef.update({
              customer: admin.firestore.FieldValue.arrayUnion({
                ...customerSpeedPays,
              }),
            });

            ///esse PD tenho que ajustar
            let dataResponse = {
              usID: dataUser.uid,
              pdID: dataUser.uidProductsDocument,
              hhID: dataUser.uidOrdensDocument,
              crID: responseHofficePay.paymentId,
            };
            return res.status(200).json({
              message:
                "Checkout Criado com sucesso, use esses dados para criar seu checkout",
              dataResponse,
            });
          } catch (error) {
            console.error("Erro ao atualizar o documento:", error);
            return res
              .status(500)
              .json({ message: "Erro ao atualizar o documento" });
          }
        } else {
          return res.status(200).json({ mensage: "Ordem não encontrada" });
        }
      } else {
        return res.status(200).json({ mensage: "Deu algum erro por aqui" });
      }

      ///Existe usuário

      const emailAleatorio = gerarEmailAleatorio();
    } else {
      return res
        .status(200)
        .json({ mensage: "Erro em comum. Informe os dados correto" });
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

const createNewCheckout = async (req, res) => {
  try {
    const { hashUser, hashProduct, hashOrdem, customerUID } = req.body || "";
    let dataUser;
    const docRef = db.collection("users").doc(hashUser);
    const doc = await docRef.get();
    if (doc.exists) {
      dataUser = doc.data();
      var uidOrdensDocument = dataUser.uidOrdensDocument;
      var uidProductsDocument = dataUser.uidProductsDocument;
      const dataFacebookTracking = dataUser.dataFacebookTracking;
      if (
        hashProduct === uidProductsDocument &&
        hashOrdem === uidOrdensDocument
      ) {
        const docRefOrdem = db.collection("ordens").doc(uidOrdensDocument);
        const docOrdem = await docRefOrdem.get();

        if (docOrdem.exists) {
          const ordemData = docOrdem.data();
          const customerData = ordemData.customer.find(
            (c) => c.customerUID === customerUID
          );

          if (customerData) {
            console.log(customerData);

            /* Acionar o PIXEL de iniciar checkout */

            const dataEventAction = {
              dataPixesFacebook: dataFacebookTracking,
              dataCustomer: {
                name: customerData.name,
                email: customerData.email,
                cellphone: `+${customerData.cellphone}`,
                lastName: customerData.lastName,
                gener: customerData.gener,
                dateBorn: customerData.dateBorn,
                cep: customerData.cep,
                stateOfCity: customerData.stateOfCity,
                city: customerData.city,
              },

              dataUTM: {
                fbc: customerData.utms.fbc ? customerData.utms.fbc : null,
                fbp: customerData.utms.fbp ? customerData.utms.fbp : null,
                client_ip_address: customerData.client_ip_address,
              },
              productValue: customerData.productValue,
            };

            try {
              await EventsFacebookController.eventInitiateCheckout(
                dataEventAction
              );
              console.log("Evento de iniciação de Compra Okay");
            } catch (error) {
              console.error("Erro ao enviar evento de compra:", error);
            }
            // O customerUID corresponde, faça o que for necessário com os dados
            return res.status(200).json(customerData);
          } else {
            // O customerUID não corresponde
            return res
              .status(404)
              .json("customerUID não encontrado no documento de ordem");
          }
        } else {
          // O documento de ordem não existe
          return res.status(404).json("Documento de ordem não encontrado");
        }
      } else {
        return res
          .status(404)
          .json(
            "verifique seu dados que estão sendo enviado. Algo está errado, entre em contato com o suporte, caso não consiga resolver esse item"
          );
      }
    }
    return true;
  } catch (error) {
    console.log("error é " + error);

    return res.status(402).json(error);
  }
};

const checkConfirmOrdemPAID = async (req, res) => {
  // pegar quem é quem.
  const { hashUser, hashCustomer } = req.body;

  if (hashUser != null && hashCustomer != null) {
    const docRef = db.collection("users").doc(hashUser);
    const docUser = await docRef.get();
    if (docUser.exists) {
      const dataUser = docUser.data();

      let UIDOrdens = dataUser.uidOrdensDocument;

      const documentOrdensRef = db.collection("ordens").doc(UIDOrdens);
      const docOrdens = await documentOrdensRef.get();

      if (docOrdens.exists) {
        const dataOrdens = docOrdens.data();
        const customer = dataOrdens.customer;
        const targetCustomer = customer.find(
          (c) => c.customerUID === hashCustomer
        );

        if (
          targetCustomer.status === "PAID" ||
          targetCustomer.status === "APPROVED"
        ) {
          return res.status(200).json({
            message: "Cliente realizou o pagamento com sucesso!",
            status: "PAGO",
          });
        } else if (targetCustomer.status === "PENDING") {
          return res.status(200).json({
            message: "Cliente ainda não realizou o pagamento!",
            status: "PENDENTE",
          });
        } else {
          return res.status(404).json({ message: "Cliente não encontrado" });
        }
      } else {
        return res.status(404).json({ message: "Ordem não encontrada!" });
      }
    } else {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }
  } else {
    return res.status(404).json("Não encontrado, IP gravado");
  }
};

module.exports = { createNewCheckout, createNewClient, checkConfirmOrdemPAID };
