const { MessageFlags } = require("discord.js");

async function handleInfo(interaction, commands) {
  try {
    const simplifiedCommands = commands.map(({ name, description }) => ({
      name,
      description,
    }));

    const infoMessage =
      `**Available Commands:**\n\n` +
      simplifiedCommands
        .map((cmd) => `**/${cmd.name}** — ${cmd.description}`)
        .join("\n");

    await interaction.reply({
      content: infoMessage,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error(`Error generating help message: ${error.message}`);
    await interaction.reply({
      content: "❌ Unable to retrieve command list.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleInfo;
