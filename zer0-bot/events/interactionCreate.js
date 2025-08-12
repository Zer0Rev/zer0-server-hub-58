import { Events } from 'discord.js';

export const name = Events.InteractionCreate;
export const once = false;
export async function execute(client, interaction) {
  try {
    const isChat = interaction.isChatInputCommand?.() ?? false;
    console.log('[interactionCreate] received:', {
      id: interaction.id,
      guildId: interaction.guildId,
      userId: interaction.user?.id,
      type: interaction.type,
      isChat,
      commandName: isChat ? interaction.commandName : undefined,
    });

    if (!isChat) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`[interactionCreate] Unknown command: /${interaction.commandName}`);
      return interaction.reply({ content: 'Unknown command.', ephemeral: true });
    }

    console.log(`[interactionCreate] executing /${interaction.commandName}`);
    await command.execute(interaction);
    console.log(`[interactionCreate] completed /${interaction.commandName}`);
  } catch (err) {
    console.error('interactionCreate error:', err);
    try {
      if (interaction.isRepliable?.() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply('There was an error executing this command.');
      }
    } catch (e) {
      console.error('Failed to send error reply:', e);
    }
  }
}

