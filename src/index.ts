import Discord from "discord.js";
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
        .setColor("#7289da")
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp(new Date());
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

Hakumi.on("error", error => {
    console.error(error);
    home.send(error);
});

Hakumi.login(config.token);
