const _ = require('lodash');
const request = require('request');

const data = [
 {
   "name": "소프트웨어공학과",
   "location": "",
   "number": ""
 },
];

function main(params) {
  const userId = params.userRequest.user.id;
  const utterance = params.userRequest.utterance;
  
  sendMessage({
    id: userId,
    content: utterance
  });
  

  const name = params.action.detailParams.department_name.value;
  const info = _.find(data, { name });
  if (!info) {
    const regex = new RegExp(' ', 'g');
    info = _.find(data, infos => infos.name.replace(regex, '') === name); 
  }
  return {
    "version": "2.0",
    "data": info
  };
}

const BOT_URL = '';
function sendMessage({ id, content }) {
  request.post(BOT_URL, {json:{ id, content }})
}