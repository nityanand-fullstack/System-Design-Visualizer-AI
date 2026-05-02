import { useEffect } from "react";

const safeStr = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(safeStr).join("\n");
  if (typeof v === "object")
    return Object.entries(v)
      .map(([k, val]) => `${k}: ${safeStr(val)}`)
      .join("\n");
  return String(v);
};

const safeArray = (v) => (Array.isArray(v) ? v : []);

export default function ExplainModal({ open, onClose, loading, data, error }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const explanation = data?.explanation || {};
  const overview = safeStr(explanation.overview);
  const architecture = safeStr(explanation.architecture);
  const components = safeArray(explanation.components);
  const flow = safeArray(explanation.flow);
  const techStack = safeArray(explanation.techStack);
  const scalability = safeStr(explanation.scalability);
  const tradeoffs = safeStr(explanation.tradeoffs);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>✨ AI Architecture Breakdown</h2>
            {data?.system?.name && (
              <p className="modal-sub">{data.system.name}</p>
            )}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <div className="spinner" />
              <p>Asking AI to break down this system...</p>
              <span className="loading-hint">This may take 5-15 seconds</span>
            </div>
          )}

          {error && !loading && (
            <div className="error-box">
              <strong>Something went wrong</strong>
              <p>{safeStr(error)}</p>
            </div>
          )}

          {data && !loading && (
            <div className="explain-content">
              {data.source && data.source !== "ai" && (
                <p className="ai-note">
                  Showing a built-in explanation (AI key not configured or unreachable).
                </p>
              )}

              {overview && (
                <section className="ai-section">
                  <div className="ai-section-head">
                    <span className="ai-icon">📘</span>
                    <h3>Overview</h3>
                  </div>
                  <p>{overview}</p>
                </section>
              )}

              {architecture && (
                <section className="ai-section">
                  <div className="ai-section-head">
                    <span className="ai-icon">🏛</span>
                    <h3>Architecture</h3>
                  </div>
                  <p>{architecture}</p>
                </section>
              )}

              {components.length > 0 && (
                <section className="ai-section">
                  <div className="ai-section-head">
                    <span className="ai-icon">🧩</span>
                    <h3>Components</h3>
                  </div>
                  <div className="ai-components">
                    {components.map((c, i) => (
                      <div key={i} className="ai-component">
                        <div className="ai-component-head">
                          <h4>{safeStr(c.name)}</h4>
                          {c.tech && (
                            <span className="ai-tech-badge">{safeStr(c.tech)}</span>
                          )}
                        </div>
                        {c.role && <p>{safeStr(c.role)}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {flow.length > 0 && (
                <section className="ai-section">
                  <div className="ai-section-head">
                    <span className="ai-icon">🔁</span>
                    <h3>Request Flow</h3>
                  </div>
                  <ol className="ai-flow">
                    {flow.map((step, i) => (
                      <li key={i}>
                        <span className="ai-flow-num">{i + 1}</span>
                        <span>{safeStr(step)}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {techStack.length > 0 && (
                <section className="ai-section">
                  <div className="ai-section-head">
                    <span className="ai-icon">⚙</span>
                    <h3>Tech Stack</h3>
                  </div>
                  <div className="ai-stack">
                    {techStack.map((s, i) => (
                      <div key={i} className="ai-stack-row">
                        <span className="ai-stack-cat">{safeStr(s.category)}</span>
                        <span className="ai-stack-tech">{safeStr(s.tech)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {scalability && (
                <section className="ai-section">
                  <div className="ai-section-head">
                    <span className="ai-icon">📈</span>
                    <h3>Scalability</h3>
                  </div>
                  <p>{scalability}</p>
                </section>
              )}

              {tradeoffs && (
                <section className="ai-section">
                  <div className="ai-section-head">
                    <span className="ai-icon">⚖</span>
                    <h3>Trade-offs &amp; Considerations</h3>
                  </div>
                  <p>{tradeoffs}</p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
