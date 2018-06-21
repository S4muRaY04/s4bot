const ytdl = require("./index.js");

let filename = `${new Date().getTime()}.%(ext)s`;

ytdl("https://youtu.be/q5weS3aY-Qc", ["-o", filename, "-x", "--audio-format=mp3", "--restrict-filenames", "--external-downloader=ffmpeg", "--audio-quality=96k"])
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });