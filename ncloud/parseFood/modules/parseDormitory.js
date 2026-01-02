const cheerio = require('cheerio');
const axios = require('axios');
const https = require('https');

// 기숙사 타입 상수
const DORMITORY_TYPES = {
  CHAMBIT: 'chambit',    // 참빛관 (구 참슬관)
  SAEBIT: 'saebit',      // 새빛관 (구 기본형)
  SPECIAL: 'special'     // 특성화
};

// 기숙사별 URL
const DORMITORY_URLS = {
  [DORMITORY_TYPES.CHAMBIT]: 'https://likehome.jbnu.ac.kr/home/main/inner.php?sMenu=B7200',
  [DORMITORY_TYPES.SAEBIT]: 'https://likehome.jbnu.ac.kr/home/main/inner.php?sMenu=B7100',
  [DORMITORY_TYPES.SPECIAL]: 'https://likehome.jbnu.ac.kr/home/main/inner.php?sMenu=B7300'
};

// 요일 매핑
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * HTML을 요청하는 함수
 * @param {string} url
 * @returns {Promise<string>} HTML 문자열
 */
async function requestHTML(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    },
    timeout: 10000,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch HTML: ${res.status}`);
  }

  return res.data;
}

/**
 * 기숙사 식단 데이터를 파싱하는 함수 (새로운 형식)
 * Ruby의 parseDateNew 메서드와 동일한 로직
 * @param {string} html
 * @returns {Array} 메뉴 배열 (일주일치)
 */
function parseData(html) {
  const $ = cheerio.load(html);
  const menus = [];

  // 7일 x 3끼 데이터를 저장할 배열 (일~토)
  const data = Array.from({ length: 7 }, () => Array(3).fill(''));

  // #calendar > table > tbody의 tr들을 순회
  const tableBodyElement = $('#calendar > table > tbody');
  const tableRows = tableBodyElement.find('tr');

  tableRows.each((rowIndex, tr) => {
    const tableData = $(tr).find('td');
    tableData.each((colIndex, td) => {
      const text = $(td).text().trim();
      data[colIndex][rowIndex] = text;
    });
  });

  // 요일별로 메뉴 객체 생성
  DAYS_OF_WEEK.forEach((day, index) => {
    menus.push({
      dayOfWeek: day,
      breakfast: data[index][0] || '',
      lunch: data[index][1] || '',
      dinner: data[index][2] || ''
    });
  });

  return menus;
}

/**
 * 참빛관 식단을 가져오는 함수
 * @returns {Promise<Array>} 메뉴 배열
 */
async function requestMenu_Chambit() {
  const html = await requestHTML(DORMITORY_URLS[DORMITORY_TYPES.CHAMBIT]);
  return parseData(html);
}

/**
 * 새빛관 식단을 가져오는 함수
 * @returns {Promise<Array>} 메뉴 배열
 */
async function requestMenu_Saebit() {
  const html = await requestHTML(DORMITORY_URLS[DORMITORY_TYPES.SAEBIT]);
  return parseData(html);
}

/**
 * 특성화 기숙사 식단을 가져오는 함수
 * @returns {Promise<Array>} 메뉴 배열
 */
async function requestMenu_Special() {
  const html = await requestHTML(DORMITORY_URLS[DORMITORY_TYPES.SPECIAL]);
  return parseData(html);
}

/**
 * 모든 기숙사 식단을 가져오는 함수
 * @returns {Promise<Object>} 기숙사별 메뉴 객체
 */
async function requestAllDormitoryMenus() {
  const [chambitMenus, saebitMenus, specialMenus] = await Promise.all([
    requestMenu_Chambit(),
    requestMenu_Saebit(),
    requestMenu_Special()
  ]);

  return {
    chambit: chambitMenus,
    saebit: saebitMenus,
    special: specialMenus
  };
}

/**
 * 특정 기숙사 타입의 식단을 가져오는 함수
 * @param {string} type - 기숙사 타입 (chambit, saebit, special)
 * @returns {Promise<Array>} 메뉴 배열
 */
async function requestMenuByType(type) {
  const url = DORMITORY_URLS[type];
  if (!url) {
    throw new Error(`Unknown dormitory type: ${type}`);
  }
  const html = await requestHTML(url);
  return parseData(html);
}

module.exports = {
  DORMITORY_TYPES,
  DORMITORY_URLS,
  parseData,
  requestMenu_Chambit,
  requestMenu_Saebit,
  requestMenu_Special,
  requestAllDormitoryMenus,
  requestMenuByType
};
