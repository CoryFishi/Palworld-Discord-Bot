const { exec } = require("child_process");
const { MessageFlags } = require("discord.js");

async function handleStatus(interaction) {
  exec('tasklist /FI "IMAGENAME eq PalServer.exe"', (error, stdout) => {
    if (error) {
      console.error(`Error fetching status: ${error.message}`);
      return interaction.reply({
        content: `Error checking server status: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (stdout.includes("PalServer.exe")) {
      interaction.reply({
        content: "Palworld server is **running**.",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      interaction.reply({
        content: "Palworld server is **not running**.",
        flags: MessageFlags.Ephemeral,
      });
    }
  });
}

module.exports = handleStatus;
