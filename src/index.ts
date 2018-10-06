import Discord from "discord.js";
import config from "./config";
import { deleteEmbed, richerEmbed, simpleEmbed, warningEmbed } from "./embeds";
import { joinClub, leaveClub } from "./members";

const Hakumi = new Discord.Client();
let home: Discord.TextChannel;
let reactionTracker: Discord.Message;

Hakumi.on("ready", async () => {
    console.log(`logged in as ${Hakumi.user.tag}.`);
    home = (await Hakumi.channels.get(
        config.home.channel
    )) as Discord.TextChannel;
    if (config.env !== "dev") {
        home.send("logged in.");
    }
    if (config.reaction.listener) {
        reactionTracker = await (Hakumi.channels.get(
            config.reaction.channel
        ) as Discord.TextChannel).messages.fetch(config.reaction.message);
    }
});

const exists = (arr: string[], str: string) => arr.some(a => str.includes(a));
const exempt = (id: string) => exists(config.exempt, id);
const banned = (text: string) => exists(config.banned, text);
const warned = (text: string) =>
    exists(config.warned, text) && !exists(config.false, text);

const listen = (message: Discord.Message) => {
    if (exempt(message.author.id)) return false;
    const input = message.cleanContent.toLowerCase();
    if (banned(input)) {
        if (message.deletable) message.delete();
        if (message.member.bannable) message.member.ban();
        return true;
    }
    if (warned(input)) {
        home.send(warningEmbed(message));
        return true;
    }
    return false;
};

Hakumi.on("message", (message: Discord.Message) => {
    if (message.author.bot) return;
    if (message.guild && message.member && message.type === "DEFAULT") {
        const isExempt = exempt(message.author.id);
        if (message.cleanContent.toLowerCase().indexOf(config.club.code) > -1) {
            joinClub(message, isExempt);
            return;
        }
        if (message.cleanContent.toLowerCase() === config.club.unsub) {
            leaveClub(message, isExempt);
            return;
        }
        listen(message);
    }
});

Hakumi.on("messageDelete", (message: Discord.Message) => {
    if (exempt(message.author.id) || config.env === "dev") return;
    if (message.cleanContent.toLowerCase() === config.club.code) return;
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

const reactionEvents: any = {
    MESSAGE_REACTION_ADD: "customReactionAdd"
};

Hakumi.on("raw", async (event: any) => {
    if (!config.reaction.listener) return;
    if (!reactionEvents.hasOwnProperty(event.t)) return;
    const { d: data } = event;
    if (data.message_id !== config.reaction.message) return;
    const member = Hakumi.guilds
        .get(config.home.guild)
        .members.get(data.user_id);
    if (!member) return;
    if (!reactionTracker) {
        reactionTracker = await (Hakumi.channels.get(
            config.reaction.channel
        ) as Discord.TextChannel).messages.fetch(config.reaction.message);
    }
    if (member.roles.has(config.reaction.role)) return;
    const emojiKey = data.emoji.id || data.emoji.name;
    const reaction =
        reactionTracker.reactions.get(emojiKey) ||
        reactionTracker.reactions.add(data);
    Hakumi.emit(reactionEvents[event.t], reaction, member);
    if (reactionTracker.reactions.size === 1)
        reactionTracker.reactions.delete(emojiKey);
});

Hakumi.on(
    "customReactionAdd",
    (reaction: Discord.ReactionEmoji, member: Discord.GuildMember) => {
        member.roles.add([member.guild.roles.get(config.reaction.role)]);
    }
);

Hakumi.on("disconnect", () => console.log("disconnected"));
Hakumi.on("reconnecting", () => home.send("reconnected."));
Hakumi.on("error", error => {
    console.error(error);
    home.send(`<@${config.owner}> \n` + error.message);
});
Hakumi.on("warn", warning => {
    console.warn(warning);
    home.send(`<@${config.owner}> \n` + warning);
});

Hakumi.login(config.token);
