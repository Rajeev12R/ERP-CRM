import express from "express";
import {
    register,
    login,
    logout,
    createUser
} from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/users", authenticate, authorize("ADMIN"), createUser);

export default router;