import { useState } from "react";

const empty = {
  name: "",
  slug: "",
  description: "",
  diagramUrl: "",
  difficulty: "Beginner",
  components: [{ title: "", description: "" }],
  flow: [""],
};

export default function SystemForm({
  initial = empty,
  submitLabel = "Save",
  onSubmit,
  lockSlug = false,
}) {
  const [form, setForm] = useState({
    ...empty,
    ...initial,
    components:
      initial.components && initial.components.length
        ? initial.components
        : [{ title: "", description: "" }],
    flow: initial.flow && initial.flow.length ? initial.flow : [""],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setComponent = (i, key, value) => {
    const next = [...form.components];
    next[i] = { ...next[i], [key]: value };
    set("components", next);
  };

  const setFlow = (i, value) => {
    const next = [...form.flow];
    next[i] = value;
    set("flow", next);
  };

  const addComponent = () =>
    set("components", [...form.components, { title: "", description: "" }]);
  const removeComponent = (i) =>
    set(
      "components",
      form.components.filter((_, idx) => idx !== i)
    );
  const addFlow = () => set("flow", [...form.flow, ""]);
  const removeFlow = (i) =>
    set(
      "flow",
      form.flow.filter((_, idx) => idx !== i)
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        components: form.components.filter((c) => c.title && c.description),
        flow: form.flow.filter(Boolean),
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <label>
            Slug
            <input
              required
              disabled={lockSlug}
              placeholder="e.g. notification-system"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>

        <div className="form-row">
          <label>
            Diagram URL <span className="optional-tag">(optional)</span>
            <input
              type="url"
              placeholder="https://..."
              value={form.diagramUrl}
              onChange={(e) => set("diagramUrl", e.target.value)}
            />
          </label>
          <label>
            Difficulty
            <select
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
        </div>

        <fieldset>
          <legend>Components</legend>
          {form.components.map((c, i) => (
            <div key={i} className="form-row">
              <input
                placeholder="Title"
                value={c.title}
                onChange={(e) => setComponent(i, "title", e.target.value)}
              />
              <input
                placeholder="Description"
                value={c.description}
                onChange={(e) =>
                  setComponent(i, "description", e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => removeComponent(i)}
                disabled={form.components.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={addComponent}
          >
            + Add component
          </button>
        </fieldset>

        <fieldset>
          <legend>Flow Steps</legend>
          {form.flow.map((s, i) => (
            <div key={i} className="form-row">
              <input
                placeholder={`Step ${i + 1}`}
                value={s}
                onChange={(e) => setFlow(i, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => removeFlow(i)}
                disabled={form.flow.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addFlow}>
            + Add step
          </button>
        </fieldset>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </form>
    </>
  );
}
