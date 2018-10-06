import Discord from "discord.js";
import config from "./config";

const joinClub = (message: Discord.Message, exemptFromDelete: boolean) => {
    const member = message.member;
    if (!member) return;
    if (
        message.cleanContent.toLowerCase() !== config.club.code &&
        !exemptFromDelete &&
        message.deletable
    )
        message.delete();
    member.roles.add([member.guild.roles.get(config.club.role)]);
};

export default joinClub;
