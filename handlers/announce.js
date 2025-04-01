const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { sendLog } = require("../helpers/logHelper");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleAnnounce(interaction) {
  const messageContent = interaction.options.getString("message");

  if (!messageContent) {
    return interaction.reply({
      content: "Announcement message is required!",
      flags: MessageFlags.Ephemeral,
    });
  }
  // Check if the server is running
  const serverOnline = await checkServerStatus();
  if (!serverOnline) {
    return await interaction.reply({
      content: "The server is offline. Please start the server first.",
      flags: MessageFlags.Ephemeral,
    });
  }
  try {
    if (!isAdmin(interaction)) {
      return await handleUnauthorized(interaction);
    }

    // Send the announcement using POST request
    const response = await axios.post(
      `${API_BASE_URL}/announce`,
      {
        message: messageContent,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the announcement was successful
    if (response.status === 200) {
      await interaction.reply({
        content: `Announcement sent: **${messageContent}**`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "Failed to send the announcement.",
        flags: MessageFlags.Ephemeral,
      });
    }
    await sendLog(
      interaction,
      `${interaction.user.username} made an announcement: "${messageContent}"`
    );
  } catch (error) {
    console.error(`Error sending announcement: ${error.message}`);
    await interaction.reply({
      content: `Error sending the announcement: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleAnnounce;
