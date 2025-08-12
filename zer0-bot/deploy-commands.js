import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { REST, Routes } from 'discord.js';
import config from './config.json' with { type: 'json' };

async function getCommands() {
  const commands = [];
  const baseDir = path.dirname(fileURLToPath(import.meta.url));
  const commandsPath = path.join(baseDir, 'commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    const mod = await import(pathToFileURL(filePath).href);
    if (mod?.data) {
      commands.push(mod.data.toJSON());
    }
  }
  return commands;
}

(async () => {
  try {
    const token = process.env.TOKEN || config.token;
    const clientId = process.env.CLIENT_ID || config.clientId;
    const guildId = process.env.GUILD_ID || config.guildId;

    if (!token || !clientId) {
      throw new Error('Missing TOKEN or CLIENT_ID. Set env vars or fill config.json');
    }

    const rest = new REST({ version: '10' }).setToken(token);
    const commands = await getCommands();

    if (guildId && guildId !== 'YOUR_GUILD_ID_HERE') {
      try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        console.log(`Successfully registered ${commands.length} guild commands to ${guildId}.`);
      } catch (err) {
        // Fallback to global on Missing Access or permission errors
        const code = err?.code || err?.rawError?.code;
        const status = err?.status;
        if (status === 403 || code === 50001 || code === 50013) {
          console.warn(`Guild command registration failed (${status || code}). Falling back to GLOBAL commands...`);
          await rest.put(Routes.applicationCommands(clientId), { body: commands });
          console.log(`Successfully registered ${commands.length} global commands.`);
        } else {
          throw err;
        }
      }
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`Successfully registered ${commands.length} global commands.`);
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
    process.exit(1);
  }
})();
