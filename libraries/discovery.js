const log4js = require(`log4js`);
const log = log4js.getLogger('Discovery');
const assert = require('assert').strict;
const { IamAuthenticator } = require('ibm-watson/auth');
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const {formatTweetToFile} = require('./helpers');

assert(process.env.DISCOVERY_ENDPOINT, 'Please define env var DISCOVERY_ENDPOINT');
assert(process.env.DISCOVERY_API_KEY, 'Please define env var DISCOVERY_API_KEY');
assert(process.env.DISCOVERY_COLLECTION_ID, 'Please define env var DISCOVERY_COLLECTION_ID');
assert(process.env.DISCOVERY_ENVIRONMENT_ID, 'Please define env var DISCOVERY_ENVIRONMENT_ID');

const discovery = new DiscoveryV1({
  version: '2019-04-30',
  authenticator: new IamAuthenticator({
    apikey: process.env.DISCOVERY_API_KEY,
  }),
  serviceUrl: process.env.DISCOVERY_ENDPOINT,
});

/**
 * Store tweet in discovery
 * @param {object} tweet
 * @returns {Promise<null|object>}
 */
module.exports.storeTweet = async (tweet) => {
  const t = formatTweetToFile(tweet, 50);

  if (t) {
    try {
      const params = {
        environmentId: process.env.DISCOVERY_ENVIRONMENT_ID,
        collectionId: process.env.DISCOVERY_COLLECTION_ID,
        file: Buffer.from(JSON.stringify(t.tweetToStore), `utf8`),
        filename: t.tweetToStore.post_id,
        fileContentType: `application/json`,
        documentId: t.tweetToStore.post_id,
      };

      await discovery.updateDocument(params);
      log.info(`STORED: ${t.filename}`);
    } catch (e) {
      log.error(`ERROR: ${e.code} - ${e.message}\n`);
    }

    return t.tweetToStore;
  } else {
    return null;
  }
};
