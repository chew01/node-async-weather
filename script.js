let cache = {};
let preferredUnit = 'Celsius';
let defined = false;

const toCelsius = (kelvin) => kelvin - 273.15;
const toFahrenheit = (kelvin) => (kelvin - 273.15) * (9 / 5) + 32;

const generateLines = (city, weather, temp, low, high, unit) => {
  const display = Array.from(document.querySelectorAll('#display p'));

  display[0].textContent = `City: ${city}`;
  display[1].textContent = `Weather: ${weather}`;
  display[2].textContent = `Temperature: ${temp} ${unit}`;
  display[3].textContent = `Lows: ${low} ${unit}`;
  display[4].textContent = `Highs: ${high} ${unit}`;
  defined = true;
};

const generateLinesInCelsius = () => {
  const temp = Math.round(toCelsius(cache.temp) * 10) / 10;
  const low = Math.round(toCelsius(cache.low) * 10) / 10;
  const high = Math.round(toCelsius(cache.high) * 10) / 10;
  generateLines(cache.city, cache.weather, temp, low, high, 'Celsius');
};

const generateLinesInFahrenheit = () => {
  const temp = Math.round(toFahrenheit(cache.temp) * 10) / 10;
  const low = Math.round(toFahrenheit(cache.low) * 10) / 10;
  const high = Math.round(toFahrenheit(cache.high) * 10) / 10;
  generateLines(cache.city, cache.weather, temp, low, high, 'Fahrenheit');
};

const generateLinesInPreferredUnit = () => {
  if (preferredUnit === 'Celsius') {
    generateLinesInCelsius();
  } else {
    generateLinesInFahrenheit();
  }
};

const cacheData = (city, weather, temp, low, high) => {
  cache = { city, weather, temp, low, high };
};

const loadingMessage = () => {
  const body = document.querySelector('body');
  const loading = document.createElement('p');
  loading.textContent = 'Loading...';
  body.appendChild(loading);
};

const loadingMessageOver = () => {
  const body = document.querySelector('body');
  body.removeChild(body.lastChild);
};

async function retrieveDataForLocation(location) {
  try {
    const data = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=3e79bfb50cc96045241305c0e397eef4`,
      { mode: 'cors' }
    );
    return data.json();
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function processWeatherData(location) {
  try {
    const data = await retrieveDataForLocation(location);
    const { main, weather, name, ...rest } = data;
    return { main, weather, name };
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function createDisplayData(location) {
  try {
    loadingMessage();
    const processedData = await processWeatherData(location);
    cacheData(
      processedData.name,
      processedData.weather[0].main,
      processedData.main.temp,
      processedData.main.temp_min,
      processedData.main.temp_max
    );
    generateLinesInPreferredUnit();
    loadingMessageOver();
  } catch (err) {
    console.log(err);
  }
}

const input = document.querySelector('#location');
const searchButton = document.querySelector('#search');
searchButton.addEventListener('click', () => createDisplayData(input.value));

const unitButton = document.querySelector('#unit');
unitButton.addEventListener('click', () => {
  if (defined === false) {
    if (preferredUnit === 'Celsius') {
      preferredUnit = 'Fahrenheit';
      unitButton.textContent = 'Change to Celsius';
    } else {
      preferredUnit = 'Celsius';
      unitButton.textContent = 'Change to Fahrenheit';
    }
  } else if (preferredUnit === 'Celsius') {
    preferredUnit = 'Fahrenheit';
    unitButton.textContent = 'Change to Celsius';
    generateLinesInPreferredUnit();
  } else {
    preferredUnit = 'Celsius';
    unitButton.textContent = 'Change to Fahrenheit';
    generateLinesInPreferredUnit();
  }
});
