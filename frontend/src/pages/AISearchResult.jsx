import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";
import { aiSearchSystem, createSystem } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

const CopyButton = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <button type="button" className="btn btn-ghost copy-btn" onClick={handle}>
      {copied ? "✓ Copied" : label}
    </button>
  );
};

export default function AISearchResult() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() || "";
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!query) return;
    let active = true;
    setLoading(true);
    setError("");
    setResult(null);
    aiSearchSystem(query)
      .then((data) => {
        if (!active) return;
        if (data.existing) {
          navigate(`/system/${data.generated.slug}`, { replace: true });
          return;
        }
        setResult(data);
      })
      .catch((err) =>
        active &&
        setError(
          err.response?.data?.message || err.message || "AI search failed"
        )
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query, navigate]);

  const handleSave = async () => {
    if (!result?.generated) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const created = await createSystem(result.generated);
      navigate(`/system/${created.slug}`);
    } catch (err) {
      setSaveMsg(
        err.response?.data?.message || err.message || "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!query) return <Navigate to="/" replace />;

  const g = result?.generated;
  const hints = result?.hints || {};
  const hintEntries = Object.entries(hints);

  return (
    <div className="detail">
      <Link to="/" className="back-link">
        ← Back to home
      </Link>

      <div className="ai-search-banner">
        <span className="ai-search-icon">✨</span>
        <div>
          <strong>AI-Generated Project Blueprint</strong>
          <p>
            No system in the catalog matched "<em>{query}</em>", so we asked AI
            to design one for you.
          </p>
          {hintEntries.length > 0 && (
            <div className="ai-hints">
              <span className="ai-hints-label">Detected stack:</span>
              {hintEntries.map(([cat, list]) => (
                <span key={cat} className="ai-hint-pill">
                  <span className="ai-hint-cat">{cat}</span>
                  <span className="ai-hint-tech">{list.join(", ")}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <Spinner label={`Generating "${query}" with AI...`} />}
      {error && !loading && <div className="error-box">{error}</div>}

      {g && !loading && (
        <>
          <header className="detail-header">
            <div>
              <h1>{g.name}</h1>
              <p className="lead">{g.description}</p>
              {g.difficulty && (
                <span className={`badge badge-${g.difficulty.toLowerCase()}`}>
                  {g.difficulty}
                </span>
              )}
            </div>
            <div className="header-actions">
              {isAdmin ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "💾 Save to catalog"}
                </button>
              ) : (
                <Link to="/login" className="btn btn-ghost">
                  🔒 Login to save
                </Link>
              )}
            </div>
          </header>

          {saveMsg && <div className="error-box">{saveMsg}</div>}

          {g.techStack?.length > 0 && (
            <section>
              <h2>🧰 Tech Stack</h2>
              <div className="ai-stack">
                {g.techStack.map((s, i) => (
                  <div key={i} className="ai-stack-row">
                    <span className="ai-stack-cat">{s.category}</span>
                    <span className="ai-stack-tech">{s.tech}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {g.architectureDiagram && (
            <section>
              <h2>🏛 Architecture Diagram</h2>
              <div className="pre-wrap">
                <pre className="ascii-diagram">{g.architectureDiagram}</pre>
                <CopyButton text={g.architectureDiagram} />
              </div>
            </section>
          )}

          {g.components?.length > 0 && (
            <section>
              <h2>🧩 Components</h2>
              <div className="components-grid">
                {g.components.map((c, i) => (
                  <div key={i} className="component-card">
                    <h4>{c.title}</h4>
                    <p>{c.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {g.flow?.length > 0 && (
            <section>
              <h2>🔁 Request Flow</h2>
              <ol className="flow-list">
                {g.flow.map((step, i) => (
                  <li key={i}>
                    <span className="step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {g.projectStructure && (
            <section>
              <h2>📁 Project Structure</h2>
              <div className="pre-wrap">
                <pre className="project-tree">{g.projectStructure}</pre>
                <CopyButton text={g.projectStructure} />
              </div>
              <p className="diagram-caption">
                Drop this into your terminal and start scaffolding.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
