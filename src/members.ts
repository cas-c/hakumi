import Discord, { GuildMember } from "discord.js";
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

export const joinSOL = (message: Discord.Message) => {
    message.member.roles.add([message.member.guild.roles.get(config.sol.role)]);
    if (message.deletable) message.delete();
};

export const leaveSOL = (message: Discord.Message) => {
    message.member.roles.remove([message.guild.roles.get(config.sol.role)]);
    if (message.deletable) message.delete();
};
