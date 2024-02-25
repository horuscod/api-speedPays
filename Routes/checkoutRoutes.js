const express = require("express");
const router = express.Router();
const checkoutController = require("../Controller/checkoutController");

const checkoutMiddleware = require("../Middleware/checkoutMiddleware");

router.post(
  "/checkout",
  checkoutMiddleware.checkDomainMiddleware,
  checkoutController.createNewCheckout
);

router.post("/createNewClient", checkoutController.createNewClient);

module.exports = router;
