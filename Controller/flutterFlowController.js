const admin = require("../firebaseConfig");
const db = admin.firestore();

const getAllUsersInFirebase = async (req, res) => {
  try {
    const docRef = db.collection("users");
    const docUser = await docRef.get();
  } catch (error) {
    return res.status(200).json(error);
  }
};

const getOneUserInFirebase = async (req, res) => {
  try {
    const { hashUser } = req.body;
    const docRef = db.collection("users").doc(hashUser);
    const docUser = await docRef.get();
    if (docUser.exists) {
      const dataUser = docUser.data();
      return res.status(200).json(dataUser);
    } else {
      return res.status(200).json({ message: "Não existe esse usuário mano" });
    }
  } catch (error) {
    return res.status(200).json(error);
  }
};

const getAllCustomerByUserUID = async (req, res) => {
  try {
    const { uidOrdensDocument } = req.body;
    const docRef = db.collection("ordens").doc(uidOrdensDocument);
    const docOrdem = await docRef.get();
    if (docOrdem.exists) {
      const dataOrdem = docOrdem.data();
      return res.status(200).json(dataOrdem);
    } else {
      return res
        .status(200)
        .json({ message: "Ainda esse usuário não registrou nenhum cliente" });
    }
  } catch (error) {
    return res.status(200).json(error);
  }
};
module.exports = {
  getAllUsersInFirebase,
  getOneUserInFirebase,
  getAllCustomerByUserUID,
};
