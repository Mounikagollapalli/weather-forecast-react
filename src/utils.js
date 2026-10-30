export const toTemp = (c, unit) =>
  Math.round(unit === 'F' ? (c * 9) / 5 + 32 : c);

export const toSpeed = (ms, unit) =>
  unit === 'F' ? `${Math.round(ms * 2.237)} mph` : `${Math.round(ms * 3.6)} km/h`;

// OpenWeatherMap returns UTC seconds + a timezone offset (seconds) for the city
export const cityDate = (dt, tz) => new Date((dt + tz) * 1000);

export const fmtTime = (dt, tz) =>
  cityDate(dt, tz).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: 'UTC',
  });

export const fmtDay = (dt, tz, opts = { weekday: 'short' }) =>
  cityDate(dt, tz).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });

export const icon = (code, size = '4x') =>
  `https://openweathermap.org/img/wn/${code}@${size}.png`;