const axios = require("axios");
const API_BASE_URL = process.env.API_BASE_URL;
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleMetrics(interaction) {
  try {
    // Check if the server is running
    const serverOnline = await checkServerStatus();
    if (!serverOnline) {
      return await interaction.reply({
        content: "The server is offline. Please start the server first.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Fetch server metrics
    const response = await axios.get(`${API_BASE_URL}/metrics`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    const data = response.data;
    const metricsMessage = `
        **Server Metrics**
        🔹 Server FPS: ${data.serverfps}
        🔹 Current Players: ${data.currentplayernum}
        🔹 Max Players: ${data.maxplayernum}
        🔹 Server Frame Time: ${data.serverframetime} ms
        🔹 Server Uptime: ${formatUptime(data.uptime)}
        🔹 In-Game Days: ${data.days}
      `;

    await interaction.reply({
      content: metricsMessage,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error(`Error fetching server metrics: ${error.message}`);
    await interaction.reply({
      content: "Unable to retrieve server metrics.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

// Helper function to format uptime in seconds
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = handleMetrics;
