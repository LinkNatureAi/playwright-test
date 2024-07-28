const { chromium } = require('playwright');
require('dotenv').config();

const scrapeLogic = async (res) => {
  const browser = await chromium.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH // Update if using a specific Playwright executable path
        : undefined,
  });

  try {
    const page = await browser.newPage();

    await page.goto("https://developer.chrome.com/");

    // Set screen size
    await page.setViewportSize({ width: 1080, height: 1024 });

    // Type into the search box
    await page.fill(".search-box__input", "automate beyond recorder");

    // Wait and click on the first result
    await page.click(".search-box__link");

    // Locate the full title with a unique string
    const fullTitle = await page.textContent("text=Customize and automate");

    // Print the full title
    const logStatement = `The title of this blog post is ${fullTitle}`;
    console.log(logStatement);
    res.send(logStatement);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Playwright: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
