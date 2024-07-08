import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/inventory/:steamId/:appId/:contextId", async (req, res) => {
  const { steamId, appId, contextId } = req.params;
  const { start_assetid } = req.query;
  const url = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=3000${
    start_assetid ? `&start_assetid=${start_assetid}` : ""
  }`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
