import Discord from "discord.js";
import config from "./config";

export const joinClub = (
    message: Discord.Message,
    exemptFromDelete: boolean
) => {
    const member = message.member;
    if (!exemptFromDelete && message.deletable) message.delete();
    member.roles.add([member.guild.roles.get(config.club.role)]);
};

export const leaveClub = (
    message: Discord.Message,
    exemptFromDelete: boolean
) => {
    const member = message.member;
    if (!exemptFromDelete && message.deletable) message.delete();
    member.roles.remove([member.guild.roles.get(config.club.role)]);
};
