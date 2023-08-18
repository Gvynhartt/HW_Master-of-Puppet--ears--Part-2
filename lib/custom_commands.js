module.exports = {
  selectNdaysFromToday: async function (page, nmbOfDays) {
    try {
      const daySelector = "a.page-nav__day";
      await page.waitForSelector(daySelector);
      const arrDays = await page.$$(daySelector);
      await arrDays[nmbOfDays].click();
    } catch (error) {
      throw new Error(`Selector for day is not active: ${daySelector}`);
    }
  },

  clickPageElement: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      await page.click(selector);
    } catch (error) {
      throw new Error(`Selector is not active/visible: ${selector}`);
    }
  },

  selectRandomSeat: async function (page, seatType, seatNumber) {
    // место может быть "standard" или "VIP"
    let errorCausedBy = "JS did something beyond your comprehension";

    try {
      const selSeatStand =
        "div.buying-scheme__wrapper span.buying-scheme__chair_standart";
      const selSeatVIP =
        "div.buying-scheme__wrapper span.buying-scheme__chair_vip";
      const selSeatSelected = "span.buying-scheme__chair_selected";
      const selSeatTakenClass = "buying-scheme__chair_taken";

      const arrStandSeats = await page.$$(selSeatStand);
      const arrVipSeats = await page.$$(selSeatVIP);

      function getRandomIntIncl(min, max) { // функция для генерации случайного числа из диапазаона (включая границы)
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
      } // Своровано со StackOverflow, да-да.

      async function elementHasClass(elemByHandle, className) { // функция, проверяющая, есть ли некий класс у выбранного места
        const classNames = (
          await (await elemByHandle.getProperty('className')).jsonValue()
        ).split(/\s+/);
        console.log(classNames);
      
        return classNames.includes(className);
      } // И это тоже своровано со StackOverflow. Чую, к концу курса мне придётся на нём жениться...

      if (seatType === "standard") {
        const nmbStandSeatRng = getRandomIntIncl(0, arrStandSeats.length - 1);

        if (seatNumber === undefined) {

          if (await elementHasClass(arrStandSeats[nmbStandSeatRng], selSeatTakenClass)) {
            errorCausedBy = "Selected seat already taken";
            throw new Error(errorCausedBy);
          }
  
          await arrStandSeats[nmbStandSeatRng].click();
          await page.waitForSelector(selSeatSelected);
        } else {

          if (await elementHasClass(arrStandSeats[seatNumber - 1], selSeatTakenClass)) {
            errorCausedBy = "Selected seat already taken";
            throw new Error(errorCausedBy);
          }
  
          await arrStandSeats[seatNumber - 1].click();
          await page.waitForSelector(selSeatSelected);
        }
      }

      if (seatType === "VIP" && arrVipSeats.length > 0) {

        const nmbVipSeatRng = getRandomIntIncl(0, arrVipSeats.length - 1);

        if (seatNumber === undefined) {

          if (await elementHasClass(arrVipSeats[nmbVipSeatRng], selSeatTakenClass)) {
            errorCausedBy = "Selected seat already taken";
            throw new Error(errorCausedBy);
          }
  
          await arrVipSeats[nmbVipSeatRng].click();
          await page.waitForSelector(selSeatSelected);
        } else {

          if (await elementHasClass(arrVipSeats[seatNumber - 1], selSeatTakenClass)) {
            errorCausedBy = "Selected seat already taken";
            throw new Error(errorCausedBy);
          }
  
          await arrVipSeats[seatNumber - 1].click();
          await page.waitForSelector(selSeatSelected);
        }

        
      } else if (seatType === "VIP" && arrVipSeats.length === 0) {
        // это else if нужно, т.к. иначе при выборе стандартного места ошибка ниже будет запускаться по умолчанию
        errorCausedBy = "No VIP seats available in selected hall";
        throw new Error(errorCausedBy);
      }

    } catch (errorCausedBy) {
      throw new Error(`Selector for seat is not active/visible, reason:`, { cause: errorCausedBy});
    }
  },

  selectRandomHallByType: async function (page, hallType, hallNumber) {
    // зал тоже может быть "standard" или "VIP"

    try {
      const selHallAnyType = "li.movie-seances__time-block"; // селектор для залов с местами обоих типов

      const arrHallsAnyType = await page.$$(selHallAnyType); // все залы собираются в сводный массив
      const arrStandHalls = []; // массив для залов с обычными местами
      const arrVipHalls = []; // массив для залов и с обычными, и с VIP-местами

      for (let i = 0; i < arrHallsAnyType.length; i++) {
        if ((i + 1) % 2 === 1) {
          // т.е. каждый первый зал - в обычный массив

          arrStandHalls.push(arrHallsAnyType[i]);
        } else {
          // каждый второй - в VIP-массив

          arrVipHalls.push(arrHallsAnyType[i]);
        }
      }

      function getRandomIntIncl(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      if (hallType === "standard") {
        if (hallNumber === undefined) {

          const randomStandHall = getRandomIntIncl(0, arrStandHalls.length - 1);
          await arrStandHalls[randomStandHall].click();
        } else {

          await arrStandHalls[hallNumber - 1].click();
        }
      }

      if (hallType === "VIP") {
        if (hallNumber === undefined) {

          const randomVipHall = getRandomIntIncl(0, arrVipHalls.length - 1);
          await arrVipHalls[[randomVipHall]].click();
        } else {

          await arrVipHalls[[hallNumber]].click();
        }
        
      }
    } catch (error) {
      throw new Error(`Selectors for hall not visible/active`);
    }
  },
};
