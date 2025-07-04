const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const QRCode = require("qrcode");
const qrTerminal = require("qrcode-terminal");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  const sock = makeWASocket({
    auth: state,
    getMessage: async () => "Scan this QR",
    printQRInTerminal: false,
    onQR: async qr => {
      // Show in terminal
      console.log("📱 Scan QR:");
      qrTerminal.generate(qr, { small: true });

      // Save as PNG
      await QRCode.toFile("./qr.png", qr);
      console.log("✅ QR saved as 'qr.png'");
    },
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== 401
        : true;
      console.log("🛑 Connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot is connected to WhatsApp!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    const number = parseFloat(body);
    if (!isNaN(number)) {
      const result = (13200 * number) + 1320000 + 39600;
      await sock.sendMessage(sender, {
        text: `✅ Result: ${result.toLocaleString("en-US")}`,
      });
    } else {
      await sock.sendMessage(sender, {
        text: "❌ Please send a number like 1.5 or 2",
      });
    }
  });
}

startBot().catch(err => console.error("💥 Bot error:", err));
