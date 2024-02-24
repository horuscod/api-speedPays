const axios = require("axios");
const admin = require("../firebaseConfig");
const db = admin.firestore();

const createNewOrderInArkama01 = async (req, res) => {
  try {
    const {
      customer: { name, email, document, cellphone },
      value,
      paymentMethod,
      items,
    } = req.body;
    const ipUser = req.ip;

    const response = await axios.post(
      "https://api.arkama.com.br/v1/orders?token=bAnRHpeWHy6oLoY4McaYsG9B7xWk47vPMIPQzn9qnLepDPc0cJnU4Wp75RMz",
      {
        customer: { name, email, document, cellphone },
        value,
        paymentMethod,
        items,
        ip: ipUser,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    if (response.data && response.data.pix && response.data.pix.payload) {
      const qrCodeUrl = await generateQRCode(response.data.pix.payload);
      res.status(200).json({ message: "PIX CRIADO COM SUCESSO", qrCodeUrl });
    } else {
      res.status(400).json({ message: "Erro ao gerar PIX" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const createNewOrderInArkama = async (dataCustomer, res) => {
  try {
    console.log("entrou na Etapa 4 - Entrou na linha de criação do arkama");
    let data = dataCustomer;
    /* 
    {
      "customer": {
        "name": "otavio",
        "email": "otavio@gmail.com",
        "document": "47305189855",
        "cellphone": "(16(99750-5927"
      },
      "items": [
        {
          "isDigital": true,
          "title": "Taxa pix",
          "unitPrice": 10,
          "quantity": 1
        }
      ],
      "value": 10,
      "paymentMethod": "pix",
      "ip": "168"
    } */

    console.log(data);
    const response = await axios.post(
      "https://api.arkama.com.br/v1/orders?token=bAnRHpeWHy6oLoY4McaYsG9B7xWk47vPMIPQzn9qnLepDPc0cJnU4Wp75RMz",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    if (response.data && response.data.pix && response.data.pix.payload) {
      console.log(
        "entrou na Etapa 5 - Criou ordem no Arkama e verificou se existe os dados"
      );
      const qrCodeUrl = await generateQRCode(response.data.pix.payload);
      response.data.qrCodeUrl = qrCodeUrl;
      console.log("entrou na Etapa 6 - criou QRCODE");
      const dataReturn = response.data;
      console.log("entrou na Etapa 7 - Retorna os dados JSON");
      return dataReturn;
    } else {
      res.status(400).json({ message: "Erro ao gerar PIX" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const verifyOrderStatusPIX = async (req, res) => {};

const OrderPIXPaid = async (req, res) => {};

const generateQRCode = async (payload) => {
  try {
    const response = await axios.get(
      `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
        payload
      )}&format=svg`
    );
    return response.request.res.responseUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const postbackUpdateStatus = async (req) => {
  try {
    const { tokenID } = req.params;
    const { event, data } = req.body;
    if (tokenID != null) {
      const docRef = db.collection("users").doc(tokenID);
      const doc = await docRef.get();

      if (doc.exists) {
        if (event === "ORDER_STATUS_CHANGED") {
          let documentUser = doc.data();
          var uidOrdensDocument = documentUser.uidOrdensDocument;
          let dataID = data.id;
          let dataStatus = data.status;

          const docRefOrdem = db.collection("ordens").doc(uidOrdensDocument);
          const docOrdem = await docRefOrdem.get();

          if (docOrdem.exists) {
            const ordemData = docOrdem.data();
            const customerIndex = ordemData.customer.findIndex(
              (c) => c.customerUID === dataID
            );

            if (customerIndex !== -1) {
              ordemData.customer[customerIndex].status = dataStatus;
              const updateStatus = await docRefOrdem.update({
                customer: ordemData.customer,
              });
              if (updateStatus) {
                return true;
              } else {
                return false;
              }
            }
          }
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

module.exports = {
  createNewOrderInArkama,
  createNewOrderInArkama01,
  postbackUpdateStatus,
};
