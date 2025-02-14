const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { body, query, validationResult } = require("express-validator");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

app.use(express.json());
app.use(morgan("dev")); // Logging request

// Middleware untuk menangani validasi
const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) break;
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        next();
    };
};

// Endpoint menerima callback dari wekios.com
app.get(
    "/api/callback",
    validate([
        query("date").notEmpty(),
        query("amount").notEmpty(),
        query("fee").notEmpty(),
        query("balance").notEmpty(),
        query("status").notEmpty(),
        query("issuer").notEmpty(),
        query("rrn").notEmpty(),
        query("us_key").notEmpty(),
    ]),
    async (req, res) => {
        const { date, amount, fee, balance, status, issuer, rrn, us_key } = req.query;
        const message = `📢 Callback Received!\n📅 Date: ${date}\n💰 Amount: ${amount}\n💸 Fee: ${fee}\n🏦 Balance: ${balance}\n✅ Status: ${status}\n🏦 Issuer: ${issuer}\n🔢 RRN: ${rrn}\n🔑 US Key: ${us_key}`;

        try {
            await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown",
            });
        } catch (error) {
            console.error("Failed to send message to Telegram", error.message);
        }

        res.json({ success: true, message: "Callback received", date, amount, fee, balance, status, issuer, rrn, us_key });
    }
);

// Endpoint untuk mendapatkan informasi perangkat
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
        console.error("Failed to send device info to Telegram", error.message);
    }

    res.json({ success: true, ip, time, userAgent });
});

// Endpoint download TikTok MP4, MP3, Slide
app.get(
    "/api/download/tiktok",
    validate([
        query("url").isURL().withMessage("Invalid URL"),
        query("type").isIn(["mp4", "mp3", "slide"]).withMessage("Type must be mp4, mp3, or slide"),
    ]),
    async (req, res) => {
        const { url, type } = req.query;

        try {
            const response = await axios.get(`https://api.YourTikTokDownloader.com/download?url=${encodeURIComponent(url)}`);
            if (response.data && response.data.success) {
                let downloadUrl;
                if (type === "mp4") {
                    downloadUrl = response.data.video;
                } else if (type === "mp3") {
                    downloadUrl = response.data.audio;
                } else {
                    downloadUrl = response.data.slide;
                }
                return res.json({ success: true, downloadUrl });
            } else {
                return res.status(500).json({ error: "Failed to fetch TikTok media" });
            }
        } catch (error) {
            console.error("Failed to download TikTok media", error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Route utama
app.get("/", (req, res) => {
    res.send("Server is running on Vercel! Use /api/callback, /api/device-info, or /api/download/tiktok.");
});

module.exports = app;
