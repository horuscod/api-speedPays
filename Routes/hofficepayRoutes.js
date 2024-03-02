const express = require("express");
const router = express.Router();
const hofficePayController = require("../Controller/hofficepayController");

router.post(
  "/webhook/hofficepay/:tokenID",
  hofficePayController.postbackUpdateStatus
);

module.exports = router;
