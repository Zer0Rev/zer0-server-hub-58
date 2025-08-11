import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { db } from '../utils/db.js';

export const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Create a support ticket as a channel or thread')
  .addStringOption(o => o.setName('type').setDescription('Ticket type').setRequired(true).addChoices(
    { name: 'channel', value: 'channel' },
    { name: 'thread', value: 'thread' },
  ));

export async function execute(interaction) {
  const type = interaction.options.getString('type', true);
  try {
    if (type === 'channel') {
      // Find or create Tickets category
      const category = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === 'tickets')
        || await interaction.guild.channels.create({ name: 'Tickets', type: ChannelType.GuildCategory });

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username.slice(0, 20).toLowerCase()}`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });

      await db.set(`tickets.${channel.id}`, {
        ownerId: interaction.user.id,
        type: 'channel',
        channelId: channel.id,
        createdAt: Date.now(),
      });

      await interaction.reply({ content: `Ticket created: <#${channel.id}>`, ephemeral: true });
    } else {
      // Create a thread in current channel
      const parent = interaction.channel;
      if (!parent?.isTextBased()) {
        return interaction.reply({ content: 'Please use this in a text channel to create a thread ticket.', ephemeral: true });
      }
      const thread = await parent.threads.create({
        name: `ticket-${interaction.user.username.slice(0, 20).toLowerCase()}`,
        autoArchiveDuration: 1440, // 24h
      });

      await db.set(`tickets.${thread.id}`, {
        ownerId: interaction.user.id,
        type: 'thread',
        channelId: thread.id,
        createdAt: Date.now(),
      });

      await interaction.reply({ content: `Thread ticket created: <#${thread.id}>`, ephemeral: true });
    }
  } catch (err) {
    console.error('/ticket error:', err);
    if (!interaction.replied) await interaction.reply({ content: 'Failed to create ticket.', ephemeral: true });
  }
}
