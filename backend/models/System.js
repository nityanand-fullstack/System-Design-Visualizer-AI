import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const techStackSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    tech: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const systemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    diagramUrl: { type: String, default: "", trim: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    components: { type: [componentSchema], default: [] },
    flow: { type: [String], default: [] },
    techStack: { type: [techStackSchema], default: [] },
    projectStructure: { type: String, default: "" },
    architectureDiagram: { type: String, default: "" },
  },
  { timestamps: true }
);

const System = mongoose.model("System", systemSchema);

export default System;
