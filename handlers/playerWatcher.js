const axios = require("axios");
const { Client, TextChannel } = require("discord.js");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const CHANNEL_ID = process.env.CHANNEL_ID;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");

let lastSeenPlayers = [];

async function watchPlayers(bot) {
  const interval = 120000;

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

      lastSeenPlayers = currentPlayers;

      if (newPlayers.length > 0) {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        if (!channel || !(channel instanceof TextChannel)) return;

        newPlayers.forEach((player) => {
          channel.send(`**Player joined:** ${player}`);
          console.log(`Player joined: ${player}`);
        });
      }
    } catch (error) {
      console.error("Failed to check players:", error.message);
    }
  }, interval);
}

module.exports = { watchPlayers };
