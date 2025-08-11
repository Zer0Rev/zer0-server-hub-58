import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('countdown')
  .setDescription('Start a countdown and announce when complete')
  .addIntegerOption(o => o.setName('minutes').setDescription('Minutes to countdown').setMinValue(1).setMaxValue(1440).setRequired(true));

export async function execute(interaction) {
  const minutes = interaction.options.getInteger('minutes', true);
  try {
    const ms = minutes * 60 * 1000;
    await interaction.reply({ content: `⏳ Countdown started for ${minutes} minute(s). I will announce here when it ends.`, ephemeral: true });
    setTimeout(() => {
      interaction.channel?.send({ content: `⏰ <@${interaction.user.id}> Countdown finished! (${minutes}m)` }).catch(() => null);
    }, ms);
  } catch (err) {
    console.error('/countdown error:', err);
    if (!interaction.replied) await interaction.reply({ content: 'Failed to start countdown.', ephemeral: true });
  }
}
