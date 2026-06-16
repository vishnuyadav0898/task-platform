import sequelize from '../config/database';
import User from './User';
import Session from './Session';
import Workspace from './Workspace';
import WorkspaceMember from './WorkspaceMember';
import Project from './Project';
import Task from './Task';
import Notification from './Notification';
import Activity from './Activity';

// User <-> Session
User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User <-> Workspace (Owner)
User.hasMany(Workspace, { foreignKey: 'ownerId', as: 'ownedWorkspaces' });
Workspace.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User <-> Workspace (Members)
User.belongsToMany(Workspace, { through: WorkspaceMember, foreignKey: 'userId', onDelete: 'CASCADE' });
Workspace.belongsToMany(User, { through: WorkspaceMember, foreignKey: 'workspaceId', onDelete: 'CASCADE' });

// Workspace <-> Project
Workspace.hasMany(Project, { foreignKey: 'workspaceId', onDelete: 'CASCADE' });
Project.belongsTo(Workspace, { foreignKey: 'workspaceId' });

// User <-> Project (Creator)
User.hasMany(Project, { foreignKey: 'createdById', onDelete: 'SET NULL' });
Project.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Project <-> Task
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

// User <-> Task (Creator / Assignee)
User.hasMany(Task, { foreignKey: 'createdById', as: 'createdTasks', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
User.hasMany(Task, { foreignKey: 'assignedToUserId', as: 'assignedTasks', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'assignedToUserId', as: 'assignee' });

// Task <-> Task (Self-Referencing Parent-Child)
Task.hasMany(Task, { foreignKey: 'parentId', as: 'subtasks', onDelete: 'CASCADE' });
Task.belongsTo(Task, { foreignKey: 'parentId', as: 'parentTask' });

// User <-> Activity
User.hasMany(Activity, { foreignKey: 'userId', onDelete: 'CASCADE' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Project <-> Activity
Project.hasMany(Activity, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Activity.belongsTo(Project, { foreignKey: 'projectId' });

export {
  sequelize,
  User,
  Session,
  Workspace,
  WorkspaceMember,
  Project,
  Task,
  Notification,
  Activity,
};
