import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Role management commands')
  .addSubcommand(sc => sc.setName('add').setDescription('Add a role to a user')
    .addRoleOption(o => o.setName('role').setDescription('Role to add').setRequired(true))
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true)))
  .addSubcommand(sc => sc.setName('remove').setDescription('Remove a role from a user')
    .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true)))
  .addSubcommand(sc => sc.setName('make').setDescription('Create a new role')
    .addStringOption(o => o.setName('name').setDescription('Role name').setRequired(true)))
  .addSubcommand(sc => sc.setName('change').setDescription('Rename a role')
    .addRoleOption(o => o.setName('role').setDescription('Role to rename').setRequired(true))
    .addStringOption(o => o.setName('new_name').setDescription('New role name').setRequired(true)))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  try {
    const sub = interaction.options.getSubcommand();
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'You need Manage Roles permission.', ephemeral: true });
    }

    if (sub === 'add') {
      const role = interaction.options.getRole('role', true);
      const user = interaction.options.getUser('user', true);
      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.add(role);
      return interaction.reply({ content: `✅ Added ${role} to ${user}.`, ephemeral: true });
    }

    if (sub === 'remove') {
      const role = interaction.options.getRole('role', true);
      const user = interaction.options.getUser('user', true);
      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.remove(role);
      return interaction.reply({ content: `✅ Removed ${role} from ${user}.`, ephemeral: true });
    }

    if (sub === 'make') {
      const name = interaction.options.getString('name', true);
      const role = await interaction.guild.roles.create({ name });
      return interaction.reply({ content: `✅ Created role ${role}.`, ephemeral: true });
    }

    if (sub === 'change') {
      const role = interaction.options.getRole('role', true);
      const newName = interaction.options.getString('new_name', true);
      await role.setName(newName);
      return interaction.reply({ content: `✅ Renamed role to ${role}.`, ephemeral: true });
    }
  } catch (err) {
    console.error('/role error:', err);
    if (!interaction.replied) await interaction.reply({ content: 'Role command failed.', ephemeral: true });
  }
}
