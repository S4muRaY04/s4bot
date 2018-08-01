const Discord = require('discord.js');
const botSettings = require('./includes/botsettings.json');
const YTDL = require('ytdl-core');
const bot = new Discord.Client();
const YoutubeDL = require('youtube-dl');

var Servers = {};

function play(connection, message) {
    var server = Servers[message.guild.id];

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
    server.istheresongs = "true";
    server.dispatcher.on("end", function() {
        if(server.queue[0]) play(connection, message);
        else server.istheresongs = "false";
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
    bot.user.setActivity("Bot by S4muRaY'#6861");
});
bot.login(botSettings.token);
console.log("Login in using token: " + botSettings.token);
console.log("Using command prefix: \"" + botSettings.prefix + "\"");


bot.on("message", async message => {
    if(!Servers[message.guild.id]) Servers[message.guild.id] = {
        queue: [],
        songname: [],
        requester: [],
        istheresongs: [],
        prefix: [botSettings.prefix]
    };
  //  var server = Servers[message.guild.id];
    if(message.author.bot)return;
    if(message.channel.type === "dm")return;
    var server = Servers[message.guild.id];
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(command === `${server.prefix}help`)
    {
        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.username)
            .setTitle("List of commands:")
            .addField(`${server.prefix}join`, `Spawn Me To Your Voice Channel`)
            .addField(`${server.prefix}play`, `Play a Song`)
            .addField(`${server.prefix}skip`, `Skip Current Song`)
            .addField(`${server.prefix}leave`, `Kick Me From The Channel`)
            .setColor("#FF0000")
            .setTimestamp();
       message.channel.send(embed);
    }
    if(command === `${server.prefix}join`)
    {
        if(message.guild.voiceConnection)
        {
          let embed = new Discord.RichEmbed()
              .setAuthor(message.author.username)
              .setTitle("Error!")
              .setDescription("I'm already in a channel!")
              .setColor("#FF0000")
              .setTimestamp();
         return message.channel.send(embed);
       }
        let embed = new Discord.RichEmbed()
           .setAuthor(message.author.username)
           .setTitle("Sucess!")
           .setDescription("Joined your channel!")
           .setColor("#FF0000")
           .setTimestamp();
        message.channel.send(embed);
        message.member.voiceChannel.join();
    }
    if(command === `${server.prefix}play`)
    {
        if(!message.guild.voiceConnection)
        {
          let embed = new Discord.RichEmbed()
              .setAuthor(message.author.username)
              .setTitle("Error!")
              .setDescription(`I'm not in a channel! Type ${server.prefix}join to spawn me!`)
              .setColor("#FF0000")
              .setTimestamp();
         return message.channel.send(embed);
        }
        if(!args[0]) {
            let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username)
                .setTitle("Error")
                .setDescription("Please provide me the link or the name of the song!")
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
        var search = args[0];
        if(!args[0].startsWith('http'))
        {

            search = `gvsearch1:${args}`;
        }
        console.log(search);
        message.channel.send(`Searching youtube for ${args}....`).then((msg) => {
          YoutubeDL.getInfo(search, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
              if(err || info.format_id == undefined || info.format_id.startsWith('0')) {
                return message.channel.send("Could not find your video!");
              }
              console.log(`Recived info: ${info}`);
              server.queue.push(info);
              server.songname.push(info.title);
              server.requester.push(message.author.username);

              msg.edit(`Added song ${info.title} by request of ${message.author.username}`);

              if(server.istheresongs !== "true")play(message.guild.voiceConnection, message);
        });
      })
    }
    if(command === `${server.prefix}skip`)
    {
        if(server.istheresongs !== "true")
        {
          let embed = new Discord.RichEmbed()
                  .setAuthor(message.author.username)
                  .setTitle("Error")
                  .setDescription(`There is no song running!`)
                  .setColor("#FF0000")
                  .setTimestamp();
          return message.channel.send(embed);
        }
        let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username)
                .setTitle("Queue Changed")
                .setDescription(`Skipped current song!`)
                .setColor("#FF0000")
                .setTimestamp();
        message.channel.send(embed);

        if(server.dispatcher) server.dispatcher.end();
    }
    if(command === `${server.prefix}leave`)
    {
        if(message.guild.voiceConnection)   {
          message.guild.voiceConnection.disconnect();
          message.channel.send("Goodbye!");
        }
    }
    if(command === `${server.prefix}prefix`)
    {
        if(!message.member.hasPermission("ADMINISTRATOR"))
        {
          let embed = new Discord.RichEmbed()
                  .setAuthor(message.author.username)
                  .setTitle("Error")
                  .setDescription(`It looks like you do not have permission to this command!`)
                  .setColor("#FF0000")
                  .setTimestamp();
           return message.channel.send(embed);
        }
        if(!args[0])
        {
          let embed = new Discord.RichEmbed()
                  .setAuthor(message.author.username)
                  .setTitle("Error")
                  .setDescription(`Please provide me a prefix to set!`)
                  .setColor("#FF0000")
                  .setTimestamp();
          return message.channel.send(embed);
        }
        server.prefix.shift();
        server.prefix.push(args[0]);
        let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username)
                .setTitle("Prefix Changed")
                .setDescription(`Current prefix is now: "${server.prefix}"`)
                .setColor("#FF0000")
                .setTimestamp();
        message.channel.send(embed);
    }
});

