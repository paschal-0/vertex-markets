import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { createMainApiApp } from "./app";
import { loadMainApiEnv } from "./config";
import { getLogger } from "@vertex/observability";

const logger = getLogger();
loadDotenv({ path: resolve(__dirname, "../../../.env") });
loadDotenv();
const env = loadMainApiEnv();
const app = createMainApiApp(env);

app.listen(env.MAIN_API_PORT, () => {
  logger.info({ port: env.MAIN_API_PORT }, "main-api listening");
});
