# System Design Visualizer

Full-stack MERN app to explore system designs (Chat App, E-commerce, URL Shortener, ...) with an AI "Explain" button powered by Gemini.

## Stack

- **Frontend:** React (Vite) + React Router + Axios
- **Backend:** Node.js + Express (ES Modules)
- **Database:** MongoDB (local or Atlas) via Mongoose
- **AI:** Google Gemini (`gemini-1.5-flash`)

## Project structure

```
System Design Visualizer/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   └── systemController.js
│   ├── models/System.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   └── systemRoutes.js
│   ├── seed.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
```

Edit `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/system-design-visualizer
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-1.5-flash
CLIENT_URL=http://localhost:5173
```

> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.
> Get a Gemini key at https://aistudio.google.com/app/apikey. If left as the placeholder, the `/api/explain` endpoint falls back to a built-in explanation.

Seed the database (3 systems: Chat App, E-commerce, URL Shortener):

```bash
npm run seed
```

Run the API:

```bash
npm run dev      # with nodemon
# or
npm start
```

API runs at **http://localhost:5000**.

### 2. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** and proxies `/api/*` to the backend.

## API Reference

| Method | Route                  | Description                     |
| ------ | ---------------------- | ------------------------------- |
| GET    | `/api/health`          | Health check                    |
| GET    | `/api/systems`         | List systems (search, filter)   |
| GET    | `/api/systems/:slug`   | Get one system by slug          |
| POST   | `/api/systems`         | Create system (admin)           |
| PUT    | `/api/systems/:slug`   | Update system                   |
| DELETE | `/api/systems/:slug`   | Delete system                   |
| POST   | `/api/explain`         | AI explanation `{ slug }`       |

### Example: Add System

```bash
curl -X POST http://localhost:5000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notification System",
    "slug": "notification-system",
    "description": "Sends push, email, and SMS to users at scale.",
    "diagramUrl": "https://example.com/diagram.png",
    "difficulty": "Intermediate",
    "components": [
      { "title": "API Gateway", "description": "Entry point for clients" }
    ],
    "flow": ["Client requests notification", "API queues job", "Worker dispatches"]
  }'
```

### Example: Explain

```bash
curl -X POST http://localhost:5000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"slug": "chat-app"}'
```

## Features

- Home page with searchable, filterable cards
- System detail page with diagram, components, and flow
- AI Explain modal (loading + error states)
- Admin "Add System" page at `/admin/new`
- Responsive, modern dark UI
- Graceful fallback if Gemini API key isn't set
