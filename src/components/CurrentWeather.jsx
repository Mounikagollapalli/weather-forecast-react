import { toTemp, fmtDay, fmtTime, icon } from '../utils';

export default function CurrentWeather({ data, unit }) {
  const w = data.weather[0];
  const tz = data.timezone;
  return (
    <section className="glass hero rise">
      <div className="hero-top">
        <div>
          <h2 className="city">{data.name}<small>{data.sys.country}</small></h2>
          <p className="date">
            {fmtDay(data.dt, tz, { weekday: 'long', month: 'long', day: 'numeric' })} · {fmtTime(data.dt, tz)}
          </p>
        </div>
        <img className="wx-icon" src={icon(w.icon)} alt={w.description} />
      </div>

      <div className="temp">{toTemp(data.main.temp, unit)}<sup>°{unit}</sup></div>
      <p className="desc">{w.description}</p>

      <div className="hero-meta">
        <span>Feels like <b>{toTemp(data.main.feels_like, unit)}°</b></span>
        <span>High <b>{toTemp(data.main.temp_max, unit)}°</b></span>
        <span>Low <b>{toTemp(data.main.temp_min, unit)}°</b></span>
      </div>
    </section>
  );
}