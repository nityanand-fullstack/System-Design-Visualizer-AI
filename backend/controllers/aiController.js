import System from "../models/System.js";

const GEMINI_ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const buildPrompt = (system) => {
  const componentsText = system.components
    .map((c, i) => `${i + 1}. ${c.title}: ${c.description}`)
    .join("\n");
  const flowText = system.flow.map((s, i) => `${i + 1}. ${s}`).join("\n");

  return `You are a senior software architect. Produce a thorough, beginner-friendly explanation of the system below.

System Name: ${system.name}
Description: ${system.description}

Components:
${componentsText}

Flow:
${flowText}

Return ONLY a strict JSON object — no prose, no markdown, no code fences. Use exactly these keys with the types specified:

{
  "overview": "string — 3 to 5 sentences explaining what the system does and why it exists",
  "architecture": "string — 1 paragraph describing how the components fit together at a high level",
  "components": [
    {
      "name": "string — component name",
      "role": "string — what this component is responsible for",
      "tech": "string — common technology choice (e.g., 'Redis', 'Kafka', 'PostgreSQL')"
    }
  ],
  "flow": [
    "string — one step of the request/data flow, written as a complete sentence"
  ],
  "techStack": [
    { "category": "string — e.g. Frontend / Backend / Database / Infra / Cache", "tech": "string — comma-separated list of technologies" }
  ],
  "scalability": "string — 1 paragraph on how the system scales (horizontal scaling, sharding, caching, queueing, etc.)",
  "tradeoffs": "string — 1 paragraph covering trade-offs and design considerations (consistency vs availability, latency vs cost, etc.)"
}

Rules:
- Every string must be plain text (no markdown).
- "components" must contain at least 5 entries with detailed roles.
- "flow" must contain at least 6 numbered steps describing the end-to-end request lifecycle.
- "techStack" must contain at least 4 categories.
- Keep the tone clear and educational, suitable for a junior developer learning system design.`;
};

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-2.5-pro",
];

const tryModel = async (model, apiKey, prompt) => {
  const response = await fetch(GEMINI_ENDPOINT(model, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const err = new Error(`Gemini API error (${response.status}): ${errText}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response as JSON");
  }
};

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const configured = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    return null;
  }

  const tried = new Set();
  const models = [configured, ...FALLBACK_MODELS].filter((m) => {
    if (tried.has(m)) return false;
    tried.add(m);
    return true;
  });

  let lastErr;
  for (const model of models) {
    try {
      return await tryModel(model, apiKey, prompt);
    } catch (err) {
      lastErr = err;
      if (err.status !== 404) throw err;
      console.warn(`Gemini model "${model}" not found, trying next...`);
    }
  }
  throw lastErr || new Error("No Gemini model worked");
};

const asString = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.map((v) => asString(v)).join("\n");
  if (typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${asString(v)}`)
      .join("\n");
  return String(value);
};

const asComponentArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return { name: item, role: "", tech: "" };
      if (typeof item === "object" && item) {
        return {
          name: asString(item.name || item.title || ""),
          role: asString(item.role || item.description || item.purpose || ""),
          tech: asString(item.tech || item.technology || item.example || ""),
        };
      }
      return { name: String(item), role: "", tech: "" };
    });
  }
  if (typeof value === "object") {
    return Object.entries(value).map(([name, v]) => ({
      name,
      role: asString(v),
      tech: "",
    }));
  }
  return [];
};

const asStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => asString(v)).filter(Boolean);
  if (typeof value === "string")
    return value.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "object")
    return Object.values(value).map((v) => asString(v)).filter(Boolean);
  return [String(value)];
};

const asAscii = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value.replace(/\r\n/g, "\n").trimEnd();
  if (Array.isArray(value)) return value.map(asAscii).join("\n");
  if (typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => `${k}\n${asAscii(v)}`)
      .join("\n");
  return String(value);
};

const asTechStack = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return { category: "General", tech: item };
      if (typeof item === "object" && item) {
        return {
          category: asString(item.category || item.layer || "General"),
          tech: asString(item.tech || item.technologies || item.items || ""),
        };
      }
      return { category: "General", tech: String(item) };
    });
  }
  if (typeof value === "object") {
    return Object.entries(value).map(([category, tech]) => ({
      category,
      tech: asString(tech),
    }));
  }
  return [];
};

const normalizeExplanation = (raw) => ({
  overview: asString(raw?.overview ?? raw?.simple ?? ""),
  architecture: asString(raw?.architecture ?? ""),
  components: asComponentArray(raw?.components),
  flow: asStringArray(raw?.flow),
  techStack: asTechStack(raw?.techStack ?? raw?.tech_stack ?? raw?.stack),
  scalability: asString(raw?.scalability ?? ""),
  tradeoffs: asString(raw?.tradeoffs ?? raw?.trade_offs ?? raw?.considerations ?? ""),
});

const fallbackExplanation = (system) => ({
  overview: `${system.name} is a system whose primary goal is: ${system.description}. It is composed of ${system.components.length} core component(s) that work together to deliver this functionality reliably.`,
  architecture: `The architecture follows a typical multi-tier pattern. Clients communicate with a backend layer that orchestrates ${system.components.length} component(s); persistence and caching layers sit behind the application logic.`,
  components: system.components.map((c) => ({
    name: c.title,
    role: c.description,
    tech: "",
  })),
  flow: system.flow,
  techStack: [
    { category: "Frontend", tech: "React, Vite" },
    { category: "Backend", tech: "Node.js, Express" },
    { category: "Database", tech: "MongoDB" },
    { category: "Infra", tech: "Docker, Nginx" },
  ],
  scalability:
    "The system can scale horizontally by adding more instances behind a load balancer. Stateless services scale by replication; stateful stores scale via sharding and read replicas. Caches reduce read pressure on the database.",
  tradeoffs:
    "There is the usual trade-off between consistency and availability — strong consistency adds latency, eventual consistency improves throughput. Caching introduces invalidation complexity. Microservices add operational overhead in exchange for independent scaling.",
});

const slugify = (str) =>
  String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const TECH_VOCAB = {
  Frontend: [
    "react",
    "vue",
    "angular",
    "svelte",
    "next.js",
    "nextjs",
    "next",
    "nuxt",
    "html",
    "css",
    "tailwind",
  ],
  Backend: [
    "node.js",
    "node",
    "express",
    "nestjs",
    "nest",
    "django",
    "flask",
    "fastapi",
    "spring boot",
    "spring",
    "rails",
    "laravel",
    "go",
    "golang",
    "rust",
    "php",
  ],
  Database: [
    "mysql",
    "postgresql",
    "postgres",
    "mongodb",
    "mongo",
    "sqlite",
    "redis",
    "cassandra",
    "dynamodb",
    "firebase",
    "supabase",
    "prisma",
    "mongoose",
    "sequelize",
  ],
  Realtime: ["socket.io", "websocket", "websockets", "ws", "sse"],
  Mobile: ["react native", "flutter", "ionic", "swift", "kotlin"],
  Infra: ["docker", "kubernetes", "k8s", "aws", "gcp", "azure", "vercel", "netlify"],
};

const TITLE_CASE = {
  react: "React",
  vue: "Vue",
  angular: "Angular",
  svelte: "Svelte",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  nuxt: "Nuxt",
  html: "HTML",
  css: "CSS",
  tailwind: "Tailwind CSS",
  node: "Node.js",
  "node.js": "Node.js",
  express: "Express",
  nest: "NestJS",
  nestjs: "NestJS",
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  spring: "Spring Boot",
  "spring boot": "Spring Boot",
  rails: "Ruby on Rails",
  laravel: "Laravel",
  go: "Go",
  golang: "Go",
  rust: "Rust",
  php: "PHP",
  mysql: "MySQL",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  mongo: "MongoDB",
  mongodb: "MongoDB",
  sqlite: "SQLite",
  redis: "Redis",
  cassandra: "Cassandra",
  dynamodb: "DynamoDB",
  firebase: "Firebase",
  supabase: "Supabase",
  prisma: "Prisma",
  mongoose: "Mongoose",
  sequelize: "Sequelize",
  "socket.io": "Socket.IO",
  websocket: "WebSocket",
  websockets: "WebSocket",
  ws: "WebSocket",
  sse: "Server-Sent Events",
  "react native": "React Native",
  flutter: "Flutter",
  ionic: "Ionic",
  swift: "Swift",
  kotlin: "Kotlin",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  aws: "AWS",
  gcp: "GCP",
  azure: "Azure",
  vercel: "Vercel",
  netlify: "Netlify",
};

const detectTechHints = (query) => {
  const lower = ` ${String(query).toLowerCase()} `;
  const hints = {};
  for (const [category, words] of Object.entries(TECH_VOCAB)) {
    const found = [];
    for (const word of words) {
      const re = new RegExp(`(^|[^a-z0-9])${word.replace(/[.+]/g, "\\$&")}([^a-z0-9]|$)`, "i");
      if (re.test(lower)) {
        const pretty = TITLE_CASE[word] || word;
        if (!found.includes(pretty)) found.push(pretty);
      }
    }
    if (found.length) hints[category] = found;
  }
  return hints;
};

const formatHints = (hints) => {
  const entries = Object.entries(hints);
  if (!entries.length) return "(none — choose sensible defaults for a typical full-stack web app)";
  return entries.map(([cat, list]) => `  - ${cat}: ${list.join(", ")}`).join("\n");
};

const buildSearchPrompt = (query, hints) => `You are a senior system architect. A user is searching for a system design called "${query}".

Detected tech hints from the query:
${formatHints(hints)}

Generate a complete educational PROJECT BLUEPRINT as STRICT JSON only — no prose, no markdown, no code fences. Use exactly these keys:

{
  "name": "string — proper title-cased name of the system",
  "slug": "string — url-safe lowercase kebab-case slug",
  "description": "string — 1-2 sentence summary of what this system does",
  "difficulty": "Beginner | Intermediate | Advanced",
  "techStack": [
    { "category": "Frontend|Backend|Database|Cache|Realtime|Auth|Infra|Testing", "tech": "comma-separated technologies for that category" }
  ],
  "components": [
    { "title": "string — component name", "description": "string — what it does (1-2 sentences)" }
  ],
  "flow": [
    "string — one step of the request lifecycle as a full sentence"
  ],
  "architectureDiagram": "string — multi-line ASCII architecture diagram using boxes [Foo] and arrows --> | v. Plain ASCII only, no markdown.",
  "projectStructure": "string — multi-line ASCII folder tree using ├── └── │ characters, 2 spaces per level. Include both backend/ and frontend/ trees if full-stack."
}

HARD RULES:
- techStack MUST honor every detected hint above. Do not substitute. If a category is empty in hints, choose sensible defaults and label the value with " (suggested)".
- techStack must contain at least 4 categories.
- 5 to 7 components, 6 to 8 flow steps.
- architectureDiagram is pure ASCII text. Each box on its own line, arrows showing data flow. Example:
    [ Browser (React) ]
            |
            v
    [ Express API (Node) ] ----> [ Redis Cache ]
            |
            v
    [ MySQL Database ]
- projectStructure is an ASCII tree. Example:
    backend/
    ├── package.json
    ├── server.js
    ├── models/
    │   └── User.js
    └── routes/
        └── userRoutes.js
    frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        └── pages/
            └── Home.jsx
- File names in projectStructure MUST be consistent with the chosen techStack (e.g. .py for Django/Flask, .java for Spring, .js/.jsx for Node/React, .sql migrations for MySQL/Postgres).
- Output JSON only. No markdown, no code fences, no extra commentary.`;

export const searchSystem = async (req, res, next) => {
  try {
    const { query } = req.body || {};
    if (!query || !String(query).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return res.status(503).json({
        success: false,
        message: "AI is not configured. Add GEMINI_API_KEY in backend/.env.",
      });
    }

    const trimmed = String(query).trim();

    const existing = await System.findOne({
      $or: [
        { slug: slugify(trimmed) },
        { name: { $regex: `^${trimmed}$`, $options: "i" } },
      ],
    });
    if (existing) {
      return res.json({ success: true, source: "db", existing: true, generated: existing });
    }

    const hints = detectTechHints(trimmed);
    const prompt = buildSearchPrompt(trimmed, hints);
    const raw = await callGemini(prompt);
    if (!raw) throw new Error("Empty AI response");

    const name = asString(raw.name) || trimmed;
    const slug = slugify(raw.slug || name);
    const validDifficulty = ["Beginner", "Intermediate", "Advanced"].includes(
      raw.difficulty
    )
      ? raw.difficulty
      : "Intermediate";

    const components = Array.isArray(raw.components)
      ? raw.components
          .map((c) => ({
            title: asString(c?.title || c?.name),
            description: asString(c?.description || c?.role),
          }))
          .filter((c) => c.title && c.description)
      : [];

    const flow = Array.isArray(raw.flow)
      ? raw.flow.map(asString).filter(Boolean)
      : [];

    const techStack = asTechStack(raw.techStack ?? raw.tech_stack ?? raw.stack);
    const architectureDiagram = asAscii(
      raw.architectureDiagram ?? raw.architecture_diagram ?? raw.diagram
    );
    const projectStructure = asAscii(
      raw.projectStructure ?? raw.project_structure ?? raw.folderStructure
    );

    const generated = {
      name,
      slug,
      description: asString(raw.description),
      difficulty: validDifficulty,
      diagramUrl: "",
      components,
      flow,
      techStack,
      architectureDiagram,
      projectStructure,
    };

    res.json({
      success: true,
      source: "ai",
      existing: false,
      hints,
      generated,
    });
  } catch (err) {
    console.error("AI search failed:", err.message);
    next(err);
  }
};

export const explainSystem = async (req, res, next) => {
  try {
    const { slug, systemId } = req.body;

    if (!slug && !systemId) {
      return res
        .status(400)
        .json({ success: false, message: "Provide either slug or systemId" });
    }

    const system = slug
      ? await System.findOne({ slug: slug.toLowerCase() })
      : await System.findById(systemId);

    if (!system) {
      return res
        .status(404)
        .json({ success: false, message: "System not found" });
    }

    const prompt = buildPrompt(system);
    let explanation;
    let source = "ai";

    try {
      const raw = await callGemini(prompt);
      if (!raw) {
        explanation = fallbackExplanation(system);
        source = "fallback-no-key";
      } else {
        explanation = normalizeExplanation(raw);
        if (!explanation.components.length) {
          explanation.components = fallbackExplanation(system).components;
        }
        if (!explanation.flow.length) {
          explanation.flow = system.flow;
        }
      }
    } catch (err) {
      console.error("Gemini failed, using fallback:", err.message);
      explanation = fallbackExplanation(system);
      source = "fallback-error";
    }

    res.json({
      success: true,
      source,
      system: { name: system.name, slug: system.slug },
      explanation,
    });
  } catch (error) {
    next(error);
  }
};
