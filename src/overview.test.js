const fs = require('fs');
const { parseOverviewPage } = require('./overview');

describe('overview', () => {
  const TESTS = ['ec17', 'lev17'];

  for (let fixtureName of TESTS) {
    test(fixtureName, () => {
      let body = fs.readFileSync(`${__dirname}/../__fixtures__/${fixtureName}-overview.html`);
      expect(parseOverviewPage(body)).toMatchSnapshot();
    });
  }
});
