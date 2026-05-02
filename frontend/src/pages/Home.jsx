import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSystems } from "../api.js";
import SystemCard from "../components/SystemCard.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Home() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSystems()
      .then((data) => active && setSystems(data))
      .catch((err) =>
        active &&
        setError(err.response?.data?.message || err.message || "Failed to load")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return systems.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = !difficulty || s.difficulty === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [systems, search, difficulty]);

  const handleAISearch = (e) => {
    e?.preventDefault?.();
    const q = search.trim();
    if (!q) return;
    navigate(`/ai-search?q=${encodeURIComponent(q)}`);
  };

  const showAIPrompt =
    !loading && !error && search.trim() && filtered.length === 0;

  return (
    <div className="home">
      <section className="hero">
        <h1>
          Learn System Design <span className="accent">Visually</span>
        </h1>
        <p>
          Explore real architectures, components, and flows — then click
          <strong> Explain</strong> to get an AI-powered breakdown.
        </p>
      </section>

      <section className="toolbar">
        <form
          onSubmit={handleAISearch}
          style={{ display: "flex", gap: 12, flex: 1, flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="Search systems (e.g. Chat App, Twitter, Netflix...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="select"
          >
            <option value="">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </form>
      </section>

      {loading && <Spinner label="Loading systems..." />}
      {error && <div className="error-box">{error}</div>}

      {showAIPrompt && (
        <div className="ai-empty">
          <div className="ai-empty-icon">✨</div>
          <h3>
            No system in the catalog matches "<em>{search}</em>"
          </h3>
          <p>Let AI design it for you in seconds.</p>
          <button className="btn btn-primary" onClick={handleAISearch}>
            ✨ Generate "{search}" with AI
          </button>
          <p className="ai-empty-hint">
            Press <kbd>Enter</kbd> in the search box to do this faster.
          </p>
        </div>
      )}

      {!loading && !error && !showAIPrompt && filtered.length === 0 && (
        <div className="empty">
          <p>No systems yet. Run <code>npm run seed</code> in the backend.</p>
        </div>
      )}

      <div className="grid">
        {filtered.map((system) => (
          <SystemCard key={system._id} system={system} />
        ))}
      </div>
    </div>
  );
}
