import { EmbedBuilder } from 'discord.js';
import { db, getArray } from './db.js';
import config from '../config.json' with { type: 'json' };

const timeouts = new Map();

export async function resumeAllGiveaways(client) {
  const giveaways = await getArray('giveaways');
  for (const g of giveaways) {
    scheduleGiveaway(client, g);
  }
}

export function scheduleGiveaway(client, g) {
  const key = `${g.guildId}:${g.channelId}:${g.messageId}`;
  if (timeouts.has(key)) return;

  const delay = Math.max(0, g.endAt - Date.now());
  const to = setTimeout(async () => {
    try {
      await finalizeGiveaway(client, g);
    } catch (e) {
      console.error('Finalize giveaway error:', e);
    } finally {
      timeouts.delete(key);
    }
  }, delay);

  timeouts.set(key, to);
}

export async function finalizeGiveaway(client, g) {
  try {
    const guild = await client.guilds.fetch(g.guildId);
    const channel = await guild.channels.fetch(g.channelId);
    if (!channel || !channel.isTextBased()) return;
    const message = await channel.messages.fetch(g.messageId).catch(() => null);
    if (!message) return;

    const emoji = config.settings?.giveawayEmoji || '🎉';
    const reaction = message.reactions.cache.get(emoji) || (await message.fetch()).reactions.cache.get(emoji);

    let users = [];
    if (reaction) {
      const fetched = await reaction.users.fetch();
      users = fetched.filter(u => !u.bot).map(u => u);
    }

    let content;
    if (users.length) {
      const winner = users[Math.floor(Math.random() * users.length)];
      content = `🎉 Giveaway ended! Winner of "${g.prize}" is <@${winner.id}>`;
    } else {
      content = `🎉 Giveaway ended! No valid participants for "${g.prize}".`;
    }

    await channel.send({ content });

    // Remove from DB
    const giveaways = await getArray('giveaways');
    const remaining = giveaways.filter(x => x.messageId !== g.messageId);
    await db.set('giveaways', remaining);

    // Update original message
    const endedEmbed = EmbedBuilder.from(message.embeds?.[0] || new EmbedBuilder()).setColor(0x808080).setTitle('🎉 Giveaway Ended').setDescription(`Prize: ${g.prize}`)
      .setFooter({ text: `Ended at ${new Date().toLocaleString()}` });
    await message.edit({ embeds: [endedEmbed] }).catch(() => null);
  } catch (err) {
    console.error('Error finalizing giveaway:', err);
  }
}
