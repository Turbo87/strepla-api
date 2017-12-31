const got = require('got');
const cheerio = require('cheerio');

const { label } = require('./utils/selectors');
const regexParse = require('./utils/regex');
const { parseDate } = require('./utils/date');

const BASE_URL = 'http://strepla.de/scs/Public/taskSheet.aspx';

const RACING_PREFIX = 'Racing-Task (RT)';
const AAT_PREFIX = 'Speed Assigned Area Task (AAT)';

async function taskSheet(cID, className, date) {
  let response = await got(`${BASE_URL}?cID=${cID}&className=${className}&dateScoring=${date}&lang=en-US`);
  if (!response.url.match(/taskSheet\.aspx/)) { return null; }

  return parseTaskSheet(response.body);
}

function parseTaskSheet(body) {
  let $ = cheerio.load(body);

  let dateText = $('#ctl00_Content_lblDate').text().trim();
  let date = parseDate(dateText);
  let day = parseDay(dateText);

  let className = $('#ctl00_Content_lblClassName').text().trim();

  let description = $('#ctl00_Content_lblTaskDescription').text().trim();
  let parsedDescription = parseDescription(description);

  let $taskTable = $('#ctl00_Content_idTaskDetails_ctl01_lblNr').closest('table');
  let $turnpoints = $taskTable.find('tr').slice(1);
  let turnpoints = $turnpoints.map((i, el) => parseTurnpoint($(el))).get();

  return Object.assign({ date, day, className, description, turnpoints }, parsedDescription);
}

function parseDay(str) {
  return regexParse(str, /\s(\d+)\. Day/, match => parseInt(match[1], 10));
}

function parseDescription(str) {
  let type = null;
  let distance = null;
  let minDistance = null;
  let maxDistance = null;
  let minTime = null;

  if (!str) {
    // ignore

  } else if (str.startsWith(RACING_PREFIX)) {
    type = 'racing';

    let match = str.match(/(\d+(?:\.\d+)?) km/);
    if (match) {
      distance = parseFloat(match[1]) * 1000;
    }

  } else if (str.startsWith(AAT_PREFIX)) {
    type = 'aat';

    let match = str.match(/(\d+(?:\.\d+)?) km < D < (\d+(?:\.\d+)?) km/);
    if (match) {
      minDistance = parseFloat(match[1]) * 1000;
      maxDistance = parseFloat(match[2]) * 1000;
    }

    match = str.match(/\(Tmin=(\d+):(\d+)\)/);
    if (match) {
      minTime = parseInt(match[1], 10) * 3600 + parseInt(match[2], 10) * 60;
    }
  }

  return { type, distance, minDistance, maxDistance, minTime };
}

function parseTurnpoint($turnpoint) {
  let number = $turnpoint.find(label('lblNr')).text().trim();
  let name = $turnpoint.find(label('lblName')).text().trim();
  let elevation = parseValue($turnpoint.find(label('lblElevation')).text().trim());
  let distance = parseValue($turnpoint.find(label('lblDist')).text().trim());
  let course = parseAngle($turnpoint.find(label('lblCourse')).text().trim());
  let aatRadial1 = parseAngle($turnpoint.find(label('lblAATRadial1')).text().trim());
  let aatRadial2 = parseAngle($turnpoint.find(label('lblAATRadial2')).text().trim());
  let aatRadius = parseValue($turnpoint.find(label('lblAATRadius')).text().trim());
  let latitude = parseGeoAngle($turnpoint.find(label('lblLat')).text().trim());
  let longitude = parseGeoAngle($turnpoint.find(label('lblLon')).text().trim());

  return { number, name, elevation, distance, course, aatRadial1, aatRadial2, aatRadius, latitude, longitude };
}

const UNIT_CONVERSIONS = {
  'm': it => it,
  'km': it => it * 1000,
};

function parseValue(str) {
  return regexParse(str, /^(\d+(?:\.\d+)?) (m|km)$/, match => {
    let value = parseFloat(match[1]);
    let unit = match[2];
    return UNIT_CONVERSIONS[unit](value);
  });
}

function parseAngle(str) {
  return regexParse(str, /(\d+)°/, match => parseInt(match[1], 10));
}

function parseGeoAngle(str) {
  return regexParse(str, /([NSEW])(\d+)°(\d+)'(\d+)''/, match => {
    let negative = ['S', 'W'].includes(match[1]);
    let value = parseFloat(match[2]) + parseFloat(match[2]) / 60 + parseFloat(match[3]) / (60 * 60);
    return negative ? -value : value;
  });
}

module.exports = { taskSheet, parseTaskSheet };
