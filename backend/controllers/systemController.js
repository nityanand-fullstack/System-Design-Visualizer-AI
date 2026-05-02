import System from "../models/System.js";

export const getAllSystems = async (req, res, next) => {
  try {
    const { search, difficulty } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const systems = await System.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: systems.length, data: systems });
  } catch (error) {
    next(error);
  }
};

export const getSystemBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const system = await System.findOne({ slug: slug.toLowerCase() });

    if (!system) {
      return res.status(404).json({ success: false, message: "System not found" });
    }

    res.json({ success: true, data: system });
  } catch (error) {
    next(error);
  }
};

export const createSystem = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      diagramUrl,
      components,
      flow,
      difficulty,
      techStack,
      architectureDiagram,
      projectStructure,
    } = req.body;

    if (!name || !slug || !description) {
      return res.status(400).json({
        success: false,
        message: "name, slug, and description are required",
      });
    }

    const exists = await System.findOne({ slug: slug.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }

    const system = await System.create({
      name,
      slug: slug.toLowerCase(),
      description,
      diagramUrl: diagramUrl || "",
      components: components || [],
      flow: flow || [],
      difficulty: difficulty || "Beginner",
      techStack: techStack || [],
      architectureDiagram: architectureDiagram || "",
      projectStructure: projectStructure || "",
    });

    res.status(201).json({ success: true, data: system });
  } catch (error) {
    next(error);
  }
};

export const updateSystem = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updated = await System.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "System not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteSystem = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const deleted = await System.findOneAndDelete({ slug: slug.toLowerCase() });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "System not found" });
    }

    res.json({ success: true, message: "System deleted" });
  } catch (error) {
    next(error);
  }
};
