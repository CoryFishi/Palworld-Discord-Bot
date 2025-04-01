const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleInfo(interaction) {
  try {
    // Check if the server is running
    const serverOnline = await checkServerStatus();
    if (!serverOnline) {
      return await interaction.reply({
        content: "The server is offline. Please start the server first.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const response = await axios.get(`${API_BASE_URL}/info`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    const data = response.data;
    const infoMessage = `
      **Server Info**
      🔹 Version: ${data.version}
      🔹 Server Name: ${data.servername}
      🔹 Description: ${data.description}
      🔹 World GUID: ${data.worldguid}
    `;

    await interaction.reply({
      content: infoMessage,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error(`Error fetching server info: ${error.message}`);
    await interaction.reply({
      content: "Unable to retrieve server information.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleInfo;
