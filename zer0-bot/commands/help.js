import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('List all available commands');

export async function execute(interaction) {
  try {
    const commands = interaction.client.commands;
    const embed = new EmbedBuilder()
      .setTitle('Zer0 Commands')
      .setColor(0x5865F2)
      .setDescription('Here are the available slash commands:')
      .addFields(
        [...commands.values()].map(cmd => ({
          name: `/${cmd.data.name}`,
          value: cmd.data.description || '—',
          inline: true,
        }))
      )
      .setFooter({ text: 'Use /help anytime to see this list.' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (err) {
    console.error('/help error:', err);
    if (!interaction.replied) {
      await interaction.reply({ content: 'Failed to display help. Please try again later.', ephemeral: true });
    }
  }
}
