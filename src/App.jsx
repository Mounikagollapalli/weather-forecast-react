import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherDetails from './components/WeatherDetails';
import Forecast from './components/Forecast';

const KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const RAINY = ['Rain', 'Drizzle', 'Thunderstorm'];

// Falling snow (always gentle, heavier in real snow), rain, stars, sun glow, clouds
function Sky({ weather, night }) {
  const { drops, flakes, stars } = useMemo(() => {
    const r = (a, b) => a + Math.random() * (b - a);
    const rainy = RAINY.includes(weather);
    const nFlakes = rainy ? 0 : weather === 'Snow' ? 130 : 60;
    const nStars = !rainy && weather === 'Clear' && night ? 50 : 0;
    return {
      drops: Array.from({ length: rainy ? 80 : 0 }, () => {
        const dur = r(0.5, 1.1);
        return { left: r(0, 100), h: r(14, 30), dur, delay: -r(0, dur) };
      }),
      flakes: Array.from({ length: nFlakes }, () => {
        const dur = r(7, 16);
        return { left: r(0, 100), s: r(3, 10), o: r(0.5, 0.95), blur: Math.random() < 0.3 ? 2 : 0,
          dx: r(-90, 90), dur, delay: -r(0, dur) };
      }),
      stars: Array.from({ length: nStars }, () => ({ left: r(0, 100), top: r(0, 70), s: r(1, 3), dur: r(1.5, 4) })),
    };
  }, [weather, night]);

  return (
    <div className="sky" aria-hidden="true">
      {weather === 'Clear' && !night && <div className="sun" />}
      {['Clouds', 'Mist', 'Fog', 'Haze'].includes(weather) && <><div className="cloud c1" /><div className="cloud c2" /></>}
      {weather === 'Thunderstorm' && <div className="flash" />}
      {stars.map((s, i) => (
        <span key={`s${i}`} className="star" style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.s, height: s.s, animationDuration: `${s.dur}s` }} />
      ))}
      {drops.map((d, i) => (
        <span key={`d${i}`} className="drop" style={{ left: `${d.left}%`, height: d.h, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />
      ))}
      {flakes.map((f, i) => (
        <span key={`f${i}`} className="flake"
          style={{ left: `${f.left}%`, width: f.s, height: f.s, opacity: f.o, filter: f.blur ? `blur(${f.blur}px)` : undefined,
            '--dx': `${f.dx}px`, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }} />
      ))}
    </div>
  );
}

export default function App() {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState(() => localStorage.getItem('unit') || 'C');
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent')) || []; } catch { return []; }
  });
  const appRef = useRef(null);

  const load = useCallback(async (query) => {
    setLoading(true);
    setError('');
    try {
      const [w, f] = await Promise.all([
        fetch(`${BASE}/weather?${query}&units=metric&appid=${KEY}`),
        fetch(`${BASE}/forecast?${query}&units=metric&appid=${KEY}`),
      ]);
      if (!w.ok || !f.ok) throw new Error(w.status === 404 ? 'City not found. Try another name.' : 'Could not fetch weather. Check your API key.');
      const [cw, fc] = await Promise.all([w.json(), f.json()]);
      setCurrent(cw);
      setForecast(fc);
      setRecent((r) => {
        const next = [cw.name, ...r.filter((c) => c !== cw.name)].slice(0, 5);
        localStorage.setItem('recent', JSON.stringify(next));
        return next;
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCity = (city) => load(`q=${encodeURIComponent(city)}`);
  const locate = () =>
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(
          (p) => load(`lat=${p.coords.latitude}&lon=${p.coords.longitude}`),
          () => setError('Location permission denied.')
        )
      : setError('Geolocation is not supported.');

  useEffect(() => { searchCity(recent[0] || 'Hyderabad'); /* eslint-disable-next-line */ }, []);
  useEffect(() => { localStorage.setItem('unit', unit); }, [unit]);

  // Mouse parallax: the background image drifts opposite to the cursor
  const onMove = (e) => {
    const el = appRef.current;
    if (!el) return;
    el.style.setProperty('--mx', `${(e.clientX / window.innerWidth - 0.5) * 36}px`);
    el.style.setProperty('--my', `${(e.clientY / window.innerHeight - 0.5) * 24}px`);
  };

  const main = current?.weather?.[0]?.main || 'Clear';
  const night = !!current?.weather?.[0]?.icon?.endsWith('n');

  return (
    <div className="app" ref={appRef} onMouseMove={onMove} data-weather={main} data-night={night ? 'true' : 'false'}>
      <div className="bg"><div className="bg-img" /></div>
      <Sky weather={main} night={night} />
      <main className="shell">
        <header className="top">
          <h1 className="logo">Sky<span>·</span>Cast</h1>
          <SearchBar onSearch={searchCity} onLocate={locate} recent={recent} unit={unit} setUnit={setUnit} />
        </header>

        {error && <div className="glass error" role="alert">⚠️ {error}</div>}

        {loading && !current ? (
          <div className="grid">
            <div className="glass skeleton tall" />
            <div className="glass skeleton tall" />
          </div>
        ) : current && (
          <div className={`content ${loading ? 'dim' : ''}`}>
            <div className="grid">
              <CurrentWeather data={current} unit={unit} />
              <WeatherDetails data={current} unit={unit} />
            </div>
            {forecast && <Forecast data={forecast} unit={unit} />}
          </div>
        )}
      </main>
    </div>
  );
}