const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handlePlayers(interaction) {
  try {
    // Check if the server is running
    const serverOnline = await checkServerStatus();
    if (!serverOnline) {
      return await interaction.reply({
        content: "The server is offline. Please start the server first.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Fetch online players
    const response = await axios.get(`${API_BASE_URL}/players`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    const players = response.data.players;

    if (players.length > 0) {
      const playerList = players.map((player) => `${player.name}`).join("\n");
      await interaction.reply({
        content: `**Online Players:**\n${playerList}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "No players are currently online.",
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    console.error(`Error fetching player list: ${error.message}`);
    await interaction.reply({
      content: "Failed to fetch player list.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handlePlayers;
