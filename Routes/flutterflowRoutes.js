const express = require("express");
const router = express.Router();
const flutterFlowController = require("../Controller/flutterFlowController");

const checkoutMiddleware = require("../Middleware/checkoutMiddleware");

router.post(
  "/flutterflow/authuser",
  checkoutMiddleware.checkKeyFlutterFlow,
  flutterFlowController.getOneUserInFirebase
);

module.exports = router;
