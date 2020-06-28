const Twitter = require('twitter-lite');
const fetch = require('node-fetch')
const config = require('./config.json');

let client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

getNewTweets(config.user)

async function getNewTweets(username) {
    let user = await getUserId(username);
    var parameters = {follow: user}
    const stream = client.stream("statuses/filter", parameters)

    stream.on("start", () => console.log("Started"))
    stream.on("data", sendWebhook)
}

async function getUserId(username) {
    const user = await client.get("users/lookup", {screen_name: username});
    return user[0].id_str;
}

function sendWebhook(tweet) {
    if(tweet.in_reply_to_status_id && tweet.user.screen_name !== config.user) return;
    if(tweet.retweeted_status && tweet.user.screen_name !== config.user) return;

    let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
    let content = (config.mentionEveryone) ? `${url} @everyone` : url;
    let data = {
        content: content,
        username: tweet.user.screen_name,
        avatar_url: tweet.user.profile_image_url
    }

    fetch(config.webhook, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
}