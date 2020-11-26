const log4js = require(`log4js`);
log4js.configure(`./log4js.json`);
const log = log4js.getLogger('index');
const assert = require('assert').strict;
const Twitter = require('twitter-v2');
const {cleanExit, sleep} = require('./libraries/helpers');
const delay = 60 * 1000;

assert(process.env.TWITTER_API_KEY, 'Please define env var TWITTER_API_KEY');
assert(process.env.TWITTER_SECRET_KEY, 'Please define env var TWITTER_SECRET_KEY');

let {storeTweet} = require('./libraries/disk');
if (process.env.STORAGE_MODE === 'COS') {
  storeTweet = require('./libraries/cos').storeTweet;
} else if (process.env.STORAGE_MODE === 'DISCOVERY') {
  storeTweet = require('./libraries/discovery').storeTweet;
} else if (process.env.STORAGE_MODE !== 'DISK') {
  log.warn('Invalid value in STORAGE_MODE env var: %s. Storing tweets on disk', process.env.STORAGE_MODE);
}

const client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_SECRET_KEY,
});

const listenStream = async () => {
  let stream;
  try {
    log.info('listening to tweet stream...');
    stream = client.stream('tweets/search/stream', {
      'expansions': ['author_id', 'geo.place_id', 'referenced_tweets.id'],
      'tweet.fields': ['id', 'text', 'source', 'in_reply_to_user_id', 'conversation_id', 'entities', 'context_annotations', 'author_id', 'created_at', 'lang', 'public_metrics', 'referenced_tweets', 'geo'],
      'user.fields': ['name', 'username', 'public_metrics', 'id', 'profile_image_url', 'verified'],
      'place.fields': ['country', 'country_code', 'full_name', 'place_type'],
    });

    process.once('SIGHUP', cleanExit(stream));
    process.once('SIGTERM', cleanExit(stream));
    process.once('SIGINT', cleanExit(stream));

    for await (const t of stream) {
      if (t.done) {
        break;
      } else if (t.errors) {
        log.error('ERRORS FROM STREAM', t.errors);
        break;
      } else {
        await storeTweet(t);
      }
    }
    stream.close();
    setTimeout(async () => await listenStream(), delay);
  } catch (error) {
    log.error('LISTEN STREAM: Error while receiving twitter from stream', error.message);
    stream.close();
    if (error.message.includes('This stream is currently at the maximum allowed connection limit')) {
      await sleep(delay);
      await listenStream();
    }
  }
};

const main = async () => {
  try {
    const rules = await client.get('tweets/search/stream/rules', {});
    log.info('RULES:', rules);
  } catch (error) {
    log.error('ERROR GETTING RULES', error);
  }

  await listenStream();
  await main();
};

main().then(() => log.info('done!'));
