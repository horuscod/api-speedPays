const axios = require("axios");
const admin = require("../firebaseConfig");
const db = admin.firestore();

const createNewOrderInArkama = async (dataCustomer, res) => {
  try {
    let data = dataCustomer;

    const response = await axios.post(
      `https://api.arkama.com.br/v1/orders?token=${data.tokenArkama}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log(response);

    if (response.data && response.data.pix && response.data.pix.payload) {
      const qrCodeUrl = await generateQRCode(response.data.pix.payload);
      response.data.qrCodeUrl = qrCodeUrl;
      const dataReturn = response.data;
      return dataReturn;
    } else {
      res.status(400).json({ message: "Erro ao gerar PIX" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

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
    console.log('entrou webhook')
    const { tokenID } = req.params;
    const { status, data, paymentId } = req.body;

    console.log(status);
    console.log(paymentId);

    if (tokenID != null) {
      const docRef = db.collection("users").doc(tokenID);
      const doc = await docRef.get();

      if (doc.exists) {
        if (status === "APPROVED") {
          let documentUser = doc.data();
          let uidOrdensDocument = documentUser.uidOrdensDocument;
          let dataID = paymentId;
          let dataStatus = status;

          console.log("aprovado o status na hofficepay");
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

const initSetupRuleArkama = async (req, res) => {
  try {
    const { tokenArkama, name } = req.body;
    const userRef = await db.collection("users").add({
      name: name,
      tokenArkama: tokenArkama,
    });
    await userRef.update({ uid: userRef.id });

    const ordensRef = await db.collection("ordens").add({});
    await ordensRef.update({ UID: ordensRef.id });

    const productsRef = await db.collection("products").add({});
    await productsRef.update({ UID: productsRef.id });

    await userRef.update({
      uidOrdensDocument: ordensRef.id,
      uidProductsDocument: productsRef.id,
    });

    console.log("Usuário criado com sucesso:", userRef.id);
    return res.status(201).json(userRef);
  } catch (error) {
    return res.status(400).json(error);
  }
};

/* New functions for developer to otimizate process */

const verifyOrderStatusPIX = async (req, res) => {};

const OrderPIXPaid = async (req, res) => {};

module.exports = {
  createNewOrderInArkama,
  postbackUpdateStatus,
  initSetupRuleArkama,
};
