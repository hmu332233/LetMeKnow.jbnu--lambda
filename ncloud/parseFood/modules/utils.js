async function getHtml(url) {
  const res = await axios.get(url);
  
  if (res.status !== 200) {
    return null;
  }
  return res.data;
}

module.exports = {
  getHtml
}