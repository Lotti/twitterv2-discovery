const log4js = require(`log4js`);
const delay = 60 * 1000;

/**
 * Closes stream then quits
 * @param {object} stream
 * @returns {function(): Promise<void>}
 */
module.exports.cleanExit = (stream) => {
  const log = log4js.getLogger('cleanExit');

  return async () => {
    log.info("Caught interrupt signal, closing stream...");
    await stream.close()
    log.info("Stream closed. Will exit now.");
    setTimeout(() => process.exit(), delay);
  };
};

/**
 * promise implementation of a sleep routine
 * @param {number} delay milliseconds
 * @returns {Promise}
 */
module.exports.sleep = (delay) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), delay);
  });
};

/**
 * calculates tweet length after removing #, @ and urls
 * @param {string} tweetText tweet text
 * @param {number} limit tweet text minimum length
 * @returns {null|string}
 */
module.exports.cleanTweet = (tweetText, limit) => {
  const log = log4js.getLogger('cleanTweet');

  let text = tweetText;
  text = text.replace(/#/g, '').replace(/@/g, '');
  text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  text = text.trim();

  if (text.length < limit) {
    log.warn(`Skipped tweet with less than ${limit} chars`, tweetText);
    return null;
  } else {
    return tweetText;
  }
};

/**
 * remap tweet object into an easier format
 * @param {object} tweet
 * @param {number} limit tweet text minimum length
 * @returns {null|object}
 */
module.exports.formatTweetToFile = (tweet, limit) => {
  const log = log4js.getLogger('formatTweetToFile');

  const tweetId = tweet.data.id;
  const dateFromTwitter = tweet.data.created_at;
  let textFromTwitter = module.exports.cleanTweet(tweet.data.text, limit);

  if (!textFromTwitter) {
    return null;
  }

  let locationFromTwitter;
  let countryFromTwitter;

  const filename = `${dateFromTwitter}_${tweetId}.json`;
  log.info(`TWEET ${filename} %j`, textFromTwitter);

  let typeFromTwitter = "tweet";
  if (tweet.data.referenced_tweets && tweet.data.referenced_tweets.length > 0) {
    if (tweet.data.referenced_tweets.find((r) => r.type === 'replied_to')) {
      typeFromTwitter = "reply";
    } else if (tweet.data.referenced_tweets.find((r) => r.type === 'quoted')) {
      typeFromTwitter = "quote";
    } else if (tweet.data.referenced_tweets.find((r) => r.type === 'retweeted')) {
      typeFromTwitter = "retweet";
    }
  }

  if (tweet.includes.places && tweet.includes.places.length > 0) {
    if (tweet.includes.places[0].full_name) {
      locationFromTwitter = tweet.includes.places[0].full_name;
    }
    if (tweet.includes.places[0].country) {
      countryFromTwitter = tweet.includes.places[0].country;
    }
  }

  const tweetUser = tweet.includes.users.find((u) => u.id === tweet.data.author_id);
  const tags = tweet.matching_rules.map((r) => r.tag);
  const tweetToStore = {
    post_id: `TW${tweetId}`,
    text: textFromTwitter,
    post_date: dateFromTwitter,
    source: 'Twitter',
    location: locationFromTwitter,
    country: countryFromTwitter,
    url: `https://twitter.com/${tweetUser.username}/status/${tweetId}`,
    language: tweet.data.lang,
    type: typeFromTwitter,
    author_id: tweet.data.author_id,
    author_followers: tweetUser.public_metrics.followers_count,
    author_friends: tweetUser.public_metrics.following_count,
    author_nickname: tweetUser.username,
    author_name: tweetUser.name,
    rules_tags: tags,
  };


  return {filename, tweetToStore, tags};
}