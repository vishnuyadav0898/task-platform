import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Workspace from './Workspace';
import User from './User';

class Project extends Model {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description!: string;
  public status!: 'ACTIVE' | 'ARCHIVED';
  public workspaceId!: number;
  public createdById!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Workspace,
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
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    indexes: [
      {
        unique: true,
        fields: ['workspaceId', 'slug'],
      },
    ],
  }
);

export default Project;
