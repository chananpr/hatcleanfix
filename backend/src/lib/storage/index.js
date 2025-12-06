import path from "path";
import { addArticle as addArticleFile, addQueue as addQueueFile, getArticleBySlug as getArticleBySlugFile, readContent as readContentFile } from "./fileStore.js";
import { mysqlStore } from "./mysqlStore.js";

export function createStore(env) {
  const driver = (env.DB_DRIVER || "FILE").toUpperCase();
  if (driver === "MYSQL") {
    return mysqlStore({
      host: env.DB_HOST,
      port: Number(env.DB_PORT || 3306),
      user: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      ssl: env.DB_SSL === "true" || env.DB_SSL === true,
    });
  }

  const dataFile = env.DATA_FILE
    ? path.isAbsolute(env.DATA_FILE)
      ? env.DATA_FILE
      : path.join(process.cwd(), env.DATA_FILE)
    : undefined;

  return {
    readContent: () => readContentFile(dataFile),
    addQueue: (payload) => addQueueFile(payload, dataFile),
    addArticle: (payload) => addArticleFile(payload, dataFile),
    getArticleBySlug: (slug) => getArticleBySlugFile(slug, dataFile),
  };
}
