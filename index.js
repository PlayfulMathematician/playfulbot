import dotenv from 'dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';
dotenv.config()
const TOKEN = process.env.DISCORD_KEY;
const client = new Client({ intents: Object.values(GatewayIntentBits) });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
  if (interaction)
});


client.login(TOKEN);
