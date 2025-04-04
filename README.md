# Palworld Discord Bot

A powerful and extensible Discord bot for managing your Palworld dedicated server.

## Features

- ✅ Slash command support
- ✅ Start/Stop/Restart/Shutdown server remotely
- ✅ Kick, ban, and unban players
- ✅ Server metrics, player list, and settings overview
- ✅ Update `.ini` settings dynamically
- ✅ Logs all activity to a specified channel
- ✅ Detects player joins and logs them
- ✅ Only admins with a specific role can use restricted commands

---

## Installation

### 1. Clone this repo

```bash
git clone https://github.com/yourname/palworld-discord-bot.git
cd palworld-discord-bot
```
### 2. Install dependencies
```
npm install
```

#### Environment Setup
Create a .env file in the root directory:

```
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_guild_id
API_BASE_URL=http://localhost:8212/v1/api
API_USERNAME=admin
API_PASSWORD=Cory1234
SERVER_PATH="C:\\Path\\To\\PalServer.exe"
SETTINGS_PATH="C:\\Path\\To\\PalWorldSettings.ini"
CHANNEL_ID=your_log_channel_id
ADMIN_ROLE=Palworld Admin
```

Ensure within the PalWorldSettings.ini file for your server, these settings are properlly set before using the bot.
This enables the bot to send commands and recieve data from the PalWorld server.
```
RESTAPIEnabled=True
RESTAPIPort=8212
AdminPassword=Your_Password  # This will be your password for admin commands/ the api interface
```

## Commands
| Slash Command |	Description |	Admin Only |
| ---------- | ----- | ---------- |
| /palstart |	Start the server |	✅ Yes |
| /palstop |	Stop the server |	✅ Yes |
| /palrestart |	Save + shutdown + restart |	✅ Yes |
| /palshutdown |	Delayed shutdown with a message |	✅ Yes |
| /palforcestop |	Forcefully kill server process |	✅ Yes |
| /palkick |	Kick a player |	✅ Yes |
| /palban |	Ban a player |	✅ Yes |
| /palunban |	Unban a player |	✅ Yes |
| /palannounce |	Send a server-wide announcement |	✅ Yes |
| /palsetsetting |	Update server setting (.ini) and restart |	✅ Yes |
| /palsave |	Manually trigger a save |	✅ Yes |
| /palinfo |	Show general server info |	❌ No |
| /palmetrics |	Show server performance info |	❌ No |
| /palstatus |	Shows online status and players |	❌ No |
| /palplayers |	Lists currently online players |	❌ No |

### Admin Role Protection
Only members with the role name defined in ADMIN_ROLE can use restricted commands.

### Logging
All major commands and events are logged in the channel specified by CHANNEL_ID.

Player joins, Setting changes, Errors

## Development Scripts
```
node ./bot.js     # Start the bot
```
## Testing Tips
Make sure the Palworld API is running on localhost:8212
Ensure correct permissions are given to your bot in Discord
Use /palsave to test communication with the API

## Future Developments

- Detects player disconnects and logs them
- Server Uptime tracking
- Top Active Players leaderboard
- Sheduled restarts
- Sheduled Backups
- Server crash detection + auto-restart
- Discord user tied to palworld user
- Dynamic role-based permissions
- Multi-server support
- Help command
- Notify owner when role-based commands are used

## License
MIT © Cory Fishburn
