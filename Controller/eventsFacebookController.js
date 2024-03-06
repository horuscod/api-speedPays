const axios = require("axios");
const crypto = require("crypto");

/* Evento de compra - Update Status PAID*/
const sendFacebookPurchaseEvent = async (dataUser) => {
  try {
    const { valueProduct, facebookTracking, customer } = dataUser;

    for (const pixel of facebookTracking) {
      const shouldSendEvent = pixel.status === "active";

      if (shouldSendEvent) {
        const dadoName = customer.name;
        const dadoPhone = customer.cellphone;
        const dadoEmail = customer.email;
        const hashName = crypto
          .createHash("sha256")
          .update(dadoName)
          .digest("hex");
        const hashPhone = crypto
          .createHash("sha256")
          .update(dadoPhone)
          .digest("hex");
        const hashEmail = crypto
          .createHash("sha256")
          .update(dadoEmail)
          .digest("hex");
        const purchaseData = {
          value: valueProduct,
          user_data: {
            fn: hashName,
            ph: hashPhone,
            em: hashEmail,
          },
        };

        const api = axios.create({
          baseURL: "https://graph.facebook.com/v19.0/",
        });

        api.defaults.headers = {
          Authorization: `Bearer ${pixel.tokenPixelID}`,
          "Content-Type": "application/json",
        };

        const body = {
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: `${pixel.pixelID}_${Math.random()
                .toString(36)
                .substring(7)}`,

              user_data: {
                fn: hashName,
                ph: hashPhone,
                em: hashEmail,
                fbp: "fb.1.1708049982830.567216466",
              },
              currency: "BRL",
             
              value: 10.0,

              custom_data: {
                ...purchaseData,
              },
            },
          ],
        };

        try {
          const response = await api.post(`/${pixel.pixelID}/events`, body);
          console.log("Purchase event sent successfully:", response.data);
        } catch (error) {
          console.error("Error sending purchase event:", error.response.data);
        }
      }
    }
  } catch (error) {
    const message = "Ocorreu um erro verifica ai seus dados!";
    console.error(message, error);
    return message;
  }
};

const aa = async (pixelId, accessToken, eventData) => {
  const url = `https://graph.facebook.com/v15.0/${pixelId}/events`;
  const data = {
    data: [eventData],
    access_token: accessToken,
  };

  try {
    const response = await axios.post(url, data);
    console.log("Evento de compra enviado com sucesso:", response.data);
  } catch (error) {
    console.error(
      "Erro ao enviar evento de compra:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = { sendFacebookPurchaseEvent };
