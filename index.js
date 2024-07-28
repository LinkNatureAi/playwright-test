const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/scrape", async (req, res) => {
  try {
    await scrapeLogic(res);
  } catch (error) {
    res.status(500).send(`Something went wrong: ${error.message}`);
  }
});

app.get("/", (req, res) => {
  res.send("Render Playwright server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
