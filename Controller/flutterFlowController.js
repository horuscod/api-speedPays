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
module.exports = {
  getAllUsersInFirebase,
  getOneUserInFirebase,
};
