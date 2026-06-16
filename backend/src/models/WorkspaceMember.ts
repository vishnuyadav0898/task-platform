import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Workspace from './Workspace';

class WorkspaceMember extends Model {
  public id!: number;
  public workspaceId!: number;
  public userId!: number;
  public role!: 'ADMIN' | 'MEMBER';
  public status!: 'PENDING' | 'ACCEPTED';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkspaceMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Workspace,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MEMBER'),
      allowNull: false,
      defaultValue: 'MEMBER',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    modelName: 'WorkspaceMember',
    tableName: 'workspace_members',
    indexes: [
      {
        unique: true,
        fields: ['workspaceId', 'userId'],
      },
    ],
  }
);

export default WorkspaceMember;
