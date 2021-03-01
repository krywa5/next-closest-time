const btn = document.querySelector("[data-submit-btn]");
const inputTime = document.querySelector("[data-input-time]");
const closestTime = document.querySelector("[data-closest-time]");
const closestTimeMinutes = document.querySelector(
  "[data-closest-time-minutes]"
);
const form = document.querySelector("form");

let availableDigits = []; // wszystkie dostępne cyfry

// Zakładam że jeśli cyfry mogą dawać tylko 1 godzinę, np: 23:59, to najbliższa taka godzina wydarzy się za 24h => 1440 minuty

const maxDigits = {
  hour: {
    first: 2,
    secondA: 9,
    secondB: 3, // gdy hour.first > 1 to secondB jest maksymalną cyfrą na drugim miejscu
  },
  minutes: {
    first: 5,
    second: 9,
  },
};

// obliczone wartości
let closestTimeCalc, closestTimeMinutesCalc;

const convertToMinutes = (time) => {
  // przekonwertowanie HH:MM do ilości minut
  const fieldArray = time.split(":");
  const minutes = parseInt(fieldArray[0]) * 60 + parseInt(fieldArray[1]);

  if (minutes === 0) {
    return 24 * 60; // jeśli godzina będzie widoczna za 0 minut to znaczy że taka godzina będzie widoczna za 24h
  } else {
    return minutes;
  }
};

const timeDiff = (start, end) => {
  // wyznaczenie różnicy między podanymi czasami w formacie HH:MM
  start = start.split(":");
  end = end.split(":");

  const startDate = new Date(0, 0, 0, start[0], start[1], 0);
  const endDate = new Date(0, 0, 0, end[0], end[1], 0);
  let diff = endDate.getTime() - startDate.getTime();
  let hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  if (hours < 0) hours = hours + 24;

  const hoursMinutes =
    (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;

  return convertToMinutes(hoursMinutes);
};

const getDigitsFromTime = (time) => {
  const output = [];

  const digitsArr = time.split("");

  digitsArr.forEach((el) => {
    const number = Number(el);

    if (!isNaN(number)) {
      output.push(number);
    }
  });

  return output; // output to array
};

const isVariantPossible = (variant) => {
  const insideAvailableDigits = [...availableDigits];
  const h1 = Number(variant[0]);
  const h2 = Number(variant[1]);
  const m1 = Number(variant[3]);
  const m2 = Number(variant[4]);

  let output = true;

  if (insideAvailableDigits.includes(h1)) {
    const h1Index = insideAvailableDigits.indexOf(h1);
    insideAvailableDigits.splice(h1Index, 1); // jeśli cyfra jest dostępna to ją usuń z tablicy żeby w dalszych iteracjach nie była dostępna
  } else {
    output = false; // jeśli cyfra nie jest dostępna to oznacza że wariant nie jest możliwy
  }

  if (insideAvailableDigits.includes(h2)) {
    const h2Index = insideAvailableDigits.indexOf(h2);
    insideAvailableDigits.splice(h2Index, 1);
  } else {
    output = false;
  }

  if (insideAvailableDigits.includes(m1)) {
    const m1Index = insideAvailableDigits.indexOf(m1);
    insideAvailableDigits.splice(m1Index, 1);
  } else {
    output = false;
  }

  if (insideAvailableDigits.includes(m2)) {
    const m2Index = insideAvailableDigits.indexOf(m2);
    insideAvailableDigits.splice(m2Index, 1);
  } else {
    output = false;
  }

  return output;
};

const calculate = () => {
  if (!inputTime.value || inputTime.value.length !== 5) return;

  availableDigits.length = 0; // wyczyszczenie tablicy
  availableDigits = getDigitsFromTime(inputTime.value); // przypisanie nowych wartości

  // sprawdzenie czy wystarczy zamienić cyfry minut miejscami
  if (
    availableDigits[2] < availableDigits[3] &&
    availableDigits[3] <= maxDigits.minutes.first
  ) {
    const time = `${availableDigits[0]}${availableDigits[1]}:${availableDigits[3]}${availableDigits[2]}`;
    closestTime.innerText = time;
    closestTimeMinutes.innerText = timeDiff(inputTime.value, time);

    return; // różnica ustalona, można wyjść z funkcji
  } else {
    // stworzenie wszystkich możliwych godzin i porównanie która wystąpi najszybciej
    const allVariants = [];

    for (let h1 = 0; h1 <= maxDigits.hour.first; h1++) {
      for (
        let h2 = 0;
        h2 <= (h1 > 1 ? maxDigits.hour.secondB : maxDigits.hour.secondA);
        h2++
      ) {
        for (let m1 = 0; m1 <= maxDigits.minutes.first; m1++) {
          for (let m2 = 0; m2 <= maxDigits.minutes.second; m2++) {
            const time = `${h1}${h2}:${m1}${m2}`; // aktualny wariant HH:MM
            const minutes = timeDiff(inputTime.value, time); // ilość minut od wpisanej godziny do aktualnego wariantu

            const variantObject = {
              time,
              minutes,
            };

            if (isVariantPossible(time)) {
              allVariants.push(variantObject); // jeśli variant jest możliwy to dodaj go do tablicy
            }
          }
        }
      }
    }

    // posortowanie tablicy na podstawie minut do godziny. Pierwszy element w arrayu będzie tą godziną która nas interesuje.
    allVariants.sort((variantA, variantB) => {
      if (variantA.minutes < variantB.minutes) {
        return -1;
      }
      if (variantA.minutes > variantB.minutes) {
        return 1;
      }
      return 0;
    });

    closestTime.innerText = allVariants[0]?.time;
    closestTimeMinutes.innerText = allVariants[0]?.minutes;
  }
};

form.addEventListener("submit", (e) => e.preventDefault());
btn.addEventListener("click", calculate);
