import { useNavigate } from "react-router-dom";
import { createSystem } from "../api.js";
import SystemForm from "../components/SystemForm.jsx";

export default function AddSystem() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const created = await createSystem(payload);
    navigate(`/system/${created.slug}`);
  };

  return (
    <div className="form-page">
      <h1>Add New System</h1>
      <p className="lead">Create a new architecture entry for the catalog.</p>
      <SystemForm submitLabel="Create system" onSubmit={handleCreate} />
    </div>
  );
}
