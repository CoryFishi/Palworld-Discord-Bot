const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { sendLog } = require("../helpers/logHelper");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleUnban(interaction) {
  const playerName = interaction.options.getString("player");

  try {
    if (!isAdmin(interaction)) {
      return await handleUnauthorized(interaction);
    }
    // Check if the server is running
    const serverOnline = await checkServerStatus();
    if (!serverOnline) {
      return await interaction.reply({
        content: "The server is offline. Please start the server first.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // Send the unban request to the API
    const response = await axios.post(
      `${process.env.API_BASE_URL}/unban`,
      { name: playerName },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      await interaction.reply({
        content: `Player **${playerName}** has been unbanned.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: `Failed to unban player **${playerName}**.`,
        flags: MessageFlags.Ephemeral,
      });
    }
    await sendLog(
      interaction,
      `${interaction.user.username} unbanned player **${playerName}**.`
    );
  } catch (error) {
    console.error(`Error unbanning player: ${error.message}`);
    await interaction.reply({
      content: `Error unbanning player: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleUnban;
