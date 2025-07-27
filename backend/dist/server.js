"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const prisma_1 = require("./lib/prisma");
async function startServer() {
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ Connected to database');
        app_1.app.listen(config_1.config.port, () => {
            console.log(`✨ Server running on http://localhost:${config_1.config.port}`);
            console.log(`🌍 Environment: ${config_1.config.nodeEnv}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map