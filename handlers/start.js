const SERVER_PATH = process.env.SERVER_PATH;
const SERVER_PROCESS_NAME = "PalServer.exe";
const { sendLog } = require("../helpers/logHelper");
const { spawn, exec } = require("child_process");
const { MessageFlags } = require("discord.js");
const { isAdmin, handleUnauthorized } = require("../helpers/adminHelper");

const args = [
  "-logformat=text",
  "-useperfthreads",
  "-NoAsyncLoadingThread",
  "-UseMultithreadForDS",
  "-publiclobby",
];

async function handleStart(interaction) {
  try {
    if (!isAdmin(interaction)) {
      return await handleUnauthorized(interaction);
    }

    await interaction.deferReply({ ephemeral: true });

    // Check if the server is already running
    const isRunning = await checkIfServerIsRunning();

    if (isRunning) {
      console.log("Server is already running.");
      await interaction.reply({
        content: "Palworld server is already running!",
      });
      return;
    }

    // Spawn Palworld server as a detached process
    const serverProcess = spawn(SERVER_PATH, args, {
      detached: true,
      stdio: "ignore",
    });

    // Unref to detach and let the server run in the background
    serverProcess.unref();

    // Confirm to the user that the server is starting
    await interaction.editReply({
      content: "Palworld server is starting...",
    });

    const currentTime = new Date().toLocaleString();

    // Send log to the designated channel
    await sendLog(
      interaction,
      `[${currentTime}] **Server Started:** ${interaction.user.username} started the server.`
    );
  } catch (error) {
    console.error(`Error starting the server: ${error.message}`);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: `Error starting the server: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.editReply({
        content: `Error starting the server: ${error.message}`,
      });
    }
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
