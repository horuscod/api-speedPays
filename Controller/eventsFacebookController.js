const axios = require("axios");

/* Evento de compra - Update Status PAID*/
const sendFacebookPurchaseEvent = async (dataUser) => {
  try {
    const { pixelID, tokenPixelID, valueProduct } = dataUser;

    if ((pixelID != null) & (tokenPixelID != null)) {
      const url = `https://graph.facebook.com/v15.0/${pixelId}/events`;
      const data = {
        data: [
          {
            event_name: "Purchase",
            custom_data: {
              currency: "BRL",
              value: valueProduct,
            },
          },
        ],
        access_token: tokenPixelID,
      };

      const response = await axios.post(url, data);

      console.log("Evento de compra enviado com sucesso:", response.data);
    }
  } catch (error) {
    const message = "Ocorreu um erro verifica ai seus dados!";
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
