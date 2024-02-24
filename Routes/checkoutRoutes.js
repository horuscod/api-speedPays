const express = require("express");
const router = express.Router();
const checkoutController = require("../Controller/checkoutController");

router.post("/checkout", checkoutController.createNewCheckout);

router.post("/createNewClient", checkoutController.createNewClient);

module.exports = router;
