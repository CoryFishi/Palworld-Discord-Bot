require("dotenv").config({ path: "./.env" });
const handleSettings = require("./handlers/settings");
const handleInfo = require("./handlers/info");
const handleMetrics = require("./handlers/metrics");
const handleStart = require("./handlers/start");
const handlePlayers = require("./handlers/players");
const handleStatus = require("./handlers/status");
const handleAnnounce = require("./handlers/announce");
const handleKick = require("./handlers/kick");
const handleBan = require("./handlers/ban");
const handleUnban = require("./handlers/unban");
const handleSave = require("./handlers/save");
const handleShutdown = require("./handlers/shutdown");
const handleForceStop = require("./handlers/forcestop");
const handleRestart = require("./handlers/restart");
const handleSetSetting = require("./handlers/setsetting");
const { watchPlayers } = require("./handlers/playerWatcher");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ActivityType,
  SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios");

// Create a new Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Define constants
const API_URL = `${process.env.API_BASE_URL}/metrics`;
const auth = Buffer.from(
  `${process.env.API_USERNAME}:${process.env.API_PASSWORD}`
).toString("base64");

// Function to update bot status based on server state
async function updateBotStatus() {
  try {
    // Get server metrics to check if it's online and get player count
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    if (response.status === 200) {
      const data = response.data;
      const playerCount = data.currentplayernum;
      const maxPlayers = data.maxplayernum;

      // Set bot status to online and update activity with player count
      client.user.setPresence({
        status: "online",
        activities: [
          {
            name: `${playerCount}/${maxPlayers} players online`,
            type: ActivityType.Playing,
          },
        ],
      });
    } else {
      throw new Error("Failed to retrieve server status.");
    }
  } catch (error) {
    console.error(`Server appears to be offline: ${error.message}`);

    // Set bot status to DND and set activity to Offline
    client.user.setPresence({
      status: "dnd",
      activities: [
        {
          name: "Offline",
          type: ActivityType.Playing,
        },
      ],
    });
  }
}

// Periodically update bot status every 60 seconds
setInterval(updateBotStatus, 60000);

// Define the slash commands
const commands = [
  new SlashCommandBuilder()
    .setName("palsettings")
    .setDescription("Get all Palworld server settings"),
  new SlashCommandBuilder()
    .setName("palinfo")
    .setDescription("Get Palworld server information"),
  new SlashCommandBuilder()
    .setName("palmetrics")
    .setDescription("Get Palworld server metrics"),
  new SlashCommandBuilder()
    .setName("palstart")
    .setDescription("Start the Palworld server"),
  new SlashCommandBuilder()
    .setName("palplayers")
    .setDescription("List all connected players"),
  new SlashCommandBuilder()
    .setName("palstatus")
    .setDescription("Check if the Palworld server is running"),
  new SlashCommandBuilder()
    .setName("palannounce")
    .setDescription("Send an announcement to the Palworld server")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to announce")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("palkick")
    .setDescription("Kick a player from the Palworld server")
    .addStringOption((option) =>
      option
        .setName("player")
        .setDescription("The name of the player to kick")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("palban")
    .setDescription("Ban a player from the Palworld server")
    .addStringOption((option) =>
      option
        .setName("player")
        .setDescription("The name of the player to ban")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("palunban")
    .setDescription("Unban a player from the Palworld server")
    .addStringOption((option) =>
      option
        .setName("player")
        .setDescription("The name of the player to unban")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("palsave")
    .setDescription("Save the Palworld server state"),
  new SlashCommandBuilder()
    .setName("palshutdown")
    .setDescription("Shutdown the Palworld server with a delay and message")
    .addIntegerOption((option) =>
      option
        .setName("waittime")
        .setDescription("Time to wait before shutting down (in seconds)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Message to send before shutting down")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("palforcestop")
    .setDescription("Force stop the Palworld server immediately"),
  new SlashCommandBuilder()
    .setName("palrestart")
    .setDescription("Save, shutdown, and restart the Palworld server"),
  new SlashCommandBuilder()
    .setName("palsetsetting")
    .setDescription("Modify Palworld server settings in PalWorldSettings.ini")
    .addStringOption((option) =>
      option
        .setName("key")
        .setDescription("The setting key to modify")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("value")
        .setDescription("The new value for the setting")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

// Register the slash commands
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
async function registerCommands() {
  try {
    console.log("Refreshing application (/) commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Successfully registered application (/) commands.");
  } catch (error) {
    console.error(`Error registering commands: ${error.message}`);
  }
}

// Register the slash commands on bot startup
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerCommands();
  updateBotStatus();
  watchPlayers(client);
});

// Slash command handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (commandName === "palstart") {
    await handleStart(interaction);
  } else if (commandName === "palplayers") {
    await handlePlayers(interaction);
  } else if (commandName === "palstatus") {
    await handleStatus(interaction);
  } else if (commandName === "palsettings") {
    await handleSettings(interaction);
  } else if (commandName === "palinfo") {
    await handleInfo(interaction);
  } else if (commandName === "palmetrics") {
    await handleMetrics(interaction);
  } else if (commandName === "palannounce") {
    await handleAnnounce(interaction);
  } else if (commandName === "palkick") {
    await handleKick(interaction);
  } else if (commandName === "palban") {
    await handleBan(interaction);
  } else if (commandName === "palunban") {
    await handleUnban(interaction);
  } else if (commandName === "palsave") {
    await handleSave(interaction);
  } else if (commandName === "palshutdown") {
    await handleShutdown(interaction);
  } else if (commandName === "palforcestop") {
    await handleForceStop(interaction);
  } else if (commandName === "palrestart") {
    await handleRestart(interaction);
  } else if (commandName === "palsetsetting") {
    await handleSetSetting(interaction);
  }
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

// Start the bot
client.login(process.env.TOKEN);
