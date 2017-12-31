const got = require('got');
const cheerio = require('cheerio');

const { label } = require('./utils/selectors');
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

  let date = parseDate($(label('Date'), $middleFrame).text().trim());
  let clazz = $(label('CompClass'), $middleFrame).text().trim();

  let $validResult = $('[id$="pnlValidResult"]', $middleFrame);

  let taskDescription = $(label('TaskDescription'), $validResult).text().trim();
  let remark = $(label('Remark'), $validResult).text().trim();

  let $rows = $validResult.find('table').eq(0).find('tr').slice(1);
  let results = $rows.map((i, el) => parseResult($(el))).get();

  return { competition, date, 'class': clazz, taskDescription, remark, results };
}

function parseResult($result) {
  let rank = $result.find(label('DayRank')).text().trim() || null;
  if (rank) {
    rank = parseInt(rank, 10);
  }

  let competitionId = $result.find(label('WBK')).text().trim() || null;
  let name = $result.find(label('Name')).text().trim() || null;
  let country = $result.find(label('Country')).text().trim() || null;
  let glider = $result.find(label('Glider')).text().trim() || null;
  let taskStartTime = $result.find(label('StartGate')).text().trim() || null;
  let time = parseTime($result.find(label('TotalTime')).text());
  let distance = $result.find(label('DistTrack')).text().trim() || null;
  if (distance) {
    distance = parseFloat(distance);
  }

  let speed = $result.find(label('vTask')).text().trim() || null;
  if (speed) {
    speed = parseFloat(speed);
  }

  let penaltyPoints = $result.find(label('Penlty')).text().trim() || '0';
  if (penaltyPoints) {
    penaltyPoints = parseInt(penaltyPoints, 10);
  }

  let points = $result.find(label('DayPoints')).text().trim() || null;
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
