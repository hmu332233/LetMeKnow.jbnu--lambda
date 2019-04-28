const axios = require('axios');

async function getHtml(url) {
  const res = await axios.get(url);
  
  if (res.status !== 200) {
    return null;
  }
  return res.data;
}

async function sendSlackMessage({ url, message } = {}) {
  const data = {
    text: message
  };
  return await axios.post(url, data);
}

module.exports = {
  getHtml,
  sendSlackMessage
}