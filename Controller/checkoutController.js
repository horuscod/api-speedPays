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
    const { hashUser, newCustomer, product } = req.body;
    const docRef = db.collection("users").doc(hashUser);
    const docUser = await docRef.get();
    if (docUser.exists) {
      console.log("entrou na Etapa 2 - O Responsavel existe");
      const dataUser = docUser.data();
      let UIDOrdens = dataUser.uidOrdensDocument;

      ///Existe usuário

      newCustomer.cellphone = formatPhone(newCustomer.cellphone);

      let dataCustomer = {
        customer: {
          name: newCustomer.name,
          email: newCustomer.email,
          document: newCustomer.document,
          cellphone: newCustomer.cellphone,
        },
        value: 10.0,
        paymentMethod: "pix",
        items: [
          {
            title: product.name || "Taxa de abertura",
            unitPrice: product.value || 10.0,
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
      }
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

module.exports = { createNewCheckout, createNewClient };
