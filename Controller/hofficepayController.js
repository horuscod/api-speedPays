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

/* Ativa já o evento de COMPRA REALIZADA. Quando o status é atualizado */
const postbackUpdateStatus = async (req, res) => {
  try {
    const { tokenID } = req.params;
    const { status, data, paymentId } = req.body;
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
                console.log(ordemData.customer[customerIndex].name);

                const dataUTMFbc = ordemData.customer[customerIndex].utms.fbc || "";
                const dataUTMFbp = ordemData.customer[customerIndex].utms.fbp || "";
                const dataUTMClientIp =
                  ordemData.customer[customerIndex].client_ip_address || "";

                /* Dados do BDA para evento */
                const dataEmail = ordemData.customer[customerIndex].email || "";
                const dataPhone =
                  ordemData.customer[customerIndex].cellphone || "";
                const dataName = ordemData.customer[customerIndex].name || "";
                const dataLastName =
                  ordemData.customer[customerIndex].name || "";

                /* Dados complementares */
                const dataGener =
                  ordemData.customer[customerIndex].gener || "m";
                const dataDateBorn =
                  ordemData.customer[customerIndex].DateBorn || "";
                const dataCodCEP = ordemData.customer[customerIndex].cep || "";
                const dataStateOfCity =
                  ordemData.customer[customerIndex].stateCity || "";
                const dataCity = ordemData.customer[customerIndex].city || "";

                /* Dados Produto relacionado ao usuário */
                const dataProductValue =
                  ordemData.customer[customerIndex].productValue || 10.0;


                /* Dado montado para ativar o evento de purchase */
                const dataEventPurchaseAction = {
                  dataPixesFacebook: dataFacebookTracking,
                  dataCustomer: {
                    name: dataName,
                    email: dataEmail,
                    cellphone: dataPhone,
                    lastName: dataLastName,
                    gener: dataGener,
                    dateBorn: dataDateBorn,
                    cep: dataCodCEP,
                    stateOfCity: dataStateOfCity,
                    city: dataCity,
                  },

                  dataUTM: {
                    fbc: dataUTMFbc,
                    fbp: dataUTMFbp,
                    client_ip_address: dataUTMClientIp,
                  },
                  productValue: dataProductValue,
                };

                try {
                  await EventsFacebookController.eventPurchase(
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
