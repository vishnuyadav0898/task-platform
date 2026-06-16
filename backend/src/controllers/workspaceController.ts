import { Request, Response } from 'express';
import { Workspace, WorkspaceMember, Project, User, Activity, Notification } from '../models';
import { AuthRequest } from '../middlewares/auth';

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug } = req.body;
    
    const workspace = await Workspace.create({
      name,
      slug,
      ownerId: req.user!.id,
    });
    
    await WorkspaceMember.create({
      workspaceId: workspace.id,
      userId: req.user!.id,
      role: 'ADMIN',
      status: 'ACCEPTED',
    });
    
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWorkspaces = async (req: AuthRequest, res: Response) => {
  try {
    const workspaces = await Workspace.findAll({
      include: [{
        model: User,
        where: { id: req.user!.id },
        attributes: [], // don't return full user object
        through: { where: { status: 'ACCEPTED' } } // Only show accepted workspaces
      }],
    });
    
    res.json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug } = req.params;
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const projects = await Project.findAll({ where: { workspaceId: workspace.id } });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug } = req.params;
    const { name, description, slug } = req.body;
    
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const project = await Project.create({
      workspaceId: workspace.id,
      name,
      slug,
      description,
      createdById: req.user!.id,
    });
    
    // Log Activity
    await Activity.create({
      userId: req.user!.id,
      projectId: project.id,
      action: 'CREATED_PROJECT',
      entityType: 'PROJECT',
      entityId: project.id,
      metadata: { name: project.name }
    });
    
    // Broadcast Notification to all Workspace Members
    const members = await WorkspaceMember.findAll({ where: { workspaceId: workspace.id } });
    const notifications = members
      .map(m => ({
        userId: m.userId,
        message: `New project "${project.name}" was created in your workspace.`,
      }));
      
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
    
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findByPk(Number(id));
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    if (workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the owner can delete the workspace' });
    }
    
    await workspace.destroy();
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug, projectSlug } = req.params;
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const project = await Project.findOne({ where: { workspaceId: workspace.id, slug: projectSlug } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    await project.destroy();
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug } = req.params;
    const { email, role } = req.body;
    
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const userToInvite = await User.findOne({ where: { email } });
    if (!userToInvite) return res.status(404).json({ error: 'User not found in system' });
    
    const existingMember = await WorkspaceMember.findOne({ where: { workspaceId: workspace.id, userId: userToInvite.id } });
    if (existingMember) return res.status(400).json({ error: 'User is already a member' });
    
    await WorkspaceMember.create({
      workspaceId: workspace.id,
      userId: userToInvite.id,
      role: role || 'MEMBER',
      status: 'PENDING',
    });
    
    await Notification.create({
      userId: userToInvite.id,
      type: 'INVITE',
      message: `You have been invited to join the workspace "${workspace.name}" as a ${role || 'MEMBER'}.`,
      metadata: { workspaceSlug: workspace.slug, workspaceName: workspace.name }
    });
    
    res.status(201).json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptInvite = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug } = req.params;
    
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const member = await WorkspaceMember.findOne({ where: { workspaceId: workspace.id, userId: req.user!.id } });
    if (!member) return res.status(404).json({ error: 'Invite not found' });
    
    member.status = 'ACCEPTED';
    await member.save();
    
    res.json({ message: 'Invite accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
