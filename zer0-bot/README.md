# Zer0 Discord Bot

A production-ready MVP Discord bot using discord.js v14 and quick.db. Built with modern ESM syntax and structured for clean deployments.

## Features
- Slash commands: /ping, /help, /live-stock, /countdown, /giveaway, /ticket, /vouch, /sell-help, /list-product, /role
- Reaction-based giveaways with persistence and auto-resume after restarts
- Ticket creation as channels or threads with persistence
- Anti-slur filter with funny replacements
- Product listing and live stock display
- Vouch recording

## Project Structure
```
zer0-bot/
  index.js               # Bot entry point
  deploy-commands.js     # Register slash commands
  package.json           # Bot dependencies (ESM)
  config.json            # Token/IDs/settings and funny slur map
  utils/
    db.js                # quick.db setup
    giveaway.js          # giveaway scheduler/finalizer
  commands/              # Individual slash commands
  events/                # ready, interactionCreate, messageCreate
```

## Setup
1) Fill config.json or set environment variables:
- TOKEN (overrides config.token)
- CLIENT_ID (overrides config.clientId)
- GUILD_ID (optional; for guild-scoped deploy)

2) Install dependencies
```
cd zer0-bot
npm install
```

3) Deploy slash commands
```
npm run deploy
# or
node deploy-commands.js
```

4) Run locally
```
npm start
# or
node index.js
```

## Hosting on Render
- Create a new Background Worker (recommended) or Web Service
- Root Directory: `zer0-bot`
- Build Command: `npm ci` (or `npm install`)
- Start Command: `npm start`
- Environment Variables:
  - TOKEN: your bot token
  - CLIENT_ID: your application client ID
  - GUILD_ID: (optional) your development guild ID for faster command updates

Giveaways, tickets, products, and vouches persist in `data.sqlite` under `zer0-bot/`.
