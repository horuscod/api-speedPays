const express = require("express");
const router = express.Router();
const checkoutController = require("../Controller/checkoutController");

const checkoutMiddleware = require("../Middleware/checkoutMiddleware");

router.post(
  "/checkout",

  checkoutController.createNewCheckout
);

router.post("/createNewClient", checkoutController.createNewClient);

router.post("/checkpayment", checkoutController.checkConfirmOrdemPAID);


module.exports = router;
