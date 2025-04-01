const SERVER_PATH = process.env.SERVER_PATH;
const SERVER_PROCESS_NAME = "PalServer.exe";
const { sendLog } = require("../helpers/logHelper");
const { spawn, exec } = require("child_process");
const { MessageFlags } = require("discord.js");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");

async function handleStart(interaction) {
  try {
    if (!isAdmin(interaction)) {
      return await handleUnauthorized(interaction);
    }
    // Check if the server is already running
    const isRunning = await checkIfServerIsRunning();

    if (isRunning) {
      console.log("Server is already running.");
      await interaction.reply({
        content: "Palworld server is already running!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Spawn Palworld server as a detached process
    const serverProcess = spawn(SERVER_PATH, [], {
      detached: true,
      stdio: "ignore",
    });

    // Unref to detach and let the server run in the background
    serverProcess.unref();

    // Confirm to the user that the server is starting
    await interaction.reply({
      content: "Palworld server is starting...",
      flags: MessageFlags.Ephemeral,
    });

    // Send log to the designated channel
    await sendLog(
      interaction,
      `${interaction.user.username} started the server.`
    );
  } catch (error) {
    console.error(`Error starting the server: ${error.message}`);
    await interaction.reply({
      content: `Error starting the server: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

// Helper function to check if the server is running
async function checkIfServerIsRunning() {
  return new Promise((resolve) => {
    // Run tasklist to check if the server process is running
    exec(`tasklist`, (err, stdout) => {
      if (err) {
        console.error(`Error checking server status: ${err.message}`);
        resolve(false);
        return;
      }

      // Check if the server process name is found in tasklist output
      const isRunning = stdout
        .toLowerCase()
        .includes(SERVER_PROCESS_NAME.toLowerCase());

      if (isRunning) {
        console.log(`Server is already running.`);
      }

      resolve(isRunning);
    });
  });
}

module.exports = handleStart;
