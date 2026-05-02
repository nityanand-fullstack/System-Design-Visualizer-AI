import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import System from "./models/System.js";

dotenv.config();

const systems = [
  {
    name: "Chat Application",
    slug: "chat-app",
    description:
      "A real-time messaging system that lets users exchange text messages instantly using WebSockets.",
    diagramUrl:
      "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=1200&q=80",
    difficulty: "Intermediate",
    components: [
      {
        title: "Client (React)",
        description: "Web/mobile UI where users send and read messages.",
      },
      {
        title: "WebSocket Server",
        description:
          "Maintains persistent connections and broadcasts messages between users in real time.",
      },
      {
        title: "REST API Server",
        description:
          "Handles authentication, user management, and historical message fetching.",
      },
      {
        title: "Message Queue",
        description:
          "Buffers messages between services so the system stays responsive under load.",
      },
      {
        title: "Database (MongoDB)",
        description: "Stores users, conversations, and message history.",
      },
      {
        title: "Cache (Redis)",
        description: "Tracks online users and recent messages for fast access.",
      },
    ],
    flow: [
      "User logs in via REST API and receives a JWT token.",
      "Client opens a WebSocket connection authenticated with that token.",
      "User types a message and sends it through the WebSocket.",
      "Server validates the message and pushes it to the message queue.",
      "Worker persists the message to MongoDB and updates Redis.",
      "Server delivers the message to the recipient's active socket.",
      "If the recipient is offline, message is stored and delivered on reconnect.",
    ],
  },
  {
    name: "E-commerce Platform",
    slug: "ecommerce",
    description:
      "An online store where users browse products, add them to a cart, and place orders with secure payments.",
    diagramUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    difficulty: "Advanced",
    components: [
      {
        title: "Frontend (React)",
        description: "Product catalog, cart, checkout, and order history pages.",
      },
      {
        title: "API Gateway",
        description: "Single entry point that routes requests to the right microservice.",
      },
      {
        title: "Product Service",
        description: "Manages product catalog, search, and inventory.",
      },
      {
        title: "Cart & Order Service",
        description: "Handles shopping carts, order creation, and order status.",
      },
      {
        title: "Payment Service",
        description: "Integrates with Stripe/Razorpay to process payments securely.",
      },
      {
        title: "Database (MongoDB)",
        description: "Stores products, users, carts, and orders.",
      },
      {
        title: "CDN",
        description: "Serves product images and static assets globally with low latency.",
      },
    ],
    flow: [
      "User browses products fetched via the API Gateway from the Product Service.",
      "User adds items to the cart, stored against their account.",
      "On checkout, the Order Service creates a pending order.",
      "Payment Service charges the user via the payment gateway.",
      "On successful payment, order status is updated to 'paid'.",
      "Inventory is decremented and a confirmation email is queued.",
      "User sees the order confirmation page with the order ID.",
    ],
  },
  {
    name: "URL Shortener",
    slug: "url-shortener",
    description:
      "A service like bit.ly that converts long URLs into short, shareable links and redirects users to the original URL.",
    diagramUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
    difficulty: "Beginner",
    components: [
      {
        title: "Frontend",
        description: "Simple form where users paste a long URL and get a short one.",
      },
      {
        title: "API Server",
        description: "Generates short codes and handles redirect lookups.",
      },
      {
        title: "Hashing/ID Generator",
        description:
          "Creates unique short codes using base62 encoding of an auto-incrementing ID.",
      },
      {
        title: "Database (MongoDB)",
        description: "Stores mapping from short code to long URL plus click stats.",
      },
      {
        title: "Cache (Redis)",
        description: "Caches popular short → long URL mappings for sub-millisecond redirects.",
      },
      {
        title: "Analytics",
        description: "Tracks click count, geography, and referrer for each short link.",
      },
    ],
    flow: [
      "User submits a long URL through the frontend.",
      "API generates a unique short code and stores the mapping in the database.",
      "Short URL is returned to the user.",
      "When someone visits the short URL, the API checks the cache first.",
      "On cache miss, it queries the database and populates the cache.",
      "User is redirected (HTTP 301) to the original long URL.",
      "Click event is recorded asynchronously for analytics.",
    ],
  },
];

const seed = async () => {
  try {
    await connectDB();
    await System.deleteMany({});
    const inserted = await System.insertMany(systems);
    console.log(`Seeded ${inserted.length} systems.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
