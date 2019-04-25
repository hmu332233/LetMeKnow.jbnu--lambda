const axios = require('axios');

const { getHtml } = require('./modules/utils');
const { connectDB, insertDocument } = require('./modules/db');
const { parseMenus } = require('./modules/parse');
const { normalize } = require('./modules/normalize');

const DB_URL = '';
const PARSE_TARGET_URL = 'http://sobi.chonbuk.ac.kr/chonbuk/m040101';
const BOT_URL = '';

async function process() {
  const [html, client] = await Promise.all([
    getHtml(PARSE_TARGET_URL),
    connectDB(DB_URL)
  ]);

  const { jinsuMenus, mediMenus, studentHallMenus } = parseMenus(html);

  const db = client.db('menus');
  const dataList = [
    {
      collectionName: 'jinsu',
      data: normalize('진수당', jinsuMenus)
    },
    {
      collectionName: 'medi',
      data: normalize('의대', mediMenus)
    },
    {
      collectionName: 'studentHall',
      data: normalize('학생회관', studentHallMenus)
    }
  ];

  for (let data of dataList) {
    await insertDocument(db, data);
  }

  await client.close();

  return { done: true };
}

function main(params) {
  return process();
}

exports.main = main;