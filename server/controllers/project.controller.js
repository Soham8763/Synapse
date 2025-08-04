import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';
import userModel from '../models/user.model.js';

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name } = req.body;
        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = loggedInUser._id;
        const newProject = await projectService.createProject({ name, userId });

        return res.status(201).json({
            message: "Project created successfully",
            project: newProject
        });
    } catch (error) {
        console.error("Error creating project:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Project name already exists" });
        }
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}