const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter')
const app = express();


// Set IP WA Master
const setting_file_path = './setting.json';
let setting;
let port;
if (fs.existsSync(setting_file_path)) {
    setting = require(setting_file_path);
	port = setting.port;
}

// const client = new Client();
client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [ '--no-sandbox', '--disable-gpu', ],
    },
    webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', }
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('message_create', message => {
	if (message.body === '!ping') {
		// send back "pong" to the chat the message was sent in
        client.sendMessage(message.from, 'pong');
	}
});


// Fungsi untuk menambahkan penundaan
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.initialize();

app.use(express.json());

app.post('/send-text', async (req, res) => {
    const number  = phoneNumberFormatter(req.body.number, true);
    const message = req.body.message;

    try {
        await delay(30000); // Menunggu selama 0.5 menit (30000 ms)
        const response = await client.sendMessage(number, message);
        res.status(200).json({ status: 'Message sent', response });
    } catch (error) {
        res.status(500).json({ status: 'Error', error });
    }
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});