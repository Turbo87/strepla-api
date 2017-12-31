const URL = require('url').URL;
const got = require('got');
const cheerio = require('cheerio');

const { label } = require('./utils/selectors');
const { parseDate } = require('./utils/date');

const BASE_URL = 'http://strepla.de/scs/Public/overview.aspx';

async function overview(cID) {
  let response = await got(`${BASE_URL}?cID=${cID}&lang=en-US`);
  if (!response.url.match(/overview\.aspx/)) { return null; }

  return parseOverviewPage(response.body);
}

function parseOverviewPage(body) {
  let $ = cheerio.load(body);

  let middleFrame = $('#middle_frame');

  let name = $('#ctl00_lblCompName').text().trim();
  let description = $('#ctl00_lblCompDescription').text().trim();
  let logoUrl = $('#ctl00_logoComp').attr('src');
  if (logoUrl) {
    logoUrl = new URL(logoUrl, BASE_URL);
  }

  let classes = $('tr.std_head td', middleFrame).slice(1).map((i, el) => $(el).text().trim()).get();

  let days = $('tbody tr', middleFrame).map((i, el) => {
    let $columns = $('td', el);
    let date = parseDate($columns.eq(0).find(label('lblDate')).text());

    let results = $columns.slice(1).get().reduce((results, el, i) => {
      let link = $(label('dayLink'), el).attr('href') || null;
      let idDay = null;
      if (link) {
        link = new URL(link, BASE_URL);
        idDay = link.searchParams.get('idDay') || null;
        if (idDay) {
          idDay = parseInt(idDay, 10);
        }
      }

      results[classes[i]] = { link, idDay };
      return results
    }, {});

    return { date, results };
  }).get();

  return { name, description, logoUrl, classes, days };
}

module.exports = { overview, parseOverviewPage };
