# World Weather CLI

Interactive Node.js CLI that fetches current conditions and a short forecast from the Weatherstack API, then displays the results with colorized, readable formatting.

## Prerequisites

- Node.js 16+ (global `fetch` is not required; the project bundles `node-fetch`)
- Weatherstack account with an API key (sign up at weatherstack.com)

## Setup

```bash
npm install
export WEATHERSTACK_API_KEY=your_access_key_here
```

## Usage

Run the CLI with either `npm start` or the installed binary:

```bash
npm start
# or, after a global or local install
npx world-weather
```

The tool will prompt for a city or location name, call `http://api.weatherstack.com/forecast`, and then print the current readings plus the next few days of forecast data. If your Weatherstack plan does not include the forecast endpoint, the CLI automatically falls back to the current-conditions endpoint and will let you know that forecast data is unavailable.

If you want to experiment without hitting the API, store any sample Weatherstack response locally and inspect it with `jq` or another JSON viewer.
