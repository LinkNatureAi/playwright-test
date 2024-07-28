const playwright = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadMp3(url, outputPath) {
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await axios.get(url, { responseType: 'stream' });
            const writer = fs.createWriteStream(outputPath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error) {
            if (attempt < maxRetries - 1) {
                console.log(`Retrying download for ${url}... (attempt ${attempt + 1})`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                console.error(`Failed to download MP3 file from ${url}: ${error.message}`);
                throw error;
            }
        }
    }
}

async function processTerm(term, translation, outputFolder) {
    const filePath = path.join(outputFolder, `${translation}.mp3`);

    if (fs.existsSync(filePath)) {
        console.log(`MP3 file already exists for ${translation}, skipping download.`);
        return;
    }

    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const retryAttempts = 3;
        for (let attempt = 0; attempt < retryAttempts; attempt++) {
            try {
                await page.goto("https://ttsfree.com/text-to-speech/hindi-india", { timeout: 90000 });
                break;
            } catch (error) {
                if (attempt < retryAttempts - 1) {
                    console.log(`Retrying navigation for term '${term}'... (attempt ${attempt + 1})`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    console.error(`Failed to navigate to the page for term '${term}': ${error.message}`);
                    return;
                }
            }
        }

        await page.fill('textarea[name="input_text"]', term);
        await page.click('//*[@id="voice_name_bin"]/div[2]');
        await page.click('//*[@id="frm_tts"]/div[2]/div[2]/div[1]/a');

        await page.waitForSelector('//*[@id="progessResults"]/div[2]/audio', { timeout: 90000 });
        const audioSrc = await page.getAttribute('//*[@id="progessResults"]/div[2]/audio/source', 'src');

        fs.mkdirSync(outputFolder, { recursive: true });

        await downloadMp3(audioSrc, filePath);
        console.log(`Downloaded MP3 file to ${filePath}`);

    } catch (error) {
        console.error(`Error processing term '${term}': ${error.message}`);
    } finally {
        await browser.close();
    }
}

async function main() {
    const termMappings = {
        "सौ": "Hundred",
        "हजार": "Thousand",
        "लाख": "Lakh",
        "करोड़": "Crore",
        "वोल्टेज": "Voltage",
        "एम्पीयर": "Ampere",
        "मिलीसेकंड": "Millisecond",
        "मिनट।": "Minute",
        "घंटा": "Hour",
        "मिली": "Milli",
        "रविवार": "Sunday",
        "सोमवार": "Monday",
        "मंगलवार": "Tuesday",
        "बुधवार": "Wednesday",
        "गुरुवार": "Thursday",
        "शुक्रवार": "Friday",
        "शनिवार": "Saturday",
        "आज": "Today",
        "है।": "Is",
        "है, और समय": "IsAndTheTime",
        "बज के": "Oclock",
        "साल": "Year",
        "महीना": "Month",
        "हफ्ता": "Week",
        "दिन": "Day",
        "घड़ी": "Clock",
        "सेकंड": "Second",
        "डिग्री": "Degree",
        "प्रतिशत": "Percentage",
        "परसेंट": "Percent",
        "ग्रेड": "Grade",
        "फैरेनहाइट": "Fahrenheit",
        "सेंटिग्रेड": "Celsius",
        "समीकरण": "Equation",
        "गुणा": "Multiply",
        "भाग": "Divide",
        "जोड़": "Add",
        "घटाना": "Subtract",
        "प्रति": "Per",
        "किलो": "Kilogram",
        "मीटर": "Meter",
        "सेंटीमीटर": "Centimeter",
        "मिलीमीटर": "Millimeter",
        "लिटर": "Liter",
        "गैलन": "Gallon",
        "पाउंड": "Pound",
        "आउंस": "Ounce",
        "कैलोरी": "Calorie",
        "जूल": "Joule",
        "वाट": "Watt",
        "हर्ट्ज़": "Hertz"
    };

    for (let i = 0; i <= 100; i++) {
        termMappings[i.toString()] = i.toString();
    }

    const outputFolder = 'mp3_files';

    for (const [term, translation] of Object.entries(termMappings)) {
        try {
            await processTerm(term, translation, outputFolder);
            console.log(`Successfully created ${translation}.mp3`);
        } catch (error) {
            console.error(`Error creating MP3 for ${term}: ${error.message}`);
        }
    }
}

module.exports = { scrapeLogic: main };
