import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { db, pushArray } from '../utils/db.js';
import { scheduleGiveaway } from '../utils/giveaway.js';
import config from '../config.json' with { type: 'json' };

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Start a reaction-based giveaway')
  .addStringOption(o => o.setName('prize').setDescription('Prize description').setRequired(true))
  .addIntegerOption(o => o.setName('duration_minutes').setDescription('Duration in minutes').setMinValue(1).setMaxValue(10080).setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  try {
    const prize = interaction.options.getString('prize', true);
    const minutes = interaction.options.getInteger('duration_minutes', true);
    const endAt = Date.now() + minutes * 60 * 1000;

    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway')
      .setDescription(`Prize: ${prize}\nReact with ${config.settings?.giveawayEmoji || '🎉'} to enter!`)
      .addFields({ name: 'Ends', value: `<t:${Math.floor(endAt/1000)}:R>` })
      .setColor(0xFEE75C)
      .setFooter({ text: `Hosted by ${interaction.user.tag}` });

    const message = await interaction.channel.send({ embeds: [embed] });
    const emoji = config.settings?.giveawayEmoji || '🎉';
    await message.react(emoji);

    const g = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      messageId: message.id,
      prize,
      endAt,
      createdBy: interaction.user.id,
    };

    await pushArray('giveaways', g);
    scheduleGiveaway(interaction.client, g);

    await interaction.reply({ content: `Giveaway started for "${prize}" ending in ${minutes} minute(s)!`, ephemeral: true });
  } catch (err) {
    console.error('/giveaway error:', err);
    if (!interaction.replied) await interaction.reply({ content: 'Failed to start giveaway.', ephemeral: true });
  }
}
