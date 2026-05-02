import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSystemBySlug, explainSystem } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";
import ExplainModal from "../components/ExplainModal.jsx";

export default function SystemDetail() {
  const { slug } = useParams();
  const { isAdmin } = useAuth();
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchSystemBySlug(slug)
      .then((data) => active && setSystem(data))
      .catch((err) =>
        active &&
        setError(err.response?.data?.message || err.message || "Failed to load")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  const handleExplain = async () => {
    setModalOpen(true);
    setAiLoading(true);
    setAiData(null);
    setAiError("");
    try {
      const result = await explainSystem(slug);
      setAiData(result);
    } catch (err) {
      setAiError(err.response?.data?.message || err.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <Spinner label="Loading system..." />;
  if (error)
    return (
      <div className="error-box">
        <p>{error}</p>
        <Link to="/" className="btn btn-ghost">
          ← Back home
        </Link>
      </div>
    );
  if (!system) return null;

  return (
    <div className="detail">
      <Link to="/" className="back-link">
        ← All systems
      </Link>

      <header className="detail-header">
        <div>
          <h1>{system.name}</h1>
          <p className="lead">{system.description}</p>
          {system.difficulty && (
            <span className={`badge badge-${system.difficulty.toLowerCase()}`}>
              {system.difficulty}
            </span>
          )}
        </div>
        <div className="header-actions">
          {isAdmin && (
            <Link to={`/admin/edit/${system.slug}`} className="btn btn-ghost">
              ✎ Edit
            </Link>
          )}
          <button className="btn btn-primary" onClick={handleExplain}>
            ✨ Explain with AI
          </button>
        </div>
      </header>

      {system.diagramUrl && (
        <section className="diagram-section">
          <h2>Architecture Diagram</h2>
          <div className="diagram">
            <img src={system.diagramUrl} alt={`${system.name} diagram`} />
          </div>
        </section>
      )}

      {system.techStack?.length > 0 && (
        <section>
          <h2>🧰 Tech Stack</h2>
          <div className="ai-stack">
            {system.techStack.map((s, i) => (
              <div key={i} className="ai-stack-row">
                <span className="ai-stack-cat">{s.category}</span>
                <span className="ai-stack-tech">{s.tech}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {system.architectureDiagram && (
        <section>
          <h2>🏛 Architecture (ASCII)</h2>
          <pre className="ascii-diagram">{system.architectureDiagram}</pre>
        </section>
      )}

      <section>
        <h2>Components</h2>
        <div className="components-grid">
          {system.components.map((c, i) => (
            <div key={i} className="component-card">
              <h4>{c.title}</h4>
              <p>{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Flow</h2>
        <ol className="flow-list">
          {system.flow.map((step, i) => (
            <li key={i}>
              <span className="step-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {system.projectStructure && (
        <section>
          <h2>📁 Project Structure</h2>
          <pre className="project-tree">{system.projectStructure}</pre>
        </section>
      )}

      <ExplainModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={aiLoading}
        data={aiData}
        error={aiError}
      />
    </div>
  );
}
