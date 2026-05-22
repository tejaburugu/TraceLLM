import { createApp } from "./app.js";
import { env } from "./config/env.js";
const app = createApp();
const server = app.listen(env.PORT, () => {
    console.info(`API server listening on http://localhost:${env.PORT}`);
});
function shutdown(signal) {
    console.info(`${signal} received. Closing HTTP server.`);
    server.close((error) => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
        process.exit(0);
    });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
//# sourceMappingURL=server.js.map