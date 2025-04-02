const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const CHANNEL_ID = process.env.CHANNEL_ID;
const { TextChannel } = require("discord.js");
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");

let lastSeenPlayers = [];

async function watchPlayers(bot) {
  const interval = 30000;

  setInterval(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players`, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
        timeout: 3000,
      });

      const currentPlayers = response.data.players.map((p) => p.name);

      const newPlayers = currentPlayers.filter(
        (name) => !lastSeenPlayers.includes(name)
      );
      const leftPlayers = lastSeenPlayers.filter(
        (name) => !currentPlayers.includes(name)
      );

      lastSeenPlayers = currentPlayers;

      const channel = await bot.channels.fetch(CHANNEL_ID);

      if (!channel || !(channel instanceof TextChannel)) {
        console.error(
          "Channel not found or is not a text channel:",
          CHANNEL_ID
        );
        return;
      }

      const currentTime = new Date().toLocaleString();

      // Log joined players
      for (const player of newPlayers) {
        await channel.send(`[${currentTime}] **Player joined:** ${player}`);
      }

      // Log left players
      for (const player of leftPlayers) {
        await channel.send(`[${currentTime}] **Player left:** ${player}`);
      }
    } catch (error) {
      console.error("Failed to check players:", error.message);
    }
  }, interval);
}

module.exports = { watchPlayers };
