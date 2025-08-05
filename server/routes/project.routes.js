import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { body } from "express-validator";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

router.post('/create',
    authMiddleWare.authUser,
    body('name').isString().withMessage('Project name is required'),
    projectController.createProject
);

router.get('/all',
    authMiddleWare.authUser,
    projectController.getAllProjects
);

router.put('/add-user',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({min:1}).withMessage('Users must be an array of strings').bail().custom((users) => {
        return users.every(user => typeof user === 'string');
    }),
    projectController.addUserToProject
);

router.get('/get-project/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectById
)
export default router;