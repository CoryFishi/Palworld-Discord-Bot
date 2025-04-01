//
// This helper is in place to assist with making slash commands advised to a role
// This will make slash commands that could be abused, restricted to admin roles
// Currently only working with one role
//

const { MessageFlags } = require("discord.js");

const ADMIN_ROLE = process.env.ADMIN_ROLE;

function isAdmin(interaction) {
  return interaction.member.roles.cache.some(
    (role) => role.name === ADMIN_ROLE
  );
}

async function handleUnauthorized(interaction) {
  await interaction.reply({
    content: `You do not have permission to use this command. Only users with the ${ADMIN_ROLE} role can perform this action.`,
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { isAdmin, handleUnauthorized };
