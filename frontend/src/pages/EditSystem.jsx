import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchSystemBySlug, updateSystem, deleteSystem } from "../api.js";
import SystemForm from "../components/SystemForm.jsx";
import Spinner from "../components/Spinner.jsx";

export default function EditSystem() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
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

  const handleUpdate = async (payload) => {
    const updated = await updateSystem(slug, payload);
    navigate(`/system/${updated.slug}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${system.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteSystem(slug);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Delete failed");
      setDeleting(false);
    }
  };

  if (loading) return <Spinner label="Loading system..." />;
  if (error)
    return (
      <div>
        <div className="error-box">{error}</div>
        <Link to="/" className="btn btn-ghost">
          ← Back home
        </Link>
      </div>
    );
  if (!system) return null;

  return (
    <div className="form-page">
      <Link to={`/system/${slug}`} className="back-link">
        ← Back to system
      </Link>
      <div className="edit-header">
        <h1>Edit System</h1>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      <SystemForm
        initial={system}
        submitLabel="Save changes"
        onSubmit={handleUpdate}
        lockSlug
      />
    </div>
  );
}
