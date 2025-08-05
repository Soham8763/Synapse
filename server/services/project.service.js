import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

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

export const getAllProjectsByUserId = async ({userId}) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const allUserprojects = await projectModel.find({ users: userId });
    return allUserprojects;
}

export const addUserToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }

  if (!users) {
    throw new Error("Users array is required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => {
      !mongoose.Types.ObjectId.isValid(userId);
    })
  ) {
    throw new Error("Invalid user(s) id in users array");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  const project = await projectModel.findOne({ _id: projectId, users: userId });
  if (!project) {
    throw new Error("User doesn't have access to this project");
  }

  const updatedProject = await projectModel.findOneAndUpdate({
      _id: projectId,
    },
    {
      $addToSet: {
        users: {
          $each: users,
        },
      },
    },
    {
      new: true,
    }
  );

  return updatedProject;
};

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID");
    }

    const project = await projectModel.findOne({ _id: projectId }).populate('users', 'email');
    if (!project) {
        throw new Error("Project not found or user doesn't have access to this project");
    }

    return project;
}