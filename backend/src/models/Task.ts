import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Project from './Project';
import User from './User';

class Task extends Model {
  public id!: number;
  public projectId!: number;
  public parentId!: number | null;
  public title!: string;
  public description!: string;
  public dueDate!: Date | null;
  public priority!: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public status!: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  public assignedToUserId!: number | null;
  public createdById!: number;
  public reminderSent!: boolean;
  public overdueNotified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: 'id',
      },
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tasks', // Self-referencing
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
      defaultValue: 'MEDIUM',
    },
    status: {
      type: DataTypes.ENUM('BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'),
      allowNull: false,
      defaultValue: 'TODO',
    },
    assignedToUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    overdueNotified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    indexes: [
      { fields: ['projectId'] },
      { fields: ['parentId'] },
      { fields: ['dueDate'] }, // Important for scheduler cron job
      { fields: ['assignedToUserId'] },
      { fields: ['status'] },
    ],
  }
);

export default Task;
