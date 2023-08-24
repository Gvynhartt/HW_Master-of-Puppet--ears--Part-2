const puppeteer = require("puppeteer");
const chai = require("chai");
const expect = chai.expect;
const { Given, When, Then, Before, After, setDefaultTimeout } = require("cucumber");
const {
    selectNdaysFromToday,
    clickPageElement,
    selectRandomSeat,
    selectRandomHallByType,
    checkIfElemtIsVisible, // добавлена для нового Sad Path
} = require("../../lib/custom_commands.js");

const { KnownDevices } = require("puppeteer");
const iPhoneSE = KnownDevices["iPhone SE"];

setDefaultTimeout(10000);

Before(async function () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await this.page.emulate(iPhoneSE);
    this.browser = browser;
    this.page = page;
});

Given("user goes to homepage {string} emulated for specified device - 4", async function (string) {

    return await this.page.goto(`http://qamid.tmweb.ru/client/index.php${string}`);
});

When("user selects 2 days after current - 4", async function () {

    const targetDay = 2;
    const selDayChosen = "a.page-nav__day_chosen";
    await selectNdaysFromToday(this.page, targetDay);
    await this.page.waitForSelector(selDayChosen);
});

When("selects standard hall number 2 - 4", async function () {

    await selectRandomHallByType(this.page, "standard");
    const selSeatScheme = "div.buying-scheme";
    await this.page.waitForSelector(selSeatScheme);
});

Then("the 'Book' button is not in viewport - 4", async function () {

    function isElementHidden(page, selector, timeout) {
        return new Promise((resolve) => {
          page
            .waitForSelector(selector, { visible: false, timeout })
            .then(() => {
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        });
    }

    const selBookSeatBtn = "button.acceptin-button";
    const isBookButtonHidden = await isElementHidden(this.page, selBookSeatBtn, 500);
    
    expect(isBookButtonHidden).to.be.true;
});