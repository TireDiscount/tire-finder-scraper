
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// ✅ Allow requests from your Duda site only
app.use(cors({
  origin: "https://www.tdtires.com"
}));

app.use(express.json());

app.post("/get-prices", async (req, res) => {
  const { size } = req.body;
  const formattedSize = encodeURIComponent(size.trim());
  const url = `https://www.walmart.com/search?q=${formattedSize}+tire`;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('[data-item-id]').each((i, el) => {
      const title = $(el).find('span.lh-title').first().text().trim();
      const price = $(el).find('span[data-automation-id="product-price"]').first().text().trim();
      if (title && price) {
        results.push({ title, price });
      }
    });

    res.json({ results });
  } catch (error) {
    console.error("Scraping error:", error.message);
    res.status(500).json({ error: "Could not fetch prices from Walmart." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
