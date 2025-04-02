const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");
const { sendLog } = require("../helpers/logHelper");

async function handleShutdown(interaction) {
  if (!isAdmin(interaction)) {
    return await handleUnauthorized(interaction);
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    const waitTime = interaction.options.getInteger("waittime");
    const shutdownMessage =
      interaction.options.getString("message") || "Server is shutting down.";

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
        timeout: 5000,
      }
    );

    if (response.status === 200) {
      const currentTime = new Date().toLocaleString();

      await interaction.editReply({
        content: `Server will shut down in ${waitTime} seconds.\nMessage: *${shutdownMessage}*`,
      });

      await sendLog(
        interaction,
        `[${currentTime}] **Shutdown Initiated:** ${interaction.user.username} initiated a shutdown with the message of "${shutdownMessage}" and a ${waitTime} second wait time.`
      );
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error("Shutdown error:", error.message);

    // Attempt to reply only if interaction is not already replied
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: `Error initiating shutdown: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.editReply({
        content: `Error initiating shutdown: ${error.message}`,
      });
    }
  }
}

module.exports = handleShutdown;
