const axios = require("axios");
const admin = require("../firebaseConfig");
const db = admin.firestore();

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

module.exports = {
  createNewOrderInHofficePay,
};
