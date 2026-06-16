import bcrypt from 'bcrypt';
import { sequelize, User, Workspace, WorkspaceMember, Project, Task } from './models';
import dotenv from 'dotenv';
dotenv.config();

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset successfully.');

    // 1. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', passwordHash });
    const member = await User.create({ name: 'Team Member', email: 'member@example.com', passwordHash });

    // 2. Create Workspace
    const workspace = await Workspace.create({ name: 'Engineering', slug: 'engineering', ownerId: admin.id });
    
    // 3. Add Memberships
    await WorkspaceMember.create({ workspaceId: workspace.id, userId: admin.id, role: 'ADMIN' });
    await WorkspaceMember.create({ workspaceId: workspace.id, userId: member.id, role: 'MEMBER' });

    // 4. Create Project
    const project = await Project.create({ name: 'Q3 Roadmaps', description: 'Tasks for Q3', workspaceId: workspace.id, createdById: admin.id, status: 'ACTIVE' });

    // 5. Create Nested Tasks
    const rootTask = await Task.create({
      projectId: project.id,
      title: 'Launch New Feature',
      description: 'Main feature launch',
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignedToUserId: admin.id,
      createdById: admin.id,
    });

    const subTask1 = await Task.create({
      projectId: project.id,
      parentId: rootTask.id,
      title: 'Backend API',
      description: 'Implement backend routes',
      dueDate: new Date(Date.now() + 86400000 * 1), // 1 day from now
      priority: 'HIGH',
      status: 'TODO',
      assignedToUserId: member.id,
      createdById: admin.id,
    });

    const subTask2 = await Task.create({
      projectId: project.id,
      parentId: subTask1.id,
      title: 'Database Schema',
      description: 'Design the schema',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      priority: 'MEDIUM',
      status: 'TODO',
      assignedToUserId: member.id,
      createdById: admin.id,
    });

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
