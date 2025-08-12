import { Events, PermissionFlagsBits } from 'discord.js';
import config from '../config.json' with { type: 'json' };

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const slurMap = config.funnySlurs || {};
const slurRegex = Object.keys(slurMap).length
  ? new RegExp(`\\b(${Object.keys(slurMap).map(escapeRegex).join('|')})\\b`, 'gi')
  : null;

export const name = Events.MessageCreate;
export const once = false;
export async function execute(client, message) {
  try {
    if (!slurRegex) return;
    if (!message.guild) return; // ignore DMs
    if (message.author.bot) return;

    if (!slurRegex.test(message.content)) return;

    // Check permissions before deleting
    const me = await message.guild.members.fetchMe();
    if (!me.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const replaced = message.content.replace(slurRegex, (m) => slurMap[m.toLowerCase()] || 'friend');
    await message.delete().catch(() => null);
    await message.channel.send({ content: `✂️ Message from <@${message.author.id}> was filtered and remixed:\n> ${replaced}` });
  } catch (err) {
    console.error('messageCreate filter error:', err);
  }
}
