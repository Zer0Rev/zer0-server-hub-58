import { Events } from 'discord.js';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(client, interaction) {
  try {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({ content: 'Unknown command.', ephemeral: true });
    }
    await command.execute(interaction);
  } catch (err) {
    console.error('interactionCreate error:', err);
    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  }
}
