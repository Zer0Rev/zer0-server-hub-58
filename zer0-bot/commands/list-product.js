import { SlashCommandBuilder } from 'discord.js';
import { db } from '../utils/db.js';

export const data = new SlashCommandBuilder()
  .setName('list-product')
  .setDescription('Add a product to the database')
  .addStringOption(o => o.setName('name').setDescription('Product name').setRequired(true))
  .addNumberOption(o => o.setName('price').setDescription('Price').setRequired(true));

export async function execute(interaction) {
  try {
    const name = interaction.options.getString('name', true);
    const price = interaction.options.getNumber('price', true);
    const products = (await db.get('products')) || {};
    products[name] = products[name] || { stock: 0, price };
    products[name].price = price;
    await db.set('products', products);
    await interaction.reply({ content: `✅ Product "${name}" listed at ${price}.`, ephemeral: true });
  } catch (err) {
    console.error('/list-product error:', err);
    if (!interaction.replied) await interaction.reply({ content: 'Failed to list product.', ephemeral: true });
  }
}
