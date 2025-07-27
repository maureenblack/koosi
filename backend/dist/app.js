"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const capsule_routes_1 = require("./routes/capsule.routes");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.window,
    max: config_1.config.rateLimit.max,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
app.use('/api/auth', auth_routes_1.authRoutes);
app.use('/api/users', user_routes_1.userRoutes);
app.use('/api/capsules', capsule_routes_1.capsuleRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Koosi API' });
});
app.use('/api/auth', auth_routes_1.authRoutes);
app.use('/api/users', user_routes_1.userRoutes);
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
app.use((err, req, res, next) => {
    console.error(err);
    if (err instanceof Error) {
        res.status(500).json({ error: err.message });
    }
    else {
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=app.js.map