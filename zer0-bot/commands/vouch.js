import { SlashCommandBuilder } from 'discord.js';
import { pushArray } from '../utils/db.js';

export const data = new SlashCommandBuilder()
  .setName('vouch')
  .setDescription('Record a vouch for this server or seller')
  .addStringOption(o => o.setName('message').setDescription('Your vouch message').setRequired(true));

export async function execute(interaction) {
  try {
    const message = interaction.options.getString('message', true);
    const vouch = { userId: interaction.user.id, date: Date.now(), message };
    await pushArray('vouches', vouch);
    await interaction.reply({ content: '✅ Thank you for your vouch!', ephemeral: true });
  } catch (err) {
    console.error('/vouch error:', err);
    if (!interaction.replied) await interaction.reply({ content: 'Failed to save vouch.', ephemeral: true });
  }
}
