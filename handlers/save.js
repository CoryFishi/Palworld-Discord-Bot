const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const CHANNEL_ID = process.env.CHANNEL_ID;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { sendLog } = require("../helpers/logHelper");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleSave(interaction) {
  try {
    // Check if the server is running
    const serverOnline = await checkServerStatus();
    if (!serverOnline) {
      return await interaction.reply({
        content: "The server is offline. Please start the server first.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // Defer the interaction to extend the time limit (up to 15 minutes)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Send POST request to save the game
    const response = await axios.post(
      `${API_BASE_URL}/save`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log("Game state has been saved successfully.");

      // Edit the original reply to indicate success
      await interaction.editReply({
        content: "Game state has been saved successfully!",
      });

      // Fetch the target channel using the channel ID from .env
      const targetChannel = await interaction.client.channels.fetch(CHANNEL_ID);

      if (targetChannel) {
        // Send a public message to the specified channel
        await targetChannel.send("**Server has been successfully saved!**");
        console.log("Save notification sent to the channel.");
      } else {
        console.error(
          "Error: Channel not found. Please check the channel ID in your .env file."
        );
      }
    } else {
      console.error("Failed to save the game state.");
      // Edit the original reply to indicate failure
      await interaction.editReply({
        content: "Failed to save the game state.",
      });
    }
    await sendLog(
      interaction,
      `${interaction.user.username} saved the game state.`
    );
  } catch (error) {
    console.error(`Error saving the game state: ${error.message}`);
    // Edit the original reply to show error details
    await interaction.editReply({
      content: `Error saving the game state: ${error.message}`,
    });
  }
}

module.exports = handleSave;
