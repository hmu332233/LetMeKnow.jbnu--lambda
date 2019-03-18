const request = require('request');
const cheerio = require('cheerio');

function parseTable($, $table, { place }) {
  const $menus = $table.find('td[bgcolor=#ffffff]');

  const menus = $menus.map((index, element) => {
    const $element = $(element);
    $element.find('br').replaceWith("\n");
    return $element.text().trim();
  });
  return [
    { place, week: '월', time: '중식', category: '백반', menus: menus[0] },
    { place, week: '화', time: '중식', category: '백반', menus: menus[1] },
    { place, week: '수', time: '중식', category: '백반', menus: menus[2] },
    { place, week: '목', time: '중식', category: '백반', menus: menus[3] },
    { place, week: '금', time: '중식', category: '백반', menus: menus[4] },
  ]
}

function main(params) {
  request('http://sobi.chonbuk.ac.kr/chonbuk/m040101', (err, res, body) => {
    const $ = cheerio.load(body);

    const $table = $('#sub_right table');
    const $jinsu = $table.eq(0);
    const $medi = $table.eq(1);
    const $studentHall = $table.eq(2);
    const $hu = $table.eq(3);
    const $jungdam = $table.eq(4);
    
 
    console.log(parseTable($, $jinsu, { place: '진수당' }));
  });
}

main();

