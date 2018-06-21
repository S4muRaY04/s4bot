const fs = require("fs");
const got = require("got");
const execFile = require("child_process").execFile;

const isWin = /^win/.test(process.platform);

run = (url, args, options) => {
  return new Promise((resolve, reject) => {
    let binaryPath = __dirname + "/bin/youtube-dl";
    args.push(url);
    if (isWin) binaryPath += ".exe";
    if (!fs.existsSync(binaryPath)) {
      reject("Couldn't find youtube-dl binary. Try running 'npm run updateytdl'");
    };
    execFile(binaryPath, args, options, (error, stdout, stderr) => {
      if (error) reject(error);
      let data = stdout.trim();
      resolve(data);
    });
  });

};

run.downloadBinary = () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(__dirname + "/bin")) fs.mkdirSync(__dirname + "/bin");
    const startTime = new Date().getTime();
    let url, filePath;
    if (isWin) {
      url = "https://yt-dl.org/downloads/latest/youtube-dl.exe";
      filePath = __dirname + "/bin/youtube-dl.exe";
    } else {
      url = "https://yt-dl.org/downloads/latest/youtube-dl";
      filePath = __dirname + "/bin/youtube-dl";
    }
    got(url, {followRedirect: true, encoding: null})
      .then(resp => {
        fs.writeFileSync(filePath, resp.body, {mode: 0755});
        resolve((new Date().getTime() - startTime)/1000);
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports = run;