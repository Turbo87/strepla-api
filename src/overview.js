const URL = require('url').URL;
const got = require('got');
const cheerio = require('cheerio');

const BASE_URL = 'http://strepla.de/scs/Public/overview.aspx';

async function overview(cID) {
  let response = await got(`${BASE_URL}?cID=${cID}`);

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
    let date = $columns.eq(0).find('span[id$="lblDate"]').text();

    let results = $columns.slice(1).get().reduce((results, el, i) => {
      let link = $('a[id$="dayLink"]', el).attr('href') || null;
      if (link) {
        link = new URL(link, BASE_URL);
      }

      results[classes[i]] = { link };
      return results
    }, {});

    return { date, results };
  }).get();

  return { name, description, logoUrl, classes, days };
}

module.exports = { overview, parseOverviewPage };
