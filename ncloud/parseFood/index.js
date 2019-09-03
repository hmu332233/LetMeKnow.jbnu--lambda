const { getHtml, sendSlackMessage } = require('./modules/utils');
const { connectDB, insertDocument } = require('./modules/db');
const { parseMenus } = require('./modules/parse');
const { normalize, normalizeHu } = require('./modules/normalize');

const DB_URL = '';
const PARSE_TARGET_URL = 'http://sobi.chonbuk.ac.kr/chonbuk/m040101';
const BOT_URL = '';

async function process() {
  const [html, client] = await Promise.all([
    getHtml(PARSE_TARGET_URL),
    connectDB(DB_URL)
  ]);

  const { jinsuMenus, mediMenus, studentHallMenus, huMenus, jungdamMenus } = parseMenus(html);

  const db = client.db('test');
  const dataList = [
    {
      collectionName: 'jinsu_menus',
      data: normalize('진수당', jinsuMenus)
    },
    {
      collectionName: 'medi_menus',
      data: normalize('의대', mediMenus)
    },
    {
      collectionName: 'student_hall_menus',
      data: normalize('학생회관', studentHallMenus)
    },
    {
      collectionName: 'hu_menus',
      data: normalizeHu('후생관', huMenus)
    },
    {
      collectionName: 'jungdam_menus',
      data: normalize('정담원', jungdamMenus)
    }
  ];

  for (let data of dataList) {
    await insertDocument(db, data);
  }

  await client.close();

  await sendSlackMessage({ url: BOT_URL, message: '파싱이 완료되었습니다.' });

  return { done: true };
}

function main(params) {
  return process();
}

exports.main = main;