const axios = require("axios");
const SERVER_PATH = process.env.SERVER_PATH;
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { spawn } = require("child_process");
const { sendLog } = require("../helpers/logHelper");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleRestart(interaction) {
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
    // Step 1: Save the game state
    await interaction.reply({
      content: "Saving the game state...",
      flags: MessageFlags.Ephemeral,
    });
    const saveResponse = await axios.post(
      `${API_BASE_URL}/save`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (saveResponse.status === 200) {
      console.log("Game state saved successfully.");
      await interaction.followUp({
        content: "Game state saved successfully!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      throw new Error("Failed to save game state.");
    }

    // Step 2: Shutdown with a 60-second wait and restart message
    const shutdownResponse = await axios.post(
      `${API_BASE_URL}/shutdown`,
      {
        waittime: 60,
        message: "Server is restarting in 60 seconds...",
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
      await interaction.followUp({
        content: "Server will restart in 60 seconds...",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      throw new Error("Failed to initiate shutdown.");
    }

    // Step 3: Wait for 65 seconds before restarting the server
    await wait(65000); // Wait 65 seconds to ensure shutdown is complete

    // Step 4: Start the server after shutdown
    const serverProcess = spawn(SERVER_PATH, [], {
      detached: true,
      stdio: "ignore",
    });

    serverProcess.unref();
    console.log("Palworld server is restarting...");
    await interaction.followUp({
      content: "Palworld server is now restarting...",
      flags: MessageFlags.Ephemeral,
    });
    await sendLog(
      interaction,
      `${interaction.user.username} restarted the server.`
    );
  } catch (error) {
    console.error(`Error during restart: ${error.message}`);
    await interaction.followUp({
      content: `Error during restart: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

// Helper function to wait for a certain amount of time
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = handleRestart;
