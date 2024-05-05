const cheerio = require('cheerio');

function parseTable($, $table) {
  const $trList = $table.find('tbody > tr');
  const menus = [];

  $trList.each((_, e1) => {
    const $tdList = $(e1).find('td');
    $tdList.each((_, e2) => {
      menus.push($(e2).text().trim());
    });
  });

  return menus;
}

function parseMenus(html) {
  const $ = cheerio.load(html);

  const $table = $('table.tblType03');
  const $jinsu = $table.eq(0);
  const $medi = $table.eq(1);
  const $hu = $table.eq(2);

  const jinsuMenus = parseTable($, $jinsu);
  const mediMenus = parseTable($, $medi);
  const huMenus = parseTable($, $hu);

  return {
    jinsuMenus,
    mediMenus,
    huMenus,
  };
}

module.exports = {
  parseMenus,
  parseTable,
};
