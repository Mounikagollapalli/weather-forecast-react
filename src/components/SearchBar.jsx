import { useState } from 'react';

export default function SearchBar({ onSearch, onLocate, recent, unit, setUnit }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (value.trim()) { onSearch(value.trim()); setValue(''); }
  };

  return (
    <div className="search-wrap">
      <form className="glass search" onSubmit={submit}>
        <span className="mag">🔍</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search any city…"
          aria-label="Search city"
        />
        <button type="button" className="icon-btn" onClick={onLocate} title="Use my location" aria-label="Use my location">📍</button>
        <button type="submit" className="go">Search</button>
      </form>

      <div className="toggle glass" role="group" aria-label="Units">
        {['C', 'F'].map((u) => (
          <button key={u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>°{u}</button>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="chips">
          {recent.map((c) => (
            <button key={c} className="chip" onClick={() => onSearch(c)}>{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}