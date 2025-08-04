import projectModel from '../models/project.model.js';

export const createProject = async ({name, userId}) => {
    if (!name || !name.trim()) {
        throw new Error("Project name is required");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }

    const project = await projectModel.create({
        name: name.trim(),
        users: [userId]
    });

    return await project.populate('users', '-password');
}