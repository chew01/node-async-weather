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

async function loadGiphyByWeather(weather) {
  const img = document.querySelector('img');
  const giphy = await fetch(
    `https://api.giphy.com/v1/gifs/translate?s=${weather}&api_key=CUkT5V2SsV1JP3l05wHNCYNFDKKX7wrx`
  );
  const processedGiphy = giphy.json();
  processedGiphy.then((gif) => {
    img.src = gif.data.images.original.url;
    console.log(img.src);
  });
}

async function retrieveDataForLocation(location) {
  try {
    const data = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=3e79bfb50cc96045241305c0e397eef4`,
      { mode: 'cors' }
    );
    if (data.status === 200) {
      return data.json();
    }
    if (data.status === 400) {
      throw new Error('City cannot be empty!');
    }
    if (data.status === 404) {
      throw new Error(`${location} is not a valid city!`);
    }
  } catch (err) {
    alert(err);
  }
}

async function processWeatherData(location) {
  try {
    const data = await retrieveDataForLocation(location);
    const { main, weather, name, ...rest } = data;
    return { main, weather, name };
  } catch (err) {
    console.log(err);
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
    await loadGiphyByWeather(`${processedData.weather[0].main} weather`);
    loadingMessageOver();
  } catch (err) {
    console.log(err);
    loadingMessageOver();
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
