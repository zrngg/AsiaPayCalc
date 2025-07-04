// index.js
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    console.log('📱 Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
});

client.on('message', message => {
    const number = parseFloat(message.body);
    if (!isNaN(number)) {
        const result = (13200 * number) + 1320000 + 39600;
        message.reply(`✅ Result: ${result.toLocaleString("en-US")}`);
    } else {
        message.reply("❌ Please send a number like 1.5 or 2");
    }
});

client.initialize();
