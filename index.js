import dotenv from 'dotenv';
import { Client, Events, GatewayIntentBits, Message, ReactionType, REST, SlashCommandBuilder, Routes } from 'discord.js';
dotenv.config()
const TOKEN = process.env.DISCORD_KEY;
const OWNER = process.env.USER_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const SERVER_ID = process.env.SERVER_ID;
const client = new Client({ intents: Object.values(GatewayIntentBits) });
import fs from "fs"
const slashCommands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  new SlashCommandBuilder()
    .setName('create_reaction_role')
    .addStringOption(option => option.setName("message_id").setRequired(true).setDescription("a"))
    .addStringOption(option => option.setName("role_id").setRequired(true).setDescription("a"))
    .addStringOption(option => option.setName("emoji_id").setRequired(true).setDescription("a"))
    .setDescription("Creates a reaction role")
]
const writeToData = data => {
  fs.writeFileSync("db.json", JSON.stringify(data))
};
const readFromData = () => {
  return JSON.parse(fs.readFileSync("db.json", "utf8"));
};

client.on(Events.MessageReactionAdd, async (reaction, user, details) => {
  const db = readFromData();

  let msgRoleData = db?.["reactionroles"]?.[reaction.message.guildId]?.[reaction.message.id];
  if (!msgRoleData) {
    return;
  }
  if (details.type == ReactionType.Super) {
    await reaction.remove();
    return;
  }
  let roleID = msgRoleData?.[reaction.emoji.id];
  if (!roleID) {
    await reaction.remove();
    return;
  }
  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.add(roleID);
});
client.on(Events.ClientReady, async readyClient => {
  for (const guild of readyClient.guilds.cache.values()) {
    if (guild.id !== SERVER_ID) {
      await guild.leave()
    }
  }
  console.log(`Logged in as ${readyClient.user.tag}!`);
});


client.on(Events.MessageCreate, async message => {
  if (message.author.id == client.user.id) {
    return;
  }
  if (message.content !== '!sync') return;
  if (message.author.id !== OWNER) {
    return message.reply('no.');
  }
  const rest = new REST({ version: '10' })
    .setToken(TOKEN);

  await message.reply('syncing slash commands…');
  await rest.put(
    Routes.applicationGuildCommands(
      CLIENT_ID,
      message.guild.id
    ),
    {
      body: slashCommands.map(c => c.toJSON()),
    }
  );
  await message.reply('slash commands synced');
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
  if (interaction.commandName === 'create_reaction_role') {
    if (interaction.user.id !== OWNER) {
      return;
    }
    const messageID = interaction.options.getString("message_id", true);
    const roleID = interaction.options.getString("role_id", true);
    const emojiID = interaction.options.getString("emoji_id", true);

    const db = readFromData();
    db.reactionroles ??= {};
    db.reactionroles[interaction.guildId] ??= {};
    db.reactionroles[interaction.guildId][messageID] ??= {};

    db.reactionroles[interaction.guildId][messageID][emojiID] = roleID;

    writeToData(db);

    await interaction.reply({
      content: "Reaction role created ✅",
      ephemeral: true
    });
  }
});


client.login(TOKEN);
