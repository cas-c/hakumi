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

const exists = (arr: string[], str: string) => arr.some(a => str.includes(a));
const exempt = (id: string) => exists(config.exempt, id);
const banned = (text: string) => exists(config.banned, text);

const listen = (message: Discord.Message) => {
    if (exempt(message.author.id)) return false;
    if (banned(message.cleanContent)) {
        if (message.deletable) message.delete();
        if (message.member.bannable) message.member.ban();
        return true;
    }
    return true;
};

Hakumi.on("message", (message: Discord.Message) => {
    if (message.author.bot) return;
    let censored = false;
    if (message.guild && message.member && message.type === "DEFAULT") {
        censored = listen(message);
    }
    if (!censored) {
        console.log("continue");
    }
    if (message.cleanContent === "test censor") {
        Hakumi.emit("message", {
            author: { id: "unreal" },
            guild: message.guild,
            member: message.member,
            type: message.type,
        });
    }
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
