function parseDate(date) {
  if (!date) { return null; }

  let match = date.match(/^(\d{2}).(\d{2}).(\d{4})/);
  if (!match) { return null; }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

module.exports = { parseDate };
