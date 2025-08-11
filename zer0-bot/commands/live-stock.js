import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../utils/db.js';

export const data = new SlashCommandBuilder()
  .setName('live-stock')
  .setDescription('Show live stock for all products');

export async function execute(interaction) {
  try {
    const products = (await db.get('products')) || {};
    const entries = Object.entries(products);

    if (!entries.length) {
      return interaction.reply({ content: 'No products listed yet. Use /list-product to add one.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('📦 Live Stock')
      .setColor(0x43B581)
      .addFields(entries.map(([name, info]) => ({
        name: name,
        value: `Price: ${info.price}\nStock: ${info.stock ?? 0}`,
        inline: true,
      })))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error('/live-stock error:', err);
    if (!interaction.replied) await interaction.reply({ content: 'Failed to fetch stock.', ephemeral: true });
  }
}
