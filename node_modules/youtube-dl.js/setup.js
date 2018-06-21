const ytdl = require("./index.js");

console.log("Downloading youtube-dl binary...");

ytdl.downloadBinary()
  .then(time => {
    console.log(`youtube-dl binary download finished (${time}s)`);
  });