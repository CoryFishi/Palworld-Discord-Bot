//
// This helper is in place to assist with Discord's needed 3-second response time
// This will call the server in order to see if it is online,
// if offline it reports back to the Discord bot
//

const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;

// Generate auth string for Basic Auth
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");

async function checkServerStatus() {
  try {
    // Check server status by requesting /metrics with auth
    const response = await axios.get(`${API_BASE_URL}/metrics`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      timeout: 3000,
    });

    return response.status === 200;
  } catch (error) {
    console.error(
      `Server is not responding or offline: ${
        error.response?.status || error.message
      }`
    );
    return false;
  }
}

module.exports = { checkServerStatus };
