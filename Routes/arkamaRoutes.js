const express = require("express");
const router = express.Router();
const arkamaController = require("../Controller/arkamaController");

router.post("/arkama", arkamaController.createNewOrderInArkama);

module.exports = router;
