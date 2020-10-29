const puppeteer = require("puppeteer");
const C = require("../config/keys");
const USERNAME_SELECTOR = "#username";
const PASSWORD_SELECTOR = "#password";
const CTA_SELECTOR = "#_submit";

async function startBrowser() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  return { browser, page };
}

async function closeBrowser(browser) {
  return browser.close();
}

async function playTest(url) {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });
  await page.goto(url);
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(C.username);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(C.password);
  await page.click(CTA_SELECTOR);
  await page.waitForNavigation();
  console.log("waiting 5sec to get screenshot");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.screenshot({ path: "radioco.png" });
  console.log("took screenshot");
  closeBrowser(browser);
}

(async () => {
  await playTest("https://studio.radio.co/login");
})();
