import { Op } from 'sequelize';
import { Task, Project, WorkspaceMember, Notification } from './src/models';

async function test() {
  const now = new Date();
  console.log('Now:', now);
  
  try {
    const overdueTasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.lt]: now,
        },
        overdueNotified: false,
        status: {
          [Op.notIn]: ['DONE']
        }
      },
      include: [Project]
    });
    
    console.log(`Found ${overdueTasks.length} overdue tasks.`);
    for (const task of overdueTasks) {
      console.log(`Task ID: ${task.id}, Title: ${task.title}, Due: ${task.dueDate}, Status: ${task.status}, OverdueNotified: ${task.overdueNotified}`);
      
      const project = (task as any).Project;
      if (project) {
        console.log(`Associated Project ID: ${project.id}, Workspace ID: ${project.workspaceId}`);
        const members = await WorkspaceMember.findAll({ where: { workspaceId: project.workspaceId, status: 'ACCEPTED' } });
        console.log(`Found ${members.length} accepted members for workspace ${project.workspaceId}`);
        for (const member of members) {
          console.log(`Would notify User ID: ${member.userId}`);
        }
      } else {
        console.log(`No associated project found for task ${task.id}`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

test();
