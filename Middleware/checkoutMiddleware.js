const checkDomainMiddleware = async (req, res, next) => {
  try {
    const origin = req.headers.origin || "";
    if (origin.startsWith("https://pay.speedpays.com.br")) {
      next();
    } else {
      return res.status(403).send("Acesso negado");
    }
  } catch (error) {
    return false;
  }
};

const checkKeyFlutterFlow = async (req, res, next) => {
  try {
    const { flutterKey } = req.body || "";
    if (flutterKey == "TPf9l73dBjFXJdXV9W4j") {
      next();
    } else {
      return res.status(403).send("Acesso negado");
    }
  } catch (error) {
    return false;
  }
};

module.exports = {checkDomainMiddleware, checkKeyFlutterFlow };
