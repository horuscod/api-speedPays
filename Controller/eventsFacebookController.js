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

const eventPurchase = async (data) => {
  try {
    console.log("Realmente marcou uma compra");
    const { dataPixesFacebook, dataCustomer, dataUTM, productValue } = data;
    const results = [];
    for (const pixel of dataPixesFacebook) {
      const shouldSendEvent = pixel.status === "active";
      if (shouldSendEvent) {
        /* Convert datas in HASH-256 */
        const hashName = crypto
          .createHash("sha256")
          .update(dataCustomer.name)
          .digest("hex");
        const hasEmail = crypto
          .createHash("sha256")
          .update(dataCustomer.email)
          .digest("hex");
        const hashPhone = crypto
          .createHash("sha256")
          .update(dataCustomer.cellphone)
          .digest("hex");
        const hashLastName = crypto
          .createHash("sha256")
          .update(dataCustomer.lastName)
          .digest("hex");
        const hashGener = crypto
          .createHash("sha256")
          .update(dataCustomer.gener)
          .digest("hex");
        const hashDateBorn = crypto
          .createHash("sha256")
          .update(dataCustomer.dateBorn)
          .digest("hex");
        const hashCodCEP = crypto
          .createHash("sha256")
          .update(dataCustomer.cep)
          .digest("hex");
        const hashStateOfCity = crypto
          .createHash("sha256")
          .update(dataCustomer.stateOfCity)
          .digest("hex");
        const hashCity = crypto
          .createHash("sha256")
          .update(dataCustomer.city)
          .digest("hex");

        const url = `https://graph.facebook.com/v16.0/${pixel.pixelID}/events?access_token=${pixel.tokenPixelID}`;

        const dataEvent = {
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              content_type: "product",
              user_data: {
                em: [hasEmail],
                ph: [hashPhone],
                fn: [hashName],
                ge: [hashGener],
                ln: [hashLastName],
                db: [hashDateBorn],
                zp: [hashCodCEP],
                st: [hashStateOfCity],
                ct: [hashCity],
                fbc: dataUTM.fbc,
                fbp: dataUTM.fbp,
                client_ip_address: dataUTM.client_ip_address,
              },
              custom_data: {
                currency: "BRL",
                value: productValue,
                client_ip_address: dataUTM.client_ip_address,
                fbc: dataUTM.fbc,
                fbp: dataUTM.fbp,
                city: dataCustomer.city,
              },
            },
          ],
        };

        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        try {
          const response = await axios.post(url, dataEvent, config);
          console.log("Resposta da requisição:", response.data);
          results.push(response.data);
        } catch (error) {
          console.error("Erro na requisição:", error.response.data);
          results.push({ error: error.response.data });
        }
      } else {
        return false;
      }
    }
    return results;
  } catch (error) {
    let messageError = `Opss error ${error}`;
    return messageError;
  }
};

const eventInitiateCheckout = async (dataCollection) => {
  try {
    console.log("Entrou na iniciação do evento");

    const { dataPixesFacebook, dataCustomer, dataUTM, productValue } =
      dataCollection;
    const results = [];

    for (const pixel of dataPixesFacebook) {
      const shouldSendEvent = pixel.status === "active";

      if (shouldSendEvent) {
        const hashName = crypto
          .createHash("sha256")
          .update(dataCustomer.name)
          .digest("hex");
        const hasEmail = crypto
          .createHash("sha256")
          .update(dataCustomer.email)
          .digest("hex");
        const hashPhone = crypto
          .createHash("sha256")
          .update(dataCustomer.cellphone)
          .digest("hex");
        const hashLastName = crypto
          .createHash("sha256")
          .update(dataCustomer.lastName)
          .digest("hex");
        const hashGener = crypto
          .createHash("sha256")
          .update(dataCustomer.gener)
          .digest("hex");
        const hashDateBorn = crypto
          .createHash("sha256")
          .update(dataCustomer.dateBorn)
          .digest("hex");
        const hashCodCEP = crypto
          .createHash("sha256")
          .update(dataCustomer.cep)
          .digest("hex");
        const hashStateOfCity = crypto
          .createHash("sha256")
          .update(dataCustomer.stateOfCity)
          .digest("hex");
        const hashCity = crypto
          .createHash("sha256")
          .update(dataCustomer.city)
          .digest("hex");

        const url = `https://graph.facebook.com/v16.0/${pixel.pixelID}/events?access_token=${pixel.tokenPixelID}`;

        const dataEvent = {
          data: [
            {
              event_name: "InitiateCheckout",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              content_type: "product",
              user_data: {
                em: [hasEmail],
                ph: [hashPhone],
                fn: [hashName],
                ge: [hashGener],
                ln: [hashLastName],
                db: [hashDateBorn],
                zp: [hashCodCEP],
                st: [hashStateOfCity],
                ct: [hashCity],
                fbc: dataUTM.fbc,
                fbp: dataUTM.fbp,
                client_ip_address: dataUTM.client_ip_address,
              },
              custom_data: {
                currency: "BRL",
                value: productValue,
                client_ip_address: dataUTM.client_ip_address,
                fbc: dataUTM.fbc,
                fbp: dataUTM.fbp,
                city: dataCustomer.city,
              },
            },
          ],
        };

        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        try {
          const response = await axios.post(url, dataEvent, config);
          console.log("Resposta da requisição:", response.data);
          results.push(response.data);
        } catch (error) {
          console.error("Erro na requisição:", error.response.data);
          results.push({ error: error.response.data });
        }
      }
    }

    return results;
  } catch (error) {
    console.error(`Opss error ${error}`);
    throw error;
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

module.exports = {
  sendFacebookPurchaseEvent,
  eventPurchase,
  eventInitiateCheckout,
};
