const Discord = require('discord.js');
const botSettings = require('./includes/botsettings.json');
const YTDL = require('ytdl-core');
const bot = new Discord.Client();
const YoutubeDL = require('youtube-dl');

var servers = {};

function play(connection, message) {
    var server = servers[message.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0].webpage_url, {filter: "audioonly"}));

    let embed = new Discord.RichEmbed()
                .setAuthor(`Queue Changed`)
                .setDescription(`Playing now ${server.songname[0]}, requested by ${server.requester[0]}`)
                .setColor("#FF0000")
                .setTimestamp();
    message.channel.send(embed);

    server.queue.shift();
    server.songname.shift();
    server.requester.shift();

    server.dispatcher.on("end", function() {
        if(server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}

bot.on("ready", async () => {
    console.log("Bot is ready! Username: " + bot.user.username + "#" + bot.user.discriminator);

    bot.generateInvite(["ADMINISTRATOR"]).then(link => {
        console.log("Invite link: " + link);
    }).catch(err => {
        console.log("Error: " + error.stack);
    });

    bot.user.setStatus("online");
    bot.user.setGame("Bot by S4muRaY'#6861");
});
bot.login(botSettings.token);
console.log("Login in using token: " + botSettings.token);
console.log("Using command prefix: \"" + botSettings.prefix + "\"");


bot.on("message", async message => {
    if(message.author.bot)return;
    if(message.channel.type === "dm")return;

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(botSettings.prefix))return;

    if(command === `${botSettings.prefix}play`)
    {
        if(!args[0]) {
            let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username)
                .setTitle("Error")
                .setDescription("Please provide me a link or a name of the song!")
                .setColor("#FF0000")
                .setTimestamp();
            return message.channel.send(embed);
        }
        if(!message.member.voiceChannel) {
            let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username)
                .setTitle("Error")
                .setDescription("You must be in a voice channel!")
                .setColor("#FF0000")
                .setTimestamp();
            return message.channel.send(embed);
        }
        if(!servers[message.guild.id]) servers[message.guild.id] = {
            queue: [],
            songname: [],
            requester: []
        };
        var search = args[0];
        if(!args[0].startsWith('http'))
        {

            search = `gvsearch1:${args}`;
        }
        console.log(search);
        message.channel.send(`Searching for "${args}.....`).then((msg) => {
          YoutubeDL.getInfo(search, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
              if(err || info.format_id == undefined || info.format_id.startsWith('0')) {
                return message.channel.send("Could not find your video, error: " + err);
              }
              console.log(`Recived info: ${info}`);
              var server = servers[message.guild.id];
              server.queue.push(info);
              server.songname.push(info.title);
              server.requester.push(message.author.username);

              msg.edit(`Added song ${info.title} by request of ${message.author.username}`);

              if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                  play(connection, message);
                });
        });
      })
    }
    if(command === `${botSettings.prefix}skip`)
    {
        var server = servers[message.guild.id];

        let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username)
                .setTitle("Queue Changed")
                .setDescription(`Skipped current song!`)
                .setColor("#FF0000")
                .setTimestamp();
        message.channel.send(embed);

        if(server.dispatcher) server.dispatcher.end();
    }
    if(command === `${botSettings.prefix}leave`)
    {
        var server = servers[message.guild.id];

        if(server.guild.voiceConnection) server.guild.voiceConnection.disconnect();
    }
});
