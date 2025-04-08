const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
    ],
    executablePath: 
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    headless: 'new' // Thêm chế độ headless mới
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://developer.chrome.com/", {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Kiểm tra selector trước khi thao tác
    const searchBoxSelector = 'input[type="search"], .search-box__input, #search';
    await page.waitForSelector(searchBoxSelector, { timeout: 5000 });

    // Thao tác với search box
    await page.type(searchBoxSelector, "automate beyond recorder");

    // Chờ và click kết quả
    const resultSelector = '.search-result__link, a[href*="automate"]';
    await page.waitForSelector(resultSelector, { timeout: 5000 });
    await page.click(resultSelector);

    // Lấy nội dung
    const contentSelector = 'h1, .article-title';
    await page.waitForSelector(contentSelector, { timeout: 5000 });
    const title = await page.$eval(contentSelector, el => el.textContent.trim());

    res.send(`Success! Article title: ${title}`);
  } catch (e) {
    console.error('Full error:', e);
    res.status(500).send(`Error: ${e.message}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
