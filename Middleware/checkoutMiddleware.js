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

module.exports = { checkDomainMiddleware };
