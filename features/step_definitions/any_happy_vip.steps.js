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

    this.browser = browser;
    this.page = page;
});

After(async function () {
    if (this.page) {
        await this.page.close();
    }
})

Given("user is on homepage {string} 2", async function (string) {

    return await this.page.goto(`http://qamid.tmweb.ru/client/index.php${string}`);
});

When("user selects 1 day from current 2", async function () {

    const targetDay = 1;
    const selDayChosen = "a.page-nav__day_chosen";
    await selectNdaysFromToday(this.page, targetDay);
    await this.page.waitForSelector(selDayChosen);
});

When("selects a random VIP hall 2", async function () {

    await selectRandomHallByType(this.page, "VIP");
    const selSeatScheme = "div.buying-scheme";
    await this.page.waitForSelector(selSeatScheme);
});

When("selects a random VIP seat 2", async function () {

    await selectRandomSeat(this.page, "VIP");
    const selSeatChosen = "span.buying-scheme__chair_selected";
    await this.page.waitForSelector(selSeatChosen);
});

When("submits selection with 'Book' button 2", async function () {

    const selBookSeatBtn = "button.acceptin-button";
    await clickPageElement(this.page, selBookSeatBtn);
});

When("proceeds to payment page and sees ticket details 2", async function () {

    const selTicketHeader = "header h2.ticket__check-title";
    // await checkIfElemtIsVisible(this.page, selTicketHeader, 500);
    await this.page.waitForSelector(selTicketHeader);
});

When("presses 'receive order QR code' button 2", async function () {

    const selQRcodeReceiveBtn =
      "div.ticket__info-wrapper button.acceptin-button";
    await clickPageElement(this.page, selQRcodeReceiveBtn);
});

Then("user sees specified text in 'ticket hint' section 2", async function () {

    await this.page.waitForSelector("div.ticket__info-wrapper img.ticket__info-qr");
    const ticketHint = await this.page.$eval(
      "div.ticket__info-wrapper :nth-child(7)",
      (element) => element.textContent
    );
    expect(ticketHint).equal(
      "Покажите QR-код нашему контроллеру для подтверждения бронирования."
    );
});