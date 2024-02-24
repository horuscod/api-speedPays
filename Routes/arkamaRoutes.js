const express = require("express");
const router = express.Router();
const arkamaController = require("../Controller/arkamaController");

router.post("/arkama", arkamaController.createNewOrderInArkama);

router.post("/webhook/arkama/:tokenID", arkamaController.postbackUpdateStatus);

module.exports = router;
