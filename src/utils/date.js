function parseDate(date) {
  if (!date) { return null; }

  let match = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) { return null; }

  return `${match[3]}-${pad(match[1])}-${pad(match[2])}`;
}

function pad(str, length = 2) {
  while (str.length < length) {
    str = `0${str}`;
  }
  return str;
}

module.exports = { parseDate };
