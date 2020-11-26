const log4js = require(`log4js`);
const log = log4js.getLogger('COS');
const assert = require('assert').strict;
const AWS = require('ibm-cos-sdk');
const {formatTweetToFile} = require('./helpers');

assert(process.env.COS_ENDPOINT, 'Please define env var COS_ENDPOINT');
assert(process.env.COS_API_KEY, 'Please define env var COS_API_KEY');
assert(process.env.COS_IBM_AUTH_ENDPOINT, 'Please define env var COS_IBM_AUTH_ENDPOINT');
assert(process.env.COS_SERVICE_INSTANCE_ID, 'Please define env var COS_SERVICE_INSTANCE_ID');
assert(process.env.COS_BUCKET_NAME, 'Please define env var COS_BUCKET_NAME');

const cos = new AWS.S3({
  endpoint: process.env.COS_ENDPOINT,
  apiKeyId: process.env.COS_API_KEY,
  ibmAuthEndpoint: process.env.COS_IBM_AUTH_ENDPOINT,
  serviceInstanceId: process.env.COS_SERVICE_INSTANCE_ID,
});

/**
 * Store tweet in object storage
 * @param {object} tweet
 * @returns {Promise<null|object>}
 */
module.exports.storeTweet = async (tweet) => {
  const t = formatTweetToFile(tweet, 50);

  if (t) {
    try {
      const cosOptions = {
        Bucket: process.env.COS_BUCKET_NAME,
        Key: t.filename,
        Body: JSON.stringify(t.tweetToStore),
        ContentType: 'application/json',
      };

      await cos.putObject(cosOptions).promise();
      log.info(`STORED: ${t.filename}`);
    } catch (e) {
      log.error(`ERROR: ${e.code} - ${e.message}\n`);
    }

    return t.tweetToStore;
  } else {
    return null;
  }
};
