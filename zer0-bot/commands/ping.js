import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot latency');

export async function execute(interaction) {
  const sent = await interaction.reply({ content: 'Pinging...', ephemeral: true, fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`Pong! Latency: ${latency}ms`);
}
