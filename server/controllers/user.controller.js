import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userService.createrUser(req.body);
        const token = await user.generateJWT();
        res.status(201).json({user,token});
    } catch (error) {
        console.error("Error creating user:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userService.loginUser(req.body);
        const token = user.generateJWT(); // Removed await since it's not async
        res.status(200).json({ user, token });
    } catch (error) {
        console.error("Error logging in:", error);
        if (error.message === "User not found") {
            return res.status(404).json({ error: error.message });
        } else if (error.message === "Invalid credentials") {
            return res.status(401).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}

export const profileController = async (req, res) => {
   console.log(req.user);
   res.status(200).json({user:req.user})
}
