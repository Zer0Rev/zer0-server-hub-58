import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import config from './config.json' assert { type: 'json' };
import { db } from './utils/db.js';
import { resumeAllGiveaways } from './utils/giveaway.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(process.cwd(), 'zer0-bot', 'commands');
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
  const eventsPath = path.join(process.cwd(), 'zer0-bot', 'events');
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
