import { Link } from "react-router-dom";

export default function SystemCard({ system }) {
  return (
    <Link to={`/system/${system.slug}`} className="card system-card">
      <div className="card-image">
        <img src={system.diagramUrl} alt={system.name} loading="lazy" />
        {system.difficulty && (
          <span className={`badge badge-${system.difficulty.toLowerCase()}`}>
            {system.difficulty}
          </span>
        )}
      </div>
      <div className="card-body">
        <h3>{system.name}</h3>
        <p>{system.description}</p>
        <span className="card-cta">View design →</span>
      </div>
    </Link>
  );
}
