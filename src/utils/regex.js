function regexParse(str, re, fn) {
  if (!str) { return null; }

  let match = str.match(re);
  if (match) {
    return fn(match);
  }

  return null;
}

module.exports = regexParse;
