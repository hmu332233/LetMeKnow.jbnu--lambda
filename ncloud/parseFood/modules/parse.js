const cheerio = require('cheerio');

function parseTable($, $table) {
  const $trList = $table.find('tbody > tr');
  console.log($trList.length, '--')

  const menus = [];
  $trList.map((index, e1) => {
    const $tdList = $(e1).find('td');
    // console.log($tdList.length)
    $tdList.map((index, e2) => {

      const $liList = $(e2).find('li');

      if ($liList.length === 0) {
        menus.push($(e2).text());
      } else {
        const menusOfDay =  $liList.map((index, e) => $(e).text()).toArray();
        menus.push(menusOfDay.join('\n'))
      }

    });
  });

  console.log(menus)
  return menus;
}

function parseMenus(html) {
  const $ = cheerio.load(html);

  const $table = $('.menu_scrollArea table');
  const $jinsu = $table.eq(0);
  const $medi = $table.eq(1);
  const $hu = $table.eq(2);
  const $jungdam = $table.eq(3);
  
  const jinsuMenus = parseTable($, $jinsu);
  const mediMenus = parseTable($, $medi);
  const huMenus = parseTable($, $hu);
  const jungdamMenus = parseTable($, $jungdam);

  return {
    jinsuMenus,
    mediMenus,
    huMenus,
    jungdamMenus
  };
}

module.exports = {
  parseMenus,
  parseTable
}