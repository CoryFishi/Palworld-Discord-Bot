const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { sendLog } = require("../helpers/logHelper");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleForceStop(interaction) {
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
    // Send POST request to force stop the server
    const response = await axios.post(
      `${API_BASE_URL}/stop`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      await interaction.reply({
        content: "Server has been forcefully stopped!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "Failed to force stop the server.",
        flags: MessageFlags.Ephemeral,
      });
    }
    await sendLog(
      interaction,
      `${interaction.user.username} forcefully stopped the server.`
    );
  } catch (error) {
    console.error(`Error stopping the server: ${error.message}`);
    await interaction.reply({
      content: `Error stopping the server: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleForceStop;
