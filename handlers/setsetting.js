const fs = require("fs");
const axios = require("axios");
const API_BASE_URL = process.env.API_BASE_URL;
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const SETTINGS_PATH = process.env.SETTINGS_PATH;
const SERVER_PATH = process.env.SERVER_PATH;
const CHANNEL_ID = process.env.CHANNEL_ID;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { spawn } = require("child_process");
const { checkServerStatus } = require("../helpers/apiHelper");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");

async function handleSetSetting(interaction) {
  const key = interaction.options.getString("key");
  const value = interaction.options.getString("value");
  const username = interaction.user.username;

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
    // Defer the reply to allow enough time for long operations
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Read the INI file
    const settingsContent = fs.readFileSync(SETTINGS_PATH, "utf-8");

    // Check if the key exists in the file
    if (!settingsContent.includes(`${key}=`)) {
      return await interaction.editReply({
        content: `Setting **${key}** not found.`,
      });
    }

    // Notify that the server will be stopped
    await interaction.editReply({
      content: `Stopping the server to apply the new setting: **${key} = ${value}** in 60 seconds...`,
    });

    // Stop the server with a 60-second delay
    const shutdownResponse = await axios.post(
      `${API_BASE_URL}/shutdown`,
      {
        waittime: 60, // 60 seconds wait before shutdown
        message: `Server will shut down in 60 seconds to apply new settings.`,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (shutdownResponse.status === 200) {
      console.log("Server shutdown initiated successfully.");
      await interaction.editReply({
        content: "Server will shut down in 60 seconds. Please wait...",
      });
    } else {
      throw new Error("Failed to initiate server shutdown.");
    }

    // Wait for 65 seconds to ensure shutdown is complete
    await wait(65000); // 60 seconds + 5 extra to ensure shutdown is complete

    // Apply the updated settings AFTER shutdown
    applySettingsAfterShutdown(key, value);

    // Notify that settings have been updated
    await interaction.editReply({
      content: `Setting **${key}** updated to **${value}** successfully. Restarting the server in 5 seconds...`,
    });

    // Send a log message to the log channel
    await sendLog(interaction, key, value, username);

    // Wait for 5 seconds before restarting the server
    await wait(5000);

    // Restart the server with updated settings
    startServer(interaction);
  } catch (error) {
    console.error(`Error updating setting: ${error.message}`);
    await interaction.editReply({
      content: `Error updating setting: ${error.message}`,
    });
  }
}

// Helper function to apply settings after shutdown
function applySettingsAfterShutdown(key, value) {
  try {
    const settingsContent = fs.readFileSync(SETTINGS_PATH, "utf-8");

    // Update the setting with the new value
    const updatedContent = settingsContent.replace(
      new RegExp(`(${key}=)([^,]+)`),
      `$1${value}`
    );

    // Write the updated settings back to the INI file
    fs.writeFileSync(SETTINGS_PATH, updatedContent, "utf-8");
    console.log(`Setting "${key}" has been applied after shutdown.`);
  } catch (error) {
    console.error(`Error applying settings after shutdown: ${error.message}`);
  }
}

// Helper function to restart the server after settings are updated
function startServer(interaction) {
  try {
    // Start the server after applying the settings
    const serverProcess = spawn(SERVER_PATH, [], {
      detached: true,
      stdio: "ignore",
    });

    serverProcess.unref();
    console.log("Palworld server is restarting with updated settings...");
    interaction.followUp({
      content: "Palworld server is now restarting with the updated settings.",
    });
  } catch (error) {
    console.error(`Error restarting the server: ${error.message}`);
    interaction.followUp({
      content: `Error restarting the server: ${error.message}`,
    });
  }
}

// Helper function to send a log message to the log channel
async function sendLog(interaction, key, value, username) {
  try {
    const logChannel = await interaction.client.channels.fetch(CHANNEL_ID);

    if (logChannel) {
      await logChannel.send(
        `**${username}** changed **${key}** to **${value}**`
      );
      console.log(`Log sent to channel: ${CHANNEL_ID}`);
    } else {
      console.error("Error: Log channel not found.");
    }
  } catch (error) {
    console.error(`Error sending log: ${error.message}`);
  }
}

// Helper function to wait for a certain amount of time
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = handleSetSetting;
