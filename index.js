require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: ['CHANNEL']
});

const STAFF_CHANNEL_ID = "1473457999367639091";

let ticketCount = 0;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 📩 USER DM → CREATE TICKET
  if (!message.guild) {
    ticketCount++;

    const staffChannel = await client.channels.fetch(STAFF_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticketCount}`)
      .setColor(0x5865F2)
      .addFields(
        { name: "User", value: `${message.author.tag}`, inline: true },
        { name: "User ID", value: `${message.author.id}`, inline: true }
      )
      .setDescription(message.content)
      .setTimestamp();

    await staffChannel.send({ embeds: [embed] });

    message.reply(`✅ Your message has been sent to staff.\nTicket Number: #${ticketCount}`);
  }

  // 👮 STAFF REPLY SYSTEM
  if (message.channel.id === STAFF_CHANNEL_ID && message.reference) {

    const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);

    if (!repliedMessage.embeds.length) return;

    const embed = repliedMessage.embeds[0];
    const userIdField = embed.fields.find(f => f.name === "User ID");
    if (!userIdField) return;

    const user = await client.users.fetch(userIdField.value);

    const replyEmbed = new EmbedBuilder()
      .setTitle("💬 Staff Response")
      .setColor(0x57F287)
      .setDescription(message.content)
      .addFields(
        { name: "Moderator", value: `${message.author.tag}`, inline: true },
        { name: "Moderator ID", value: `${message.author.id}`, inline: true }
      )
      .setTimestamp();

    await user.send({ embeds: [replyEmbed] });

    message.reply("✅ Reply sent to user.");
  }
});

client.login(process.env.TOKEN);
