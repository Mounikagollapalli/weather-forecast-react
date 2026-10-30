import { toTemp, fmtDay, fmtTime, icon, cityDate } from '../utils';

export default function Forecast({ data, unit }) {
  const tz = data.city.timezone;

  // Hourly strip: next 8 slots (3-hour steps)
  const hourly = data.list.slice(0, 8);

  // Group by the city's local date
  const groups = {};
  data.list.forEach((item) => {
    const key = cityDate(item.dt, tz).toISOString().slice(0, 10);
    (groups[key] ||= []).push(item);
  });
  const days = Object.values(groups).slice(0, 5).map((items) => {
    const mid = items.reduce((a, b) =>
      Math.abs(cityDate(b.dt, tz).getUTCHours() - 12) < Math.abs(cityDate(a.dt, tz).getUTCHours() - 12) ? b : a);
    return {
      dt: mid.dt,
      icon: mid.weather[0].icon,
      desc: mid.weather[0].main,
      min: Math.min(...items.map((i) => i.main.temp_min)),
      max: Math.max(...items.map((i) => i.main.temp_max)),
      pop: Math.max(...items.map((i) => i.pop || 0)),
    };
  });

  const lo = Math.min(...days.map((d) => d.min));
  const hi = Math.max(...days.map((d) => d.max));

  return (
    <section className="forecast">
      <div className="glass panel rise">
        <h3>Next 24 hours</h3>
        <div className="hourly">
          {hourly.map((h) => (
            <div key={h.dt} className="hour">
              <span>{fmtTime(h.dt, tz)}</span>
              <img src={icon(h.weather[0].icon, '2x')} alt={h.weather[0].main} />
              <b>{toTemp(h.main.temp, unit)}°</b>
            </div>
          ))}
        </div>
      </div>

      <div className="glass panel rise">
        <h3>5-day forecast</h3>
        {days.map((d, i) => (
          <div key={d.dt} className="day">
            <span className="dname">{i === 0 ? 'Today' : fmtDay(d.dt, tz)}</span>
            <img src={icon(d.icon, '2x')} alt={d.desc} />
            <span className="rain">{d.pop > 0.05 ? `💧 ${Math.round(d.pop * 100)}%` : ''}</span>
            <span className="lo">{toTemp(d.min, unit)}°</span>
            <div className="range">
              <i style={{ left: `${((d.min - lo) / (hi - lo || 1)) * 100}%`, right: `${100 - ((d.max - lo) / (hi - lo || 1)) * 100}%` }} />
            </div>
            <span className="hi">{toTemp(d.max, unit)}°</span>
          </div>
        ))}
      </div>
    </section>
  );
}