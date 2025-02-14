const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

app.use(express.json());

// Endpoint untuk menerima callback dari wekios.com
app.get("/api/callback", async (req, res) => {
    const { date, amount, fee, balance, status, issuer, rrn, us_key } = req.query;
    
    if (!date || !amount || !fee || !balance || !status || !issuer || !rrn || !us_key) {
        return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // Kirim notifikasi ke Telegram
    const message = `📢 Callback Received!\n📅 Date: ${date}\n💰 Amount: ${amount}\n💸 Fee: ${fee}\n🏦 Balance: ${balance}\n✅ Status: ${status}\n🏦 Issuer: ${issuer}\n🔢 RRN: ${rrn}\n🔑 US Key: ${us_key}`;
    
    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
        });
    } catch (error) {
        console.error("Failed to send message to Telegram", error);
    }

    res.json({ success: true, message: "Callback received", date, amount, fee, balance, status, issuer, rrn, us_key });
});

// Endpoint untuk mendapatkan informasi IP, baterai, dan waktu
app.get("/api/device-info", async (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const time = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    
    const message = `📡 Device Info\n🌐 IP: ${ip}\n🕰 Time: ${time}\n💻 User-Agent: ${userAgent}`;
    
    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
        });
    } catch (error) {
        console.error("Failed to send device info to Telegram", error);
    }
    
    res.json({ success: true, ip, time, userAgent });
});

// Endpoint untuk download TikTok MP4, MP3, dan Slide
app.get("/api/download/tiktok", async (req, res) => {
    const { url, type } = req.query; // type: mp4, mp3, slide

    if (!url || !type) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        const response = await axios.get(`https://api.snaptik.app/download?url=${encodeURIComponent(url)}`);
        if (response.data && response.data.success) {
            let downloadUrl;
            if (type === "mp4") {
                downloadUrl = response.data.video;
            } else if (type === "mp3") {
                downloadUrl = response.data.audio;
            } else if (type === "slide") {
                downloadUrl = response.data.slide;
            } else {
                return res.status(400).json({ error: "Invalid type" });
            }
            res.json({ success: true, downloadUrl });
        } else {
            res.status(500).json({ error: "Failed to fetch TikTok media" });
        }
    } catch (error) {
        console.error("Failed to download TikTok media", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route utama untuk memastikan server berjalan
app.get("/", (req, res) => {
    res.send("Server is running on Vercel! Use /api/callback, /api/device-info, or /api/download/tiktok.");
});

module.exports = app;
