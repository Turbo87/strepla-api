const fs = require('fs');
const path = require('path');
const { parseOverviewPage } = require('./overview');

const FIXTURE_PATH = path.join(__dirname, '..', '__fixtures__', 'overview');

describe('overview', () => {
  for (let fileName of fs.readdirSync(FIXTURE_PATH)) {
    test(fileName.replace(/\.html$/, ''), () => {
      let body = fs.readFileSync(path.join(FIXTURE_PATH, fileName));
      expect(parseOverviewPage(body)).toMatchSnapshot();
    });
  }
});
