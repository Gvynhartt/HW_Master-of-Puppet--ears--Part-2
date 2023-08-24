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

Given("user is on homepage {string} - 3", async function (string) {

    return await this.page.goto(`http://qamid.tmweb.ru/client/index.php${string}`);
});

When("user selects 2 days after current - 3", async function () {

    const targetDay = 2;
    const selDayChosen = "a.page-nav__day_chosen";
    await selectNdaysFromToday(this.page, targetDay);
    await this.page.waitForSelector(selDayChosen);
});

When("selects standard hall number 3 - 3", async function () {
    
    const targetHall = 3;
    await selectRandomHallByType(this.page, "standard", targetHall);
    const selSeatScheme = "div.buying-scheme";
    await this.page.waitForSelector(selSeatScheme);
});

When("selects standard seat number {int} - 3", async function (int) {

    const targetSeat = int; // берём место до 100
    await selectRandomSeat(this.page, "standard", targetSeat);
    const selSeatChosen = "span.buying-scheme__chair_selected";
    await this.page.waitForSelector(selSeatChosen);
});

When("submits selection with 'Book' button - 3", async function () {

    const selBookSeatBtn = "button.acceptin-button";
    await clickPageElement(this.page, selBookSeatBtn);
});

When("proceeds to payment page and sees ticket details - 3", async function () {

    const selTicketHeader = "header h2.ticket__check-title";
    await this.page.waitForSelector(selTicketHeader);
});

When("presses 'receive order QR code' button - 3", async function () {

    const selQRcodeReceiveBtn =
      "div.ticket__info-wrapper button.acceptin-button";
    await clickPageElement(this.page, selQRcodeReceiveBtn);
});

Then("user sees specified text in 'ticket hint' section - 3", async function () {

    await this.page.waitForSelector("div.ticket__info-wrapper img.ticket__info-qr");
    const ticketHint = await this.page.$eval(
      "div.ticket__info-wrapper :nth-child(7)",
      (element) => element.textContent
    );
    expect(ticketHint).equal(
      "Покажите QR-код нашему контроллеру для подтверждения бронирования."
    );
});

When("user goes back to homepage {string} - 3", async function (string) {

    return await this.page.goto(`http://qamid.tmweb.ru/client/index.php${string}`);
});

When("selects the same hall - 3", async function () {

    const targetDay = 2;
    await selectNdaysFromToday(this.page, targetDay);
    const selDayChosen = "a.page-nav__day_chosen";
    await this.page.waitForSelector(selDayChosen);
    const targetHall = 3;
    await selectRandomHallByType(this.page, "standard", targetHall);
    const selSeatScheme = "div.buying-scheme";
    await this.page.waitForSelector(selSeatScheme);
});

Then("sees a selected seat element in the scheme - 3", async function () {

    const selSeatTaken = "div.buying-scheme__wrapper buying-scheme__chair_taken";
    const isBookedSeatVisible = await checkIfElemtIsVisible(this.page, selSeatTaken, 500);
    expect(isBookedSeatVisible).to.be.true;
});

When("clicks on the same seat number {int} - 3", async function (int) {

    const selAllStandSeats = "div.buying-scheme__wrapper span.buying-scheme__chair_standart";
    const arrAllStandSeats = await this.page.$$(selAllStandSeats);
    const targetSeat = int;
    await arrAllStandSeats[targetSeat - 1].click();
});

Then("finds out that 'Book' button is not clickable - 3", async function () {

    const selBookButtonBlocked = "button.acceptin-button[disabled=true]";
    const isInDomBkBtnBlocked = await this.page.$(selBookButtonBlocked);
    expect(isInDomBkBtnBlocked).to.not.be.null;
});