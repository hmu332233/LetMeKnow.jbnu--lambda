const axios = require('axios');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;

function parseTable($, $table, { place }) {
  const $menus = $table.find('td[bgcolor=#ffffff]');

  const menus = $menus.map((index, element) => {
    const $element = $(element);
    $element.find('br').replaceWith("\n");
    return $element.text().trim();
  });
  return {
    lunch: [
      { place, week: '월', time: '중식', category: '백반', menus: menus[0] },
      { place, week: '화', time: '중식', category: '백반', menus: menus[1] },
      { place, week: '수', time: '중식', category: '백반', menus: menus[2] },
      { place, week: '목', time: '중식', category: '백반', menus: menus[3] },
      { place, week: '금', time: '중식', category: '백반', menus: menus[4] },
    ],
    dinner: [
      { place, week: '월', time: '석식', category: '백반', menus: menus[5] },
      { place, week: '화', time: '석식', category: '백반', menus: menus[6] },
      { place, week: '수', time: '석식', category: '백반', menus: menus[7] },
      { place, week: '목', time: '석식', category: '백반', menus: menus[8] },
      { place, week: '금', time: '석식', category: '백반', menus: menus[9] },
    ],
  }
}

async function getHtml() {
  const { data } = await axios.get('http://sobi.chonbuk.ac.kr/chonbuk/m040101');
  return data;
}

function parseMenus(html) {
  const $ = cheerio.load(html);

  const $table = $('#sub_right table');
  const $jinsu = $table.eq(0);
  const $medi = $table.eq(1);
  const $studentHall = $table.eq(2);
  const $hu = $table.eq(3);
  const $jungdam = $table.eq(4);
  
  const jinsuData = parseTable($, $jinsu, { place: '진수당' });
  const mediData = parseTable($, $medi, { place: '의대' });
  const studentHallData = parseTable($, $studentHall, { place: '학생회관' });

  return {
    jinsuData,
    mediData,
    studentHallData
  };
}

async function connectDB() {
  const url = '';
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  return client;
}

async function insertDocument(db, { collectionName, data }) {
  const collection = db.collection(collectionName);
  await collection.insertOne(data);
}

async function process() {
  const html = await getHtml();
  const { jinsuData, mediData, studentHallData } = parseMenus(html);
  
  const client = await connectDB();
  const db = client.db('menus');

  await insertDocument(db, { collectionName: 'jinsu', data: jinsuData });
  await insertDocument(db, { collectionName: 'medi', data: mediData });
  await insertDocument(db, { collectionName: 'studentHall', data: studentHallData });

  client.close();

  return { done: true };
}

function main(params) {
  return process();
}

const BOT_URL = '';
function sendMessage({ message } = {}) {
  const options = {
    uri: BOT_URL,
    method: 'POST',
    json: {
      text: '파싱이 완료되었습니다.'
    }
  };
  request.post(options);
}

exports.main = main;