const { getHtml, sendSlackMessage } = require('./modules/utils');
const { connectDB, insertDocument } = require('./modules/db');
const { parseMenus } = require('./modules/parse');
const { normalize, normalizeHu, normalizeDormitory } = require('./modules/normalize');
const { createHistoryFile } = require('./modules/file');
const { requestAllDormitoryMenus } = require('./modules/parseDormitory');

const DB_URL = process.env.DB_URL;
const PARSE_TARGET_URL = process.env.PARSE_TARGET_URL || 'https://coopjbnu.kr/menu/week_menu.php';
const BOT_URL = process.env.BOT_URL;


async function main() {
  const [html, client, dormitoryMenus] = await Promise.all([
    getHtml(PARSE_TARGET_URL),
    connectDB(DB_URL),
    requestAllDormitoryMenus()
  ]);

  const { jinsuMenus, mediMenus, huMenus } = parseMenus(html);
  const { chambit, saebit, special } = dormitoryMenus;

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
      collectionName: 'hu_menus',
      data: normalizeHu('후생관', huMenus)
    },
    {
      collectionName: 'chambit_menus',
      data: normalizeDormitory('참빛관', chambit)
    },
    {
      collectionName: 'saebit_menus',
      data: normalizeDormitory('새빛관', saebit)
    },
    {
      collectionName: 'special_menus',
      data: normalizeDormitory('특성화', special)
    },
  ];

  for (let data of dataList) {
    await insertDocument(db, data);
    createHistoryFile(data.collectionName, data.data);
  }

  await client.close();

  await sendSlackMessage({ url: BOT_URL, message: '파싱이 완료되었습니다.' });

  return { done: true };
}

main();