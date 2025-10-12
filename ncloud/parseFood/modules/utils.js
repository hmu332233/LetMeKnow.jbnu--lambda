const axios = require('axios');

async function getHtml(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    },
    timeout: 10000
  });

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