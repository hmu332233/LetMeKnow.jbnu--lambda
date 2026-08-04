const { sendSlackMessage } = require('./modules/utils');
const { connectDB, insertDocument } = require('./modules/db');
const { requestWeeklyMenus, parseMenus } = require('./modules/parse');
const { normalize, normalizeHu, normalizeDormitory } = require('./modules/normalize');
const { createHistoryFile } = require('./modules/file');
const { requestAllDormitoryMenus } = require('./modules/parseDormitory');

const DB_URL = process.env.DB_URL;
const BOT_URL = process.env.BOT_URL;


async function main() {
  const [weeklyMenus, dormitoryMenus] = await Promise.all([
    requestWeeklyMenus(),
    requestAllDormitoryMenus()
  ]);

  const { dates, jinsuMenus, mediMenus, huMenus } = parseMenus(weeklyMenus);
  const { chambit, saebit, special } = dormitoryMenus;

  const client = await connectDB(DB_URL);
  const db = client.db('test');
  const dataList = [
    {
      collectionName: 'jinsu_menus',
      data: normalize('진수당', jinsuMenus, dates)
    },
    {
      collectionName: 'medi_menus',
      data: normalize('의대', mediMenus, dates)
    },
    {
      collectionName: 'hu_menus',
      data: normalizeHu('후생관', huMenus, dates)
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

  try {
    for (let data of dataList) {
      await insertDocument(db, data);
      createHistoryFile(data.collectionName, data.data);
    }
  } finally {
    await client.close();
  }

  await sendSlackMessage({ url: BOT_URL, message: '파싱이 완료되었습니다.' });

  return { done: true };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
