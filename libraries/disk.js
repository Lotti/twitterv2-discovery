const log4js = require(`log4js`);
const log = log4js.getLogger('Disk');
const path = require('path');
const fs = require('fs-extra');
const {formatTweetToFile} = require('./helpers');

const DIR_PATH = 'tweets';
fs.ensureDirSync(DIR_PATH);

/**
 * Store tweet in a folder
 * @param {object} tweet
 * @returns {Promise<null|object>}
 */
module.exports.storeTweet = async (tweet) => {
  const t = formatTweetToFile(tweet, 50);

  if (t) {
    try {
      let subpath = 'none';
      if (t.tags.length === 1) {
        subpath = t.tags[0];
      } else if (t.tags.length > 1) {
        subpath = 'multiple';
      }

      await fs.ensureDir(path.join(DIR_PATH, subpath));
      const filePath = path.join(DIR_PATH, subpath, t.filename);
      await fs.writeJson(filePath, t.tweetToStore, {spaces: 2});
      log.info(`STORED: ${t.filename}`);
    } catch (e) {
      log.error(`ERROR: ${e.code} - ${e.message}\n`);
    }

    return t.tweetToStore;
  } else {
    return null;
  }
};
