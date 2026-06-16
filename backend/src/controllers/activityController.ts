import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Activity, User, Project, Workspace } from '../models';

export const getActivityLog = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug, projectSlug } = req.params;
    
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const project = await Project.findOne({ where: { workspaceId: workspace.id, slug: projectSlug } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const activities = await Activity.findAll({
      where: { projectId: project.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
