const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const app = express();
const port = 3000;

// Create a session file path for storing the session data
const SESSION_FILE_PATH = './session.json';
let client;

app.get('/', (req, res) => {
    // Initialize WhatsApp Web client

    // Check if a session file exists and load it
    if (fs.existsSync(SESSION_FILE_PATH)) {
        const sessionData = require(SESSION_FILE_PATH);
        client = new Client({
            authStrategy: new LocalAuth({ session: sessionData }),
        });
    } else {
        client = new Client({
            authStrategy: new LocalAuth(),
        });
    }

    // Register event handlers before initializing
    client.on('qr', (qrCode) => {
        qrcode.toDataURL(qrCode, (err, url) => {
            if (!err) {
                res.send(`<img src="${url}" alt="QR Code" />`);
            } else {
                res.send('Error generating QR code.');
            }
        });
    });

    client.on('authenticated', (session) => {
        console.log(session)
        if (session) {
            // Save the session data to a file for future use
            fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
            console.log('Authentication successful. Session data saved.');
        } else {
            console.error('Authentication event triggered, but session data is missing or invalid.');
        }
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        res.send('client is ready')
        // Send the message
        client.sendMessage(917371048499+'@c.us', 'hi this is auto metic message').then((response) => {
            console.log('Message sent:', response);
        }).catch((error) => {
            console.error('Error sending message:', error);
        });
    });

    client.on('message', message => {

        if (message.body === '!ping') {
            message.reply('pong');
        }
    });

    // Initialize the client after setting up event handlers
    client.initialize();
});

app.get('/msg', (req, res)=>{
    const p = req.query.p;
    const m = req.query.m;
  
    client.sendMessage(p+'@c.us', m).then((response) => {
        // console.log('Message sent:', response);
        res.send("Sent Done")
    }).catch((error) => {
        console.error('Error sending message:', error);
        res.send("Faild to send")
    });
})
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
