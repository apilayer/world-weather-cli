#!/usr/bin/env node

const readline = require('readline');
const fetch = require('node-fetch');
const chalk = require('chalk');
const { URLSearchParams } = require('url');

const API_BASE_URL = 'http://api.weatherstack.com';
const DEFAULT_FORECAST_DAYS = 3;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function fetchWeather(city, apiKey, endpoint = 'forecast') {
  const params = new URLSearchParams({
    access_key: apiKey,
    query: city,
    units: 'm',
  });

  if (endpoint === 'forecast') {
    params.set('forecast_days', String(DEFAULT_FORECAST_DAYS));
    params.set('hourly', '1');
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}?${params.toString()}`);
  const rawBody = await response.text();
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (parseErr) {
    if (!response.ok) {
      throw new Error(
        `Weatherstack request failed with status ${response.status} and a non-JSON response: ${rawBody.slice(
          0,
          120
        )}`
      );
    }
    throw parseErr;
  }

  if (!response.ok) {
    const message = payload?.error?.info || JSON.stringify(payload);
    const error = new Error(`Weatherstack request failed with status ${response.status}: ${message}`);
    error.code = response.status;
    error.details = payload?.error || null;
    throw error;
  }
  if (payload.error) {
    const info = payload.error.info || 'Unknown API error';
    throw new Error(`Weatherstack error: ${info}`);
  }

  return payload;
}

function printCurrent(current, location) {
  console.log(chalk.bold.cyan(`\nCurrent conditions for ${location.name}, ${location.country}`));
  console.log(chalk.gray(`Local time: ${location.localtime}`));
  console.log(`${chalk.yellow('Conditions:')} ${current.weather_descriptions?.join(', ') || 'N/A'}`);
  console.log(`${chalk.yellow('Temperature:')} ${current.temperature}°C (feels like ${current.feelslike}°C)`);
  console.log(`${chalk.yellow('Humidity:')} ${current.humidity}%   ${chalk.yellow('Cloud cover:')} ${current.cloudcover}%`);
  console.log(`${chalk.yellow('Wind:')} ${current.wind_speed} km/h ${current.wind_dir} (${current.wind_degree}°)`);
  console.log(`${chalk.yellow('Pressure:')} ${current.pressure} hPa   ${chalk.yellow('Visibility:')} ${current.visibility} km`);
  console.log(`${chalk.yellow('UV Index:')} ${current.uv_index}   ${chalk.yellow('Precipitation:')} ${current.precip} mm`);
}

function formatDescription(hourly = []) {
  const slot = hourly.find(
    (entry) => Array.isArray(entry.weather_descriptions) && entry.weather_descriptions.length > 0
  );
  return slot ? slot.weather_descriptions[0] : 'N/A';
}

function printForecast(forecast = {}) {
  const dates = forecast ? Object.keys(forecast).sort() : [];
  if (!dates.length) {
    console.log(chalk.yellow('\nNo forecast data available for your plan.'));
    return;
  }

  console.log(chalk.bold.magenta('\nUpcoming forecast'));
  dates.forEach((dateKey) => {
    const day = forecast[dateKey];
    const desc = formatDescription(day.hourly);
    const astro = day.astro || {};
    const label = chalk.green(dateKey);

    console.log(`\n${label} — ${chalk.white(desc)}`);
    console.log(`  ${chalk.yellow('Avg temp:')} ${day.avgtemp ?? 'N/A'}°C`);
    console.log(
      `  ${chalk.yellow('Min/Max:')} ${day.mintemp ?? 'N/A'}°C / ${day.maxtemp ?? 'N/A'}°C`
    );
    if (astro.sunrise || astro.sunset) {
      console.log(`  ${chalk.yellow('Sunrise/Sunset:')} ${astro.sunrise || 'N/A'} / ${astro.sunset || 'N/A'}`);
    }
    console.log(
      `  ${chalk.yellow('UV Index:')} ${day.uv_index ?? 'N/A'}   ${chalk.yellow(
        'Snowfall:'
      )} ${day.totalsnow ?? 0} cm`
    );
  });
}

async function main() {
  const apiKey = process.env.WEATHERSTACK_API_KEY;
  if (!apiKey) {
    console.error(
      chalk.red('Missing WEATHERSTACK_API_KEY environment variable. Please set it and retry.')
    );
    process.exitCode = 1;
    return;
  }

  const city = await ask(chalk.blue('Enter city or location: '));
  if (!city) {
    console.error(chalk.red('City is required — please run the command again and provide a location.'));
    process.exitCode = 1;
    return;
  }

  try {
    console.log(chalk.gray('\nFetching weather data...'));
    let data;
    try {
      data = await fetchWeather(city, apiKey, 'forecast');
    } catch (err) {
      const planLimit =
        err.message &&
        /plan does not support weather forecast data|upgrade your account/i.test(err.message);
      if (!planLimit) {
        throw err;
      }
      console.log(
        chalk.yellow(
          '\nYour current subscription does not provide forecast data. Showing current conditions only.'
        )
      );
      data = await fetchWeather(city, apiKey, 'current');
    }
    printCurrent(data.current, data.location);
    printForecast(data.forecast);
  } catch (err) {
    console.error(chalk.red(`\n${err.message}`));
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
