const request = require('request');
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

function getMenus(callback) {
  request('http://sobi.chonbuk.ac.kr/chonbuk/m040101', (err, res, body) => {
    const $ = cheerio.load(body);

    const $table = $('#sub_right table');
    const $jinsu = $table.eq(0);
    const $medi = $table.eq(1);
    const $studentHall = $table.eq(2);
    const $hu = $table.eq(3);
    const $jungdam = $table.eq(4);
    
    const jinsuData = parseTable($, $jinsu, { place: '진수당' });
    const mediData = parseTable($, $medi, { place: '의대' });
    const studentHallData = parseTable($, $studentHall, { place: '학생회관' });

    callback({
      jinsuData,
      mediData,
      studentHallData
    });
  });
}

async function insertDocument(db, { collectionName, data }) {
  const collection = db.collection(collectionName);
  await collection.insertOne(data);
  console.log('complete!', collectionName)
}

function main(params) {
  getMenus(({ jinsuData, mediData, studentHallData }) => {
  
    const url = '';
    MongoClient.connect(url, { useNewUrlParser: true }, async (err, client) => {

      console.log("Connected successfully to server");
    
      const db = client.db('menus');

      await insertDocument(db, { collectionName: 'jinsu', data: jinsuData});
      await insertDocument(db, { collectionName: 'medi', data: mediData});
      await insertDocument(db, { collectionName: 'studentHall', data: studentHallData});

      db.on('close', () => {
        console.log('Disconnected to server');
      });

      client.close();
    });
  });

  
}

main();