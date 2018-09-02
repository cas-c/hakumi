import Discord from "discord.js";
import config from "./config";
import { deleteEmbed, richerEmbed, simpleEmbed } from "./embeds";

const Hakumi = new Discord.Client();
let home: Discord.TextChannel;

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
