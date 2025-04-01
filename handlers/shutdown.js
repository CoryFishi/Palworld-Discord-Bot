const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { sendLog } = require("../helpers/logHelper");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleShutdown(interaction) {
  const waitTime = interaction.options.getInteger("waittime");
  const shutdownMessage =
    interaction.options.getString("message") || "Server is shutting down.";

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

    // Send POST request to shutdown the server with wait time and message
    const response = await axios.post(
      `${API_BASE_URL}/shutdown`,
      {
        waittime: waitTime,
        message: shutdownMessage,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      await interaction.reply({
        content: `Server will shut down in ${waitTime} seconds. Message: "${shutdownMessage}"`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "Failed to initiate shutdown.",
        flags: MessageFlags.Ephemeral,
      });
    }
    await sendLog(
      interaction,
      `${interaction.user.username} initiated a server shutdown with message: "${shutdownMessage}"`
    );
  } catch (error) {
    console.error(`Error initiating shutdown: ${error.message}`);
    await interaction.reply({
      content: `Error initiating shutdown: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleShutdown;
