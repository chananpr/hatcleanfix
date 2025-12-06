import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { createStore } from "./lib/storage/index.js";

dotenv.config();

const {
  PORT = 4001,
  ADMIN_KEY = "changeme",
  CLIENT_ORIGINS = "http://localhost:5173",
} = process.env;

const store = createStore(process.env);
const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: CLIENT_ORIGINS.split(",").map((o) => o.trim()),
});

fastify.get("/health", async () => ({ status: "ok" }));

fastify.get("/content", async () => {
  const content = await store.readContent();
  return content;
});

fastify.get("/articles/:slug", async (request, reply) => {
  const { slug } = request.params;
  const article = await store.getArticleBySlug(slug);
  if (!article) return reply.code(404).send({ message: "not found" });
  return article;
});

function isAuthorized(request) {
  const header = request.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  return token && token === ADMIN_KEY;
}

fastify.post("/admin/queues", async (request, reply) => {
  if (!isAuthorized(request)) return reply.code(401).send({ message: "unauthorized" });
  const { customer, quantity, deadline, status, notes } = request.body || {};
  if (!customer || !quantity || !status) {
    return reply.code(400).send({ message: "customer, quantity, and status are required" });
  }
  const parsedQuantity = Number(quantity);
  if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return reply.code(400).send({ message: "quantity must be a positive number" });
  }
  const queue = await store.addQueue({ customer, quantity: parsedQuantity, deadline, status, notes });
  return { queue };
});

fastify.post("/admin/articles", async (request, reply) => {
  if (!isAuthorized(request)) return reply.code(401).send({ message: "unauthorized" });
  const { title, summary, body, imageUrl, videoUrl } = request.body || {};
  if (!title || !summary || !body) {
    return reply.code(400).send({ message: "title, summary, and body are required" });
  }
  const article = await store.addArticle({ title, summary, body, imageUrl, videoUrl });
  return { article };
});

fastify.setNotFoundHandler((_, reply) => reply.code(404).send({ message: "not found" }));

fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.code(500).send({ message: "internal error" });
});

fastify.listen({ port: Number(PORT), host: "0.0.0.0" })
  .then((address) => fastify.log.info(`API running at ${address}`))
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
