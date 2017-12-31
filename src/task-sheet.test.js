const fs = require('fs');
const path = require('path');
const { parseTaskSheet } = require('./task-sheet');

const FIXTURE_PATH = path.join(__dirname, '..', '__fixtures__', 'tasks');

describe('taskSheet', () => {
  for (let fileName of fs.readdirSync(FIXTURE_PATH)) {
    test(fileName.replace(/\.html$/, ''), () => {
      let body = fs.readFileSync(path.join(FIXTURE_PATH, fileName));
      expect(parseTaskSheet(body)).toMatchSnapshot();
    });
  }
});
