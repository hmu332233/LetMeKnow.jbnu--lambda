const CAFETERIA_API_URL = 'https://coopjbnu.kr/function/get_cafeteria_menu.php';

const RESTAURANT_ALIASES = {
  jinsu: ['진수원', '진수당'],
  medi: ['의대식당', '의대'],
  hu: ['후생관']
};

function getKoreanDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getWeekdayDates(date = new Date()) {
  const [year, month, day] = getKoreanDateString(date).split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return Array.from({ length: 5 }, (_, index) => {
    const weekday = new Date(targetDate);
    weekday.setUTCDate(targetDate.getUTCDate() + mondayOffset + index);
    return weekday.toISOString().slice(0, 10);
  });
}

async function requestMenu(apiUrl, date, { now = 'Y' } = {}) {
  const apiOrigin = new URL(apiUrl).origin;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer': `${apiOrigin}/menu/week_menu.php`,
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: new URLSearchParams({
      date: date.replaceAll('-', ''),
      now
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cafeteria menu for ${date}: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== 'success' || !Array.isArray(data.list)) {
    throw new Error(`Invalid cafeteria menu response for ${date}`);
  }

  return data;
}

async function requestWeeklyMenus({
  apiUrl = CAFETERIA_API_URL,
  date = new Date()
} = {}) {
  const dates = getWeekdayDates(date);
  const targetDate = getKoreanDateString(date);
  const weeklyMenu = await requestMenu(apiUrl, targetDate, { now: 'N' });

  return dates.map((weekday) => ({
    date: weekday,
    status: weeklyMenu.status,
    list: weeklyMenu.list.filter(({ date: menuDate }) => menuDate === weekday)
  }));
}

function findRestaurant(data, aliases) {
  return data.list.find(({ restNm = '' }) => (
    restNm && aliases.some((alias) => restNm.includes(alias) || alias.includes(restNm))
  ));
}

function findDiet(data, aliases, cate1, cate3Matcher = () => true) {
  const restaurant = findRestaurant(data, aliases);
  const menu = restaurant?.subData?.find((item) => (
    item.cate1 === cate1 && cate3Matcher(item.cate3 || '')
  ));

  return menu?.diet || undefined;
}

function parseRegularMenus(weeklyMenus, aliases) {
  const lunch = weeklyMenus.map((data) => findDiet(data, aliases, '점심'));
  const dinner = weeklyMenus.map((data) => findDiet(data, aliases, '석식'));
  return [...lunch, ...dinner];
}

function parseHuMenus(weeklyMenus) {
  const menus = Array(35).fill(undefined);

  weeklyMenus.forEach((data, index) => {
    menus[index] = findDiet(data, RESTAURANT_ALIASES.hu, '조식');
    menus[5 + index] = findDiet(
      data,
      RESTAURANT_ALIASES.hu,
      '점심',
      (category) => category.includes('찌개')
    );
    menus[10 + index] = findDiet(
      data,
      RESTAURANT_ALIASES.hu,
      '점심',
      (category) => category === '돌솥'
    );
    menus[15 + index] = findDiet(
      data,
      RESTAURANT_ALIASES.hu,
      '점심',
      (category) => category === '특식'
    );
    menus[30 + index] = findDiet(
      data,
      RESTAURANT_ALIASES.hu,
      '점심',
      (category) => category === '샐러드'
    );
  });

  return menus;
}

function parseMenus(weeklyMenus) {
  return {
    dates: weeklyMenus.map(({ date, list }) => date || list[0]?.date),
    jinsuMenus: parseRegularMenus(weeklyMenus, RESTAURANT_ALIASES.jinsu),
    mediMenus: parseRegularMenus(weeklyMenus, RESTAURANT_ALIASES.medi),
    huMenus: parseHuMenus(weeklyMenus)
  };
}

module.exports = {
  CAFETERIA_API_URL,
  getKoreanDateString,
  getWeekdayDates,
  requestMenu,
  requestWeeklyMenus,
  parseMenus
};
