const fs = require('fs');

const mkdir = (dirPath) => {
  const isExists = fs.existsSync(dirPath);
  if(!isExists) {
    fs.mkdirSync(dirPath, { recursive: true } );
  }
}

exports.createHistoryFile = (key, data) => {
  const dateString = new Date().toISOString().slice(0, 10);

  const lastObj = {
    date: dateString,
  };
  
  mkdir(`./history/${key}`);
  fs.writeFileSync(`./history/${key}/last.json`, JSON.stringify(lastObj));
  fs.writeFileSync(`./history/${key}/${dateString}.json`, JSON.stringify(data));
}