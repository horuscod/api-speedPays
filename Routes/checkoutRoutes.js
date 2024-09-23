const express = require("express");
const router = express.Router();
const checkoutController = require("../Controller/checkoutController");
/* Middleware deactivated for approval testing */
const checkoutMiddleware = require("../Middleware/checkoutMiddleware");

router.post(
  "/checkout",

  checkoutController.createNewCheckout
);

router.post("/createNewClient", checkoutController.createNewClient);

router.post("/checkpayment", checkoutController.checkConfirmOrdemPAID);

router.post("/generatePix", checkoutController.createSimpleNewClient);

module.exports = router;
