const axios = require("axios");
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const API_BASE_URL = process.env.API_BASE_URL;
const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");
const { MessageFlags } = require("discord.js");
const { checkServerStatus } = require("../helpers/apiHelper");

async function handleSettings(interaction) {
  try {
    // Check if the server is running
    const serverOnline = await checkServerStatus();
    if (!serverOnline) {
      return await interaction.reply({
        content: "The server is offline. Please start the server first.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const response = await axios.get(`${API_BASE_URL}/settings`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    const data = response.data;

    // Split settings into two parts
    const settingsPart1 = `
        **Server Settings (Part 1/2)**
        🔹 Difficulty: ${data.Difficulty}
        🔹 Day Time Speed Rate: ${data.DayTimeSpeedRate}
        🔹 Night Time Speed Rate: ${data.NightTimeSpeedRate}
        🔹 EXP Rate: ${data.ExpRate}
        🔹 Pal Capture Rate: ${data.PalCaptureRate}
        🔹 Pal Spawn Num Rate: ${data.PalSpawnNumRate}
        🔹 Pal Damage Rate Attack: ${data.PalDamageRateAttack}
        🔹 Pal Damage Rate Defense: ${data.PalDamageRateDefense}
        🔹 Player Damage Rate Attack: ${data.PlayerDamageRateAttack}
        🔹 Player Damage Rate Defense: ${data.PlayerDamageRateDefense}
        🔹 Player Stomach Decrease Rate: ${data.PlayerStomachDecreaceRate}
        🔹 Player Stamina Decrease Rate: ${data.PlayerStaminaDecreaceRate}
        🔹 Player Auto HP Regen Rate: ${data.PlayerAutoHPRegeneRate}
        🔹 Player Auto HP Regen Rate In Sleep: ${data.PlayerAutoHpRegeneRateInSleep}
        🔹 Pal Stomach Decrease Rate: ${data.PalStomachDecreaceRate}
        🔹 Pal Stamina Decrease Rate: ${data.PalStaminaDecreaceRate}
        🔹 Pal Auto HP Regen Rate: ${data.PalAutoHPRegeneRate}
        🔹 Pal Auto HP Regen Rate In Sleep: ${data.PalAutoHpRegeneRateInSleep}
        🔹 Build Object Damage Rate: ${data.BuildObjectDamageRate}
        🔹 Build Object Deterioration Damage Rate: ${data.BuildObjectDeteriorationDamageRate}
        🔹 Collection Drop Rate: ${data.CollectionDropRate}
        🔹 Collection Object Hp Rate: ${data.CollectionObjectHpRate}
        🔹 Collection Object Respawn Speed Rate: ${data.CollectionObjectRespawnSpeedRate}
        🔹 Enemy Drop Item Rate: ${data.EnemyDropItemRate}
      `;

    const settingsPart2 = `
        **Server Settings (Part 2/2)**
        🔹 Death Penalty: ${data.DeathPenalty}
        🔹 bEnablePlayerToPlayerDamage: ${data.bEnablePlayerToPlayerDamage}
        🔹 bEnableFriendlyFire: ${data.bEnableFriendlyFire}
        🔹 bEnableInvaderEnemy: ${data.bEnableInvaderEnemy}
        🔹 bActiveUNKO: ${data.bActiveUNKO}
        🔹 bEnableAimAssistPad: ${data.bEnableAimAssistPad}
        🔹 bEnableAimAssistKeyboard: ${data.bEnableAimAssistKeyboard}
        🔹 Drop Item Max Num: ${data.DropItemMaxNum}
        🔹 Drop Item Max Num UNKO: ${data.DropItemMaxNum_UNKO}
        🔹 Base Camp Max Num: ${data.BaseCampMaxNum}
        🔹 Base Camp Worker Max Num: ${data.BaseCampWorkerMaxNum}
        🔹 Drop Item Alive Max Hours: ${data.DropItemAliveMaxHours}
        🔹 bAutoResetGuildNoOnlinePlayers: ${data.bAutoResetGuildNoOnlinePlayers}
        🔹 Auto Reset Guild Time No Online Players: ${data.AutoResetGuildTimeNoOnlinePlayers}
        🔹 Guild Player Max Num: ${data.GuildPlayerMaxNum}
        🔹 Pal Egg Default Hatching Time: ${data.PalEggDefaultHatchingTime}
        🔹 Work Speed Rate: ${data.WorkSpeedRate}
        🔹 bIsMultiplay: ${data.bIsMultiplay}
        🔹 bIsPvP: ${data.bIsPvP}
        🔹 bCanPickupOtherGuildDeathPenaltyDrop: ${data.bCanPickupOtherGuildDeathPenaltyDrop}
        🔹 bEnableNonLoginPenalty: ${data.bEnableNonLoginPenalty}
        🔹 bEnableFastTravel: ${data.bEnableFastTravel}
        🔹 bIsStartLocationSelectByMap: ${data.bIsStartLocationSelectByMap}
        🔹 bExistPlayerAfterLogout: ${data.bExistPlayerAfterLogout}
        🔹 bEnableDefenseOtherGuildPlayer: ${data.bEnableDefenseOtherGuildPlayer}
        🔹 Coop Player Max Num: ${data.CoopPlayerMaxNum}
        🔹 Server Player Max Num: ${data.ServerPlayerMaxNum}
        🔹 Server Name: ${data.ServerName}
        🔹 Server Description: ${data.ServerDescription}
        🔹 Public Port: ${data.PublicPort}
        🔹 Public IP: ${data.PublicIP}
        🔹 RCON Enabled: ${data.RCONEnabled}
        🔹 RCON Port: ${data.RCONPort}
        🔹 Region: ${data.Region}
        🔹 bUseAuth: ${data.bUseAuth}
        🔹 Ban List URL: ${data.BanListURL}
        🔹 REST API Enabled: ${data.RESTAPIEnabled}
        🔹 REST API Port: ${data.RESTAPIPort}
        🔹 bShowPlayerList: ${data.bShowPlayerList}
        🔹 Allow Connect Platform: ${data.AllowConnectPlatform}
        🔹 bIsUseBackupSaveData: ${data.bIsUseBackupSaveData}
        🔹 Log Format Type: ${data.LogFormatType}
      `;

    // Send the two messages
    await interaction.reply({
      content: settingsPart1,
      flags: MessageFlags.Ephemeral,
    });
    await interaction.followUp({
      content: settingsPart2,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error(`Error fetching server settings: ${error.message}`);
    await interaction.reply({
      content: "Unable to retrieve server settings.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = handleSettings;
