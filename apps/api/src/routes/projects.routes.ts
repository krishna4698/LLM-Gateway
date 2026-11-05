import { Router, type IRouter } from 'express';
import { prisma } from '@repo/db';
import { authenticateUser } from '../middleware/auth-user.ts';

export const projectsRouter: IRouter = Router();

// GET /v1/projects - List all projects belonging to the logged-in user
projectsRouter.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = Number(req.user!.userId);

    // Fetch projects owned by this user
    let projects = await prisma.Project.where({ userId }).all();

    // Auto-provision a "Default Project" if the user has 0 projects
    if (projects.length === 0) {
      const defaultProject = await prisma.Project.create({
        name: 'Default Project',
        userId,
      });
      projects = [defaultProject];
    }

    return res.json({
      data: projects.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

// POST /v1/projects - Create a new project for the logged-in user
projectsRouter.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = Number(req.user!.userId);
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        error: { message: 'Project name is required.' },
      });
    }

    const created = await prisma.Project.create({
      name: name.trim(),
      userId,
    });

    return res.status(201).json({
      id: created.id,
      name: created.name,
      createdAt: created.createdAt,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

