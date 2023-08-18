// custom command imports
const { default: puppeteer } = require("puppeteer");
const {getRandomIntIncl, selectNdaysFromToday, clickPageElement, selectRandomSeat, selectRandomHallByType} = 
require("./lib/custom_commands.js");

const { KnownDevices } = require ("puppeteer");
const iPhoneSE = KnownDevices['iPhone SE'];

let page;

describe("Cinema booking site tests, Happy Path", () => { // блок describe, для которого будут работать хуки 
  
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("http://qamid.tmweb.ru/client/index.php");
  });
  
  afterEach(() => {
    page.close();
  });

  test("Happy path #1: book a standard ticket", async () => {

    const targetDay = 3;
    // выбираем сеансы спустя три дня
    const selDayChosen = "a.page-nav__day_chosen";
    await selectNdaysFromToday(page, targetDay);
    await page.waitForSelector(selDayChosen);

    await selectRandomHallByType(page, "standard");
    // const urlHallPage = window.location.href;
    // expect(urlHallPage).toEqual("http://qamid.tmweb.ru/client/hall.php");
    const selSeatScheme = "div.buying-scheme";
    await page.waitForSelector(selSeatScheme);

    await selectRandomSeat(page, "standard");
    const selSeatChosen = "span.buying-scheme__chair_selected";
    await page.waitForSelector(selSeatChosen);
    const selBookSeatBtn = "button.acceptin-button";
    await clickPageElement(page, selBookSeatBtn);
    const selTicketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selTicketHeader);
    // const urlPaymentPage = window.location.href;
    // expect(urlPaymentPage).toEqual("http://qamid.tmweb.ru/client/payment.php");

    const selQRcodeReceiveBtn = "div.ticket__info-wrapper button.acceptin-button";
    await clickPageElement(page, selQRcodeReceiveBtn);

    const selQRticketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selQRticketHeader);
    // const urlTicketPage = window.location.href;
    // expect(urlTicketPage).toEqual("http://qamid.tmweb.ru/client/ticket.php");

    await page.waitForSelector("div.ticket__info-wrapper img.ticket__info-qr");
    const ticketHint = await page.$eval("div.ticket__info-wrapper :nth-child(7)", element => element.textContent);
    expect(ticketHint).toEqual("Покажите QR-код нашему контроллеру для подтверждения бронирования.");
  }, 10000);

  test("Happy path #2: book a VIP ticket", async () => {

    const targetDay = 1;
    const selDayChosen = "a.page-nav__day_chosen";
    await selectNdaysFromToday(page, targetDay);
    // здесь нет рандома, ибо мне лень придумывать, как исключить выпадение текущего дня на странице
    await page.waitForSelector(selDayChosen);

    await selectRandomHallByType(page, "VIP");
    // можно выбрать номер зала вручную; если номер не указан - зал выбирается случайным образом
    const selSeatScheme = "div.buying-scheme";
    await page.waitForSelector(selSeatScheme);

    await selectRandomSeat(page, "VIP");
    // аналогично с залом - или выбирается вручную, или определяется случайно
    const selSeatChosen = "span.buying-scheme__chair_selected";
    await page.waitForSelector(selSeatChosen);
    const selBookSeatBtn = "button.acceptin-button";
    await clickPageElement(page, selBookSeatBtn);
    const selTicketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selTicketHeader);

    const selQRcodeReceiveBtn = "div.ticket__info-wrapper button.acceptin-button";
    await clickPageElement(page, selQRcodeReceiveBtn);

    const selQRticketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selQRticketHeader);

    await page.waitForSelector("div.ticket__info-wrapper img.ticket__info-qr");
    const ticketHint = await page.$eval("div.ticket__info-wrapper :nth-child(7)", element => element.textContent);
    expect(ticketHint).toEqual("Покажите QR-код нашему контроллеру для подтверждения бронирования.");
  }, 10000);
});

test("Sad path #1: book a standard ticket on mobile device", async () => {

  const page = await browser.newPage();
  await page.emulate(iPhoneSE);
  await page.goto("http://qamid.tmweb.ru/client/index.php");
  
  const targetDay = 2;
  const selDayChosen = "a.page-nav__day_chosen";
  await selectNdaysFromToday(page, targetDay);
  // здесь нет рандома, ибо мне лень придумывать, как исключить выпадение текущего дня на странице
  await page.waitForSelector(selDayChosen);

  await selectRandomHallByType(page, "standard", 2);
  // можно выбрать номер зала вручную; если номер не указан - зал выбирается случайным образом
  const selSeatScheme = "div.buying-scheme";
  await page.waitForSelector(selSeatScheme);
  const selBookSeatBtn = "button.acceptin-button";
  // не должна быть в видимой части экрана, т.к. схема зала не масштабируется

  function isElementHidden(page, selector, timeout) {
    return new Promise((resolve) => {
        page.waitForSelector(selector, {visible: false, timeout}).then(() => {
            resolve(true);
        }).catch(() => {
            resolve(false);
        });
    });
}
 const isBookButtonHidden = await isElementHidden(page, selBookSeatBtn, 500);
  
  expect(isBookButtonHidden).toEqual(true);

  // await browser.close();
}, 10000);

