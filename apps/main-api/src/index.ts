import { createMainApiApp } from "./app";
import { loadMainApiEnv } from "./config";
import { getLogger } from "@vertex/observability";

const logger = getLogger();
const env = loadMainApiEnv();
const app = createMainApiApp(env);

app.listen(env.MAIN_API_PORT, () => {
  logger.info({ port: env.MAIN_API_PORT }, "main-api listening");
});

