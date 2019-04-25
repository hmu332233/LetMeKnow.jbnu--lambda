const axios = require('axios');

async function sendMessage({ url, message } = {}) {
  const data = {
    text: message
  };
  return await axios.post(url, data);
}

module.exports = {
  sendMessage
}