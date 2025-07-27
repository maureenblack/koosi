"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = require("../lib/prisma");
const env_1 = __importDefault(require("../config/env"));
const AppError_1 = require("../utils/AppError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
exports.authRoutes = (0, express_1.Router)();
const googleClient = new google_auth_library_1.OAuth2Client(env_1.default.GOOGLE_CLIENT_ID);
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(1)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const emailSignupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().optional(),
});
const emailLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const socialLoginSchema = zod_1.z.object({
    token: zod_1.z.string(),
    provider: zod_1.z.enum(['google', 'github', 'twitter']),
});
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign(user, env_1.default.JWT_SECRET, { expiresIn: '7d' });
};
exports.authRoutes.post('/signup', async (req, res) => {
    try {
        console.log('📝 Signup request received:', { email: req.body.email, name: req.body.name });
        const { email, password, name } = signupSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new AppError_1.AppError('Email already registered', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        console.log('🔨 Creating new user in database...');
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        });
        console.log('✅ User created successfully:', { id: user.id, email: user.email });
        console.log('🔑 Generating JWT token...');
        const token = generateToken({ id: user.id, email: user.email });
        console.log('✅ Token generated successfully');
        res.json({ token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Invalid input data', details: error.format() });
        }
        else if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.authRoutes.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user || !user.password) {
            throw new AppError_1.AppError('Invalid email or password', 401);
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            throw new AppError_1.AppError('Invalid email or password', 401);
        }
        const token = generateToken({ id: user.id, email: user.email });
        res.json({ token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Invalid input data', details: error.format() });
        }
        else if (error instanceof AppError_1.AppError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.authRoutes.post('/email/signup', async (req, res) => {
    try {
        const { email, password, name } = emailSignupSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new AppError_1.AppError('Email already in use', 400);
        }
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password,
                name: name || email.split('@')[0],
            },
        });
        const token = generateToken({ id: user.id, email: user.email });
        res.json({ token });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.authRoutes.post('/email/login', async (req, res) => {
    try {
        const { email, password } = emailLoginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user || user.password !== password) {
            throw new AppError_1.AppError('Invalid email or password', 401);
        }
        const token = generateToken({ id: user.id, email: user.email });
        res.json({ token });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.authRoutes.post('/social/login', async (req, res) => {
    try {
        const { token, provider } = socialLoginSchema.parse(req.body);
        let payload = null;
        switch (provider) {
            case 'google':
                const ticket = await googleClient.verifyIdToken({
                    idToken: token,
                    audience: env_1.default.GOOGLE_CLIENT_ID,
                });
                const googlePayload = ticket.getPayload();
                if (googlePayload) {
                    payload = {
                        email: googlePayload.email,
                        name: googlePayload.name,
                        sub: googlePayload.sub,
                    };
                }
                break;
            case 'github':
                throw new AppError_1.AppError('GitHub login not implemented yet', 501);
            case 'twitter':
                throw new AppError_1.AppError('Twitter login not implemented yet', 501);
            default:
                throw new AppError_1.AppError('Invalid provider', 400);
        }
        if (!(payload === null || payload === void 0 ? void 0 : payload.email)) {
            throw new AppError_1.AppError('Invalid token', 400);
        }
        let user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: payload.email },
                    { googleId: payload.sub },
                ],
            },
        });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || payload.email.split('@')[0],
                    googleId: provider === 'google' ? payload.sub : undefined,
                },
            });
        }
        const authToken = generateToken({ id: user.id, email: user.email });
        res.json({ token: authToken });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(error instanceof AppError_1.AppError ? error.statusCode : 400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.authRoutes.get('/me', async (req, res) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                walletAddress: true,
                createdAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
//# sourceMappingURL=auth.routes.js.map