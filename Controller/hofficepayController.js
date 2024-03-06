const axios = require("axios");
const admin = require("../firebaseConfig");
const db = admin.firestore();

const EventsFacebookController = require("./eventsFacebookController");

const createNewOrderInHofficePay = async (dataCustomer, res) => {
  try {
    let data = dataCustomer;
    const response = await axios.post(
      `https://app.hofficepay.com/api/webhook/generate-pix`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    if (response.data && response.data.paymentId && response.data.pixCode) {
      const dataReturn = response.data;

      return dataReturn;
    } else {
      return res.status(400).json({ message: "Erro ao gerar PIX" });
    }

    // resposta
  } catch (erro) {
    return res.status(200).json({
      Messaerro: `Erro ocorreu na criação de ordem o cliente foi:${dataCustomer.clientName} e o erro foi ${erro}`,
    });
  }
};

const postbackUpdateStatus = async (req, res) => {
  try {
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
          const dataFacebookTracking = documentUser.dataFacebookTracking;
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

                console.log(ordemData.customer[customerIndex].name)
                const dataEventPurchaseAction = {
                  valueProduct: 10.0,
                  customer: {
                    name: ordemData.customer[customerIndex].name,
                    email: ordemData.customer[customerIndex].email,
                    cellphone: ordemData.customer[customerIndex].cellphone,
                  },
                  facebookTracking: dataFacebookTracking,
                };

                try {
                  await EventsFacebookController.sendFacebookPurchaseEvent(
                    dataEventPurchaseAction
                  );
                  console.log("Evento de compra enviado com sucesso!");
                } catch (error) {
                  console.error("Erro ao enviar evento de compra:", error);
                }

                res.status(200).json("Update sucess!");
                return true;
              } else {
                res.status(200).json("Update Fail!");
                return false;
              }
            } else {
              res.status(200).json("Falha ao encontrar item");
              return false;
            }
          } else {
            res.status(200).json("Não encontrou item ordem");
            return false;
          }
        } else {
          res.status(200).json("Não encontrou item");
          return false;
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
  createNewOrderInHofficePay,
  postbackUpdateStatus,
};
