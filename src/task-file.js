const got = require('got');

const BASE_URL = 'http://www.strepla.de/scs/ws/createTaskFile.ashx';

/**
 * @param {string} type - The requested filetype, either 'StrePla' or 'SeeYou'.
*/
async function taskFile(cID, dayID, type) {
  let response = await got(`${BASE_URL}?cID=${cID}&dayID=${dayID}&type=${type}&lang=en-US`);
  if (!response.url.match(/createTaskFile\.ashx/)) { return null; }

  return response.body;
}

module.exports = { taskFile };
