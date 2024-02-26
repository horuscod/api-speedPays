const admin = require("../firebaseConfig");
const db = admin.firestore();
const ArkamaController = require("./arkamaController");

/* Functions Formats data */

function isPhoneFormatted(phone) {
  const phoneRegex = /^\(\d{2}\)\d{5}-\d{4}$/;
  return phoneRegex.test(phone);
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

const createNewClient = async (req, res) => {
  try {
    console.log("entrou na Etapa 1 - Criar novo cliente");
    const { hashUser, newCustomer, product, valueOffer } = req.body;
    const docRef = db.collection("users").doc(hashUser);
    const docUser = await docRef.get();
    if (docUser.exists) {
      console.log("entrou na Etapa 2 - O Responsavel existe");
      const dataUser = docUser.data();
      let UIDOrdens = dataUser.uidOrdensDocument;
      let tokenArkama = dataUser.tokenArkama;

      ///Existe usuário

      newCustomer.cellphone = formatPhone(newCustomer.cellphone);

      let dataCustomer = {
        tokenArkama: tokenArkama,
        customer: {
          name: newCustomer.name,
          email: newCustomer.email,
          document: newCustomer.document,
          cellphone: newCustomer.cellphone,
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
      }else{
        return res.status(200).json({mensage: 'Ordem não encontrada'});
      }
    }else{
      return res.status(200).json({mensage: 'Erro em comum. Informe os dados correto'});
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

        if (targetCustomer.status === "PAID") {
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
