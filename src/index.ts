import Discord from "discord.js";
import config from "./config";
const Hakumi = new Discord.Client();

Hakumi.on("ready", () => {
    console.log(`logged in as ${Hakumi.user.tag}.`);
});

Hakumi.login(config.token);
