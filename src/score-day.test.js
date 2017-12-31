const fs = require('fs');
const { parseScoreDay } = require('./score-day');

describe('scoreDay', () => {
  const TESTS = [
    'stoelln17-std-day1',
  ];

  for (let fixtureName of TESTS) {
    test(fixtureName, () => {
      let body = fs.readFileSync(`${__dirname}/../__fixtures__/${fixtureName}.html`);
      expect(parseScoreDay(body)).toMatchSnapshot();
    });
  }
});
