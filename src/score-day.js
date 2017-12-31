const assert = require('assert');
const URL = require('url').URL;
const got = require('got');
const cheerio = require('cheerio');

const { parseDate } = require('./utils/date');

const BASE_URL = 'http://strepla.de/scs/Public/scoreDay.aspx';

const EXPECTED_COLUMNS = [
  '#',
  'CID',
  'Name',
  'Country',
  'Glider',
  'Departure [hh:mm:ss]',
  'Time [hh:mm:ss]',
  'Task [km]',
  'Speed [km/h]',
  'Penalty',
  'Points',
];

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
  let results = $rows.map((i, el) => {
    let rank = $('[id$="lblDayRank"]', el).text().trim() || null;
    if (rank) {
      rank = parseInt(rank, 10);
    }

    let competitionId = $('[id$="lblWBK"]', el).text().trim() || null;
    let name = $('[id$="lblName"]', el).text().trim() || null;
    let country = $('[id$="lblCountry"]', el).text().trim() || null;
    let glider = $('[id$="lblGlider"]', el).text().trim() || null;
    let taskStartTime = $('[id$="lblStartGate"]', el).text().trim() || null;
    let time = $('[id$="lblTotalTime"]', el).text().trim() || null;
    let distance = $('[id$="lblDistTrack"]', el).text().trim() || null;
    if (distance) {
      distance = parseFloat(distance);
    }

    let speed = $('[id$="lblvTask"]', el).text().trim() || null;
    if (speed) {
      speed = parseFloat(speed);
    }

    let penaltyPoints = $('[id$="lblPenlty"]', el).text().trim() || '0';
    if (penaltyPoints) {
      penaltyPoints = parseInt(penaltyPoints, 10);
    }

    let points = $('[id$="lblDayPoints"]', el).text().trim() || null;
    if (points) {
      points = parseInt(points, 10);
    }

    return { rank, competitionId, name, country, glider, taskStartTime, time, distance, speed, penaltyPoints, points };
  }).get();

  return {
    competition, date, 'class': clazz, taskDescription, remark, results };
}

function collapseWhitespace(str) {
  return str.replace(/[ \t\r\n]+/g, ' ');
}

module.exports = { scoreDay, parseScoreDay };
