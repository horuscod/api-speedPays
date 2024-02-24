const fs = require('fs');
const path = require('path');

const logIpMiddleware = (req, res, next) => {
  const ip = req.ip;
  const logEntry = `IP: ${ip} - Time: ${new Date().toISOString()}\n`;
  fs.appendFile(path.join(__dirname, 'ip_log.txt'), logEntry, (err) => {
    if (err) {
      console.error('Failed to log IP:', err);
    }
  });
  next();
};

// Use o middleware antes das rotas
app.use(logIpMiddleware);
