const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { sendLog } = require("../helpers/logHelper");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");
const { MessageFlags } = require("discord.js");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleBan(interaction) {
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

    // Send the ban request to the API
    const response = await axios.post(
      `${API_BASE_URL}/ban`,
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
        content: `Player **${playerName}** has been banned.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: `Failed to ban player **${playerName}**.`,
        flags: MessageFlags.Ephemeral,
      });
    }
    await sendLog(
      interaction,
      `${interaction.user.username} banned player **${playerName}**.`
    );
  } catch (error) {
    console.error(`Error banning player: ${error.message}`);
    await interaction.reply({
      content: `Error banning player: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleBan;
