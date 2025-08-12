import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import http from 'node:http';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import config from './config.json' with { type: 'json' };
import { db } from './utils/db.js';
import { resumeAllGiveaways } from './utils/giveaway.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    // Removed privileged intents by default to avoid "Used disallowed intents" errors.
    // Enable these in Discord Developer Portal if you need them, then re-add:
    // GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();

async function loadCommands() {
  const baseDir = path.dirname(fileURLToPath(import.meta.url));
  const commandsPath = path.join(baseDir, 'commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    const mod = await import(pathToFileURL(filePath).href);
    if (mod?.data && typeof mod.execute === 'function') {
      client.commands.set(mod.data.name, mod);
    }
  }
}

async function loadEvents() {
  const baseDir = path.dirname(fileURLToPath(import.meta.url));
  const eventsPath = path.join(baseDir, 'events');
  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(eventsPath, file);
    const event = await import(pathToFileURL(filePath).href);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  }
}

process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));

(async () => {
  await loadCommands();
  await loadEvents();
  const token = process.env.TOKEN || config.token;
  if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
    console.error('Missing TOKEN. Set process.env.TOKEN or fill config.json');
    process.exit(1);
  }
  await client.login(token);

  // Resume giveaways after login
  client.once('ready', async () => {
    await resumeAllGiveaways(client);
  });
})();

// Minimal HTTP server for Render Web Service health checks
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('zer0-discord-bot is running');
});
server.listen(port, () => {
  console.log(`Health server listening on port ${port}`);
});
