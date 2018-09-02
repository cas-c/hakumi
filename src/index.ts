import Discord, { TextChannel } from "discord.js";
import { DateTime } from "luxon";
import config from "./config";

const Hakumi = new Discord.Client();
let home: Discord.TextChannel;

const simpleEmbed = (user: Discord.User, title: string) => {
    return new Discord.MessageEmbed()
        .setTitle(title)
        .addField(user.username, `${user} \n ${user.id}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp(new Date());
};

const richerEmbed = (member: Discord.GuildMember, title: string) => {
    return new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(
            `${member} ${member.displayName} ${member.user.username}#${
                member.user.discriminator
            }`,
        )
        .addField(
            "Created",
            DateTime.fromMillis(member.user.createdTimestamp).toFormat(
                "yyyy LLL dd HH:mm",
            ),
            true,
        )
        .addField(
            "Joined",
            DateTime.fromMillis(member.joinedTimestamp).toFormat(
                "yyyy LLL dd HH:mm",
            ),
            true,
        )
        .addField("Roles", member.roles.array().join(" "))
        .setColor(config.color)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp(new Date());
};
//  .setDescription(message.url);

const deleteEmbed = (message: Discord.Message) => {
    const response = new Discord.MessageEmbed()
        .setTitle(
            `Message from ${message.author.username} deleted in #${
                (message.channel as TextChannel).name
            }`,
        )
        .addField("Links", `${message.author} @ ${message.channel}`)
        .setTimestamp(new Date())
        .setColor(config.color);
    // Things that may or may not exist.
    if (message.cleanContent) {
        response.addField("Deleted Text", message.cleanContent);
    }
    const attachment = message.attachments.first();
    if (attachment && attachment.proxyURL) {
        response.addField(
            "Deleted Attachment",
            `[View Attachment](${attachment.proxyURL})`,
        );
    }
    return response;
};

Hakumi.on("ready", () => {
    console.log(`logged in as ${Hakumi.user.tag}.`);
    home = Hakumi.channels.get(config.home.channel) as Discord.TextChannel;
    if (config.env !== "dev") {
        home.send("logged in.");
    }
});

Hakumi.on("message", (message: Discord.Message) => {
    console.log(message.cleanContent);
});

Hakumi.on("messageDelete", (message: Discord.Message) => {
    home.send(deleteEmbed(message));
});

Hakumi.on("guildMemberAdd", (member: Discord.GuildMember) => {
    home.send(richerEmbed(member, "Join"));
});

Hakumi.on("guildMemberRemove", (member: Discord.GuildMember) => {
    home.send(richerEmbed(member, "Part"));
});

Hakumi.on("guildBanAdd", (guild: Discord.Guild, user: Discord.User) => {
    home.send(simpleEmbed(user, "Ban"));
});

Hakumi.on("guildBanRemove", (guild: Discord.Guild, user: Discord.User) => {
    home.send(simpleEmbed(user, "Unban"));
});

Hakumi.on("disconnect", () => home.send(`disconnecting... <@${config.owner}>`));
Hakumi.on("reconnecting", () => home.send("reconnected."));

Hakumi.on("error", error => {
    home.send(`<@${config.owner}> \n` + error.message);
});

Hakumi.on("warn", warning => {
    home.send(`<@${config.owner}> \n` + warning);
});

Hakumi.login(config.token);
