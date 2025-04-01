//
// This helper is in place to send logs into the log channel
//

const CHANNEL_ID = process.env.CHANNEL_ID;

async function sendLog(interaction, message) {
  try {
    if (!CHANNEL_ID) {
      console.error("CHANNEL_ID is not defined in the .env file.");
      return;
    }

    // Fetch the log channel using the channel ID
    const logChannel = await interaction.client.channels.fetch(CHANNEL_ID);

    // Log to designated channel
    if (logChannel) {
      await logChannel.send(message);
      console.log(`Log sent: ${message}`);
    } else {
      console.error("Channel not found.");
    }
  } catch (error) {
    console.error(`Error sending log: ${error.message}`);
  }
}

module.exports = { sendLog };
