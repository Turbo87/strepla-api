const fs = require('fs');
const path = require('path');
const { parseScoreDay } = require('./score-day');

const FIXTURE_PATH = path.join(__dirname, '..', '__fixtures__', 'scores');

describe('scoreDay', () => {
  for (let fileName of fs.readdirSync(FIXTURE_PATH)) {
    test(fileName.replace(/\.html$/, ''), () => {
      let body = fs.readFileSync(path.join(FIXTURE_PATH, fileName));
      expect(parseScoreDay(body)).toMatchSnapshot();
    });
  }
});
