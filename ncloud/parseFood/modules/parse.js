const cheerio = require('cheerio');

function parseTable($, $table) {
  const $menus = $table.find('td[bgcolor=#ffffff]');

  const menus = $menus.map((index, element) => {
    const $element = $(element);
    $element.find('br').replaceWith("\n");
    return $element.text().trim();
  });

  return menus;
}

function parseMenus(html) {
  const $ = cheerio.load(html);

  const $table = $('#sub_right table');
  const $jinsu = $table.eq(0);
  const $medi = $table.eq(1);
  const $studentHall = $table.eq(2);
  const $hu = $table.eq(3);
  const $jungdam = $table.eq(4);
  
  const jinsuMenus = parseTable($, $jinsu);
  const mediMenus = parseTable($, $medi);
  const studentHallMenus = parseTable($, $studentHall);
  const huMenus = parseTable($, $hu);
  const jungdamMenus = parseTable($, $jungdam);

  return {
    jinsuMenus,
    mediMenus,
    studentHallMenus,
    huMenus,
    jungdamMenus
  };
}

module.exports = {
  parseMenus,
  parseTable
}