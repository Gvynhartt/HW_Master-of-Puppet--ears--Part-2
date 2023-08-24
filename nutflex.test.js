// custom command imports
const { default: puppeteer } = require("puppeteer");
const {
  selectNdaysFromToday,
  clickPageElement,
  selectRandomSeat,
  selectRandomHallByType,
  checkIfElemtIsVisible, // добавлена для нового Sad Path
} = require("./lib/custom_commands.js");

const { KnownDevices } = require("puppeteer");
const iPhoneSE = KnownDevices["iPhone SE"];

let page;

describe("Cinema booking site tests, any platform", () => {

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
    const selSeatScheme = "div.buying-scheme";
    await page.waitForSelector(selSeatScheme);

    await selectRandomSeat(page, "standard");
    const selSeatChosen = "span.buying-scheme__chair_selected";
    await page.waitForSelector(selSeatChosen);

    const selBookSeatBtn = "button.acceptin-button";
    await clickPageElement(page, selBookSeatBtn);

    const selTicketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selTicketHeader);

    const selQRcodeReceiveBtn =
      "div.ticket__info-wrapper button.acceptin-button";
    await clickPageElement(page, selQRcodeReceiveBtn);

    const selQRticketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selQRticketHeader);

    await page.waitForSelector("div.ticket__info-wrapper img.ticket__info-qr");
    const ticketHint = await page.$eval(
      "div.ticket__info-wrapper :nth-child(7)",
      (element) => element.textContent
    );
    expect(ticketHint).toEqual(
      "Покажите QR-код нашему контроллеру для подтверждения бронирования."
    );
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

    const selQRcodeReceiveBtn =
      "div.ticket__info-wrapper button.acceptin-button";
    await clickPageElement(page, selQRcodeReceiveBtn);

    const selQRticketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selQRticketHeader);

    await page.waitForSelector("div.ticket__info-wrapper img.ticket__info-qr");
    const ticketHint = await page.$eval(
      "div.ticket__info-wrapper :nth-child(7)",
      (element) => element.textContent
    );
    expect(ticketHint).toEqual(
      "Покажите QR-код нашему контроллеру для подтверждения бронирования."
    );
  }, 10000);

  test("Sad path #1: attempt to re-book an already booked seat", async () => {

    // сперва бронируем конкретное место на конкретном сеансе (т.е. БЕЗ рандома)
    const targetDay = 2;
    const targetHall = 3;
    const targetSeat = 27; // берём место до 100
    const selDayChosen = "a.page-nav__day_chosen";
    await selectNdaysFromToday(page, targetDay);
    await page.waitForSelector(selDayChosen);
  
    await selectRandomHallByType(page, "standard", targetHall);
    const selSeatScheme = "div.buying-scheme";
    await page.waitForSelector(selSeatScheme);
  
  
    await selectRandomSeat(page, "standard", targetSeat);  
    const selSeatChosen = "span.buying-scheme__chair_selected";
    await page.waitForSelector(selSeatChosen);
    const selBookSeatBtn = "button.acceptin-button";
    await clickPageElement(page, selBookSeatBtn);
    const selTicketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selTicketHeader);
  
    const selQRcodeReceiveBtn =
      "div.ticket__info-wrapper button.acceptin-button";
    await clickPageElement(page, selQRcodeReceiveBtn);
  
    const selQRticketHeader = "header h2.ticket__check-title";
    await page.waitForSelector(selQRticketHeader);
  
    await page.waitForSelector("div.ticket__info-wrapper img.ticket__info-qr");
    const ticketHint = await page.$eval(
      "div.ticket__info-wrapper :nth-child(7)",
      (element) => element.textContent
    );
    expect(ticketHint).toEqual(
      "Покажите QR-код нашему контроллеру для подтверждения бронирования."
    );
  
    // итак, место забронировано, теперь начинаем творить грязь
  
    // возвращаемся на глагне
    await page.goto("http://qamid.tmweb.ru/client/index.php");
    // выбираем те же день/фильм/сеанс
    await selectNdaysFromToday(page, targetDay);
    await page.waitForSelector(selDayChosen);
  
    await selectRandomHallByType(page, "standard", targetHall);
    await page.waitForSelector(selSeatScheme);
    // дальше для верности нужно проверить, помечено ли наше место как занятое.
    // Тут-то и пригодится новый метод
    const selSeatTaken = "div.buying-scheme__wrapper buying-scheme__chair_taken";
    const isBookedSeatVisible = await checkIfElemtIsVisible(page, selSeatTaken, 500);
    expect(isBookedSeatVisible).toBe(true);
    
    // как проверить, выдаёт ли кастомная функция прописанную на соответствующий случай ошибку?
    // expect(() => selectRandomSeat(page, "standard", targetSeat)).toThrow(Error);
    // когда я делаю так, тест просто падает с обычной ошибкой из кастомной функции, и никакого ассерта с ошибкой не проходит
    // поэтому придётся написать более тупорылую проверку
    
    const selAllStandSeats = "div.buying-scheme__wrapper span.buying-scheme__chair_standart";
    const arrAllStandSeats = await page.$$(selAllStandSeats);
    
    await arrAllStandSeats[targetSeat - 1].click();
    const selBookButtonBlocked = "button.acceptin-button[disabled=true]";
    const isInDomBkBtnBlocked = await page.$(selBookButtonBlocked);
    expect(isInDomBkBtnBlocked).not.toBe(null);
  
  }, 10000);
});

test("Sad path #2: book a standard ticket on a peculiar mobile device", async () => {
  // в принципе, этот сценарий всё равно тестирует использование сайта некорректным образом
  // (слишком экзотическое соотношение сторон у устройства), поэтому я его оставлю
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
  const isBookButtonHidden = await isElementHidden(page, selBookSeatBtn, 500);

  expect(isBookButtonHidden).toEqual(true);
}, 10000);



