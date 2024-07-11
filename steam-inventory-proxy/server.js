import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STEAM_API_URL =
  process.env.STEAM_API_URL || "https://steamcommunity.com/inventory";
const COUNT = process.env.COUNT || 1000; // Default to 1000 if not set in .env
const LANGUAGE = process.env.LANGUAGE || "english";

app.use(cors());

app.get("/inventory/:steamId/:appId/:contextId", async (req, res) => {
  const { steamId, appId, contextId } = req.params;
  const { start_assetid } = req.query;
  const url = `${STEAM_API_URL}/${steamId}/${appId}/${contextId}?count=${COUNT}&l=${LANGUAGE}${
    start_assetid ? `&start_assetid=${start_assetid}` : ""
  }`;
  console.log(url);

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/test", async (req, res) => {
  res.status(200).json({ message: "test endpoint" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
