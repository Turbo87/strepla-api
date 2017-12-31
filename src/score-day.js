const got = require('got');
const cheerio = require('cheerio');

const { parseDate } = require('./utils/date');

const BASE_URL = 'http://strepla.de/scs/Public/scoreDay.aspx';

async function scoreDay(cID, idDay) {
  let response = await got(`${BASE_URL}?cID=${cID}&idDay=${idDay}&lang=en-US`);
  if (!response.url.match(/scoreDay\.aspx/)) { return null; }

  return parseScoreDay(response.body);
}

function parseScoreDay(body) {
  let $ = cheerio.load(body);

  let $middleFrame = $('#middle_frame');

  let name = $('#ctl00_lblCompName').text().trim();
  let description = $('#ctl00_lblCompDescription').text().trim();
  let competition = { name, description };

  let date = parseDate($('[id$="lblDate"]', $middleFrame).text().trim());
  let clazz = $('[id$="lblCompClass"]', $middleFrame).text().trim();

  let $validResult = $('[id$="pnlValidResult"]', $middleFrame);

  let taskDescription = $('[id$="lblTaskDescription"]', $validResult).text().trim();
  let remark = $('[id$="lblRemark"]', $validResult).text().trim();

  let $rows = $validResult.find('table').eq(0).find('tr').slice(1);
  let results = $rows.map((i, el) => parseResult($(el))).get();

  return { competition, date, 'class': clazz, taskDescription, remark, results };
}

function parseResult($result) {
  let rank = $result.find('[id$="lblDayRank"]').text().trim() || null;
  if (rank) {
    rank = parseInt(rank, 10);
  }

  let competitionId = $result.find('[id$="lblWBK"]').text().trim() || null;
  let name = $result.find('[id$="lblName"]').text().trim() || null;
  let country = $result.find('[id$="lblCountry"]').text().trim() || null;
  let glider = $result.find('[id$="lblGlider"]').text().trim() || null;
  let taskStartTime = $result.find('[id$="lblStartGate"]').text().trim() || null;
  let time = parseTime($result.find('[id$="lblTotalTime"]').text());
  let distance = $result.find('[id$="lblDistTrack"]').text().trim() || null;
  if (distance) {
    distance = parseFloat(distance);
  }

  let speed = $result.find('[id$="lblvTask"]').text().trim() || null;
  if (speed) {
    speed = parseFloat(speed);
  }

  let penaltyPoints = $result.find('[id$="lblPenlty"]').text().trim() || '0';
  if (penaltyPoints) {
    penaltyPoints = parseInt(penaltyPoints, 10);
  }

  let points = $result.find('[id$="lblDayPoints"]').text().trim() || null;
  if (points) {
    points = parseInt(points, 10);
  }

  return { rank, competitionId, name, country, glider, taskStartTime, time, distance, speed, penaltyPoints, points };
}

function parseTime(str) {
  if (!str) { return null; }

  let match = str.trim().match(/^(\d+):(\d+):(\d+)/);
  if (match) {
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3])
  }

  return null;
}

module.exports = { scoreDay, parseScoreDay };
