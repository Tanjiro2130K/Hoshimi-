// index.js

const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Generate and store a pairing code
const generatePairingCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();
const pairingCode = generatePairingCode();
fs.writeFileSync('pairing_code.txt', pairingCode); // Save pairing code to a file for validation
console.log(`Your pairing code is: ${pairingCode}`);

// Set up authentication state
const authFile = path.resolve(__dirname, './auth_info.json');
const { state, saveState } = useSingleFileAuthState(authFile);

// Create a new WhatsApp socket
const sock = makeWASocket({
  printQRInTerminal: false, // No QR code, using pairing code instead
  auth: state,
});

// Event: Connection update
sock.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect } = update;

  if (connection === 'close') {
    if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      console.log('Reconnecting...');
      startSock();
    }
  }
});

// Event: Message handler
sock.ev.on('messages.upsert', async (m) => {
  const message = m.messages[0];
  if (!message) return;

  const { body, key } = message;
  const { from } = key.remoteJid;

  // Load stored pairing code
  const storedPairingCode = fs.readFileSync('pairing_code.txt', 'utf8');

  // Pairing code verification
  if (body === storedPairingCode) {
    sock.sendMessage(from, { text: 'Pairing successful! You can now use the bot.' });
    console.log('Pairing successful.');
    fs.unlinkSync('pairing_code.txt'); // Remove the pairing code file after successful pairing
  } else if (body.startsWith('!')) {
    const [command, ...args] = body.slice(1).split(' ');
    const commandFilePath = path.resolve(__dirname, `commands/${command.toLowerCase()}.js`);

    try {
      const commandHandler = require(commandFilePath);
      if (commandHandler && typeof commandHandler.execute === 'function') {
        commandHandler.execute(sock, from, args);
      }
    } catch (error) {
      console.error(`Command handler not found for: ${command}`);
    }
  }
});

// Function to start the bot
function startSock() {
  console.log('Bot is running...');
}

// Start the bot
startSock();
