const got = require('got');
const cheerio = require('cheerio');

const BASE_URL = 'http://strepla.de/scs/Public/taskSheet.aspx';

async function taskSheet(cID, className, date) {
  let response = await got(`${BASE_URL}?cID=${cID}&className=${className}&dateScoring=${date}&lang=en-US`);
  if (!response.url.match(/taskSheet\.aspx/)) { return null; }

  return parseTaskSheet(response.body);
}

function parseTaskSheet(body) {
  let $ = cheerio.load(body);

  let $taskTable = $('#ctl00_Content_idTaskDetails_ctl01_lblNr').closest('table');
  let $turnpoints = $taskTable.find('tr').slice(1);
  let turnpoints = $turnpoints.map((i, el) => parseTurnpoint($(el))).get();

  return { turnpoints };
}

function parseTurnpoint($turnpoint) {
  let number = $turnpoint.find('[id$="lblNr"]').text().trim();
  let name = $turnpoint.find('[id$="lblName"]').text().trim();
  let elevation = parseValue($turnpoint.find('[id$="lblElevation"]').text().trim());
  let distance = parseValue($turnpoint.find('[id$="lblDist"]').text().trim());
  let course = parseAngle($turnpoint.find('[id$="lblCourse"]').text().trim());
  let aatRadial1 = parseAngle($turnpoint.find('[id$="lblAATRadial1"]').text().trim());
  let aatRadial2 = parseAngle($turnpoint.find('[id$="lblAATRadial2"]').text().trim());
  let aatRadius = parseValue($turnpoint.find('[id$="lblAATRadius"]').text().trim());
  let latitude = parseGeoAngle($turnpoint.find('[id$="lblLat"]').text().trim());
  let longitude = parseGeoAngle($turnpoint.find('[id$="lblLon"]').text().trim());

  return { number, name, elevation, distance, course, aatRadial1, aatRadial2, aatRadius, latitude, longitude };
}

const VALUE_CONVERSIONS = [
  [/^(\d+(?:\.\d+)?) m$/, match => parseFloat(match[1])],
  [/^(\d+(?:\.\d+)?) km$/, match => parseFloat(match[1]) * 1000],
];

function parseValue(str) {
  if (!str) { return null; }

  for (let [re, fn] of VALUE_CONVERSIONS) {
    let match = str.match(re);
    if (match) {
      return fn(match);
    }
  }

  return null;
}

function parseAngle(str) {
  if (!str) { return null; }

  let match = str.match(/(\d+)°/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
}

function parseGeoAngle(str) {
  if (!str) { return null; }

  let match = str.match(/([NSEW])(\d+)°(\d+)'(\d+)''/);
  if (match) {
    let negative = ['S', 'W'].includes(match[1]);
    let value = parseFloat(match[2]) + parseFloat(match[2]) / 60 + parseFloat(match[3]) / (60 * 60);
    return negative ? -value : value;
  }

  return null;
}

module.exports = { taskSheet, parseTaskSheet };
