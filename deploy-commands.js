import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config()
const TOKEN = process.env.DISCORD_KEY;
const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  await rest.put(Routes.applicationCommands("1436857766244257873"), { body: commands });
} catch (error) {
  console.error(error);
}
