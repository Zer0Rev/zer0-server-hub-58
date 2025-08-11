import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('sell-help')
  .setDescription('Get help on how to sell products here');

export async function execute(interaction) {
  const content = [
    'Here\'s how to sell products safely on this server:',
    '1) List your product with /list-product',
    '2) Set up a ticket with /ticket to handle buyer communication',
    '3) Share payment methods clearly and verify buyers',
    '4) Keep proof of transactions and avoid going first with new users',
    '5) Ask moderators if unsure about anything',
  ].join('\n');
  await interaction.reply({ content, ephemeral: true });
}
