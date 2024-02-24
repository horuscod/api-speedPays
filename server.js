const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());



const allowedIps = ["123.45.67.89", "98.76.54.32"];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: function (req, res) {
    return allowedIps.includes(req.ip);
  },
});

app.use(limiter);

const fs = require("fs");
const path = require("path");

const logIpMiddleware = (req, res, next) => {
  const ip = req.ip;
  const logEntry = `IP: ${ip} - Time: ${new Date().toISOString()}\n`;
  fs.appendFile(path.join(__dirname, "ip_log.txt"), logEntry, (err) => {
    if (err) {
      console.error("Failed to log IP:", err);
    }
  });
  next();
};

// Use o middleware antes das rotas
app.use(logIpMiddleware);

app.get("/", (req, res) => {
  res.send("Olá, Hórus!");
});

const RoutersArkama = require("./Routes/arkamaRoutes");
const RoutersCheckout = require("./Routes/checkoutRoutes");
app.use(RoutersArkama);
app.use(RoutersCheckout);

app.listen(3003, (req, res) => {
  var message =
    "Irmão seguinte, se você chegou aqui, é porque é bem curioso para inicar uns teste. Essa é uma ideia de montar um processador de pagamento, se quiser entra em contato comigo, tira um print aqui e bora trocar uma ideia pow";
  console.log(message);
});