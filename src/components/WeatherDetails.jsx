import { toSpeed, fmtTime } from '../utils';

export default function WeatherDetails({ data, unit }) {
  const tz = data.timezone;
  const tiles = [
    { icon: '💧', label: 'Humidity', value: `${data.main.humidity}%`, bar: data.main.humidity },
    { icon: '🌬️', label: 'Wind', value: toSpeed(data.wind.speed, unit), sub: `${data.wind.deg ?? 0}°` },
    { icon: '🧭', label: 'Pressure', value: `${data.main.pressure} hPa` },
    { icon: '👁️', label: 'Visibility', value: `${(data.visibility / 1000).toFixed(1)} km` },
    { icon: '☁️', label: 'Clouds', value: `${data.clouds.all}%`, bar: data.clouds.all },
    { icon: '🌅', label: 'Sunrise', value: fmtTime(data.sys.sunrise, tz) },
    { icon: '🌇', label: 'Sunset', value: fmtTime(data.sys.sunset, tz) },
  ];
  return (
    <section className="details">
      {tiles.map((t, i) => (
        <div key={t.label} className="glass tile rise" style={{ animationDelay: `${i * 70}ms` }}>
          <span className="tile-icon">{t.icon}</span>
          <span className="tile-label">{t.label}</span>
          <strong>{t.value}</strong>
          {t.sub && <em>{t.sub}</em>}
          {t.bar != null && <div className="bar"><i style={{ width: `${t.bar}%` }} /></div>}
        </div>
      ))}
    </section>
  );
}