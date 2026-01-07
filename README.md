# World Weather CLI

Interactive Node.js command-line tool that fetches current conditions and a short forecast from the [Weatherstack](https://weatherstack.com/) API, then displays the results with colorized, readable formatting.

## Get Started

### 1. Clone the repository

```bash
git clone https://github.com/apilayer/world-weather-cli.git
cd world-weather-cli
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

1. Sign up for the Weatherstack API to obtain an access key.
2. Export the key before running the CLI (no `.env` loader is used):

```bash
export WEATHERSTACK_API_KEY=your_access_key_here
```

Optionally, if your plan does not support forecasts (or you want to reduce API calls), skip the forecast endpoint entirely:

```bash
export WEATHERSTACK_FORCE_CURRENT=1
```

### 4. Run the CLI

```bash
npm start
# or, after install/link
npx world-weather
```

## Features Implemented

### 1. Interactive prompts

- Asks for a city or location, validates non-empty input.

### 2. Forecast with automatic fallback

- Requests a 3-day forecast (`forecast` endpoint).
- Detects plan limits and gracefully falls back to current conditions (`current` endpoint) with a notice.

### 3. Rich terminal output

- Colorized sections via `chalk` for readability.
- Displays temperatures, humidity, cloud cover, wind, pressure, visibility, UV index, precipitation, and sunrise/sunset when available.

### 4. Error handling

- Clear messaging for missing API key, API errors, non-JSON responses, and empty input.

## Tech Stack

### Backend (CLI)

- **Node.js** runtime
- **readline** for user interaction
- **node-fetch** for Weatherstack HTTP calls
- **chalk** for colored terminal output

### Frontend

- Not applicable (command-line interface only)

## API Endpoint

```
GET http://api.weatherstack.com/forecast?access_key={YOUR_KEY}&query={CITY}&units=m&forecast_days=3&hourly=1
```

If the forecast endpoint is not available for your plan, the CLI switches to:

```
GET http://api.weatherstack.com/current?access_key={YOUR_KEY}&query={CITY}&units=m
```

## Usage Flow

1. User runs the CLI and enters a city/location.
2. CLI calls Weatherstack `forecast` with metric units.
3. On plan limitation, falls back to `current`.
4. Prints current readings and (when available) the upcoming forecast.

## Key Components

### `bin/world-weather.js`

- Prompt handling with `readline`.
- Weatherstack request builder using `URLSearchParams`.
- Forecast-first fetch with fallback to current.
- Formatting and output helpers for current and forecast data.

## Notes

- Requires `WEATHERSTACK_API_KEY` set in the environment.
- Uses metric units (`units=m`) by default.
- Exits with non-zero status on missing key, empty input, or API errors.

## Future Enhancements

- Add automated tests and fixtures for API responses.
- Support alternative units (imperial/US).
- Optional `.env` support for local development.
- Allow batch queries or argument-based invocation (e.g., `world-weather "New York"`).
