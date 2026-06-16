import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Workspace extends Model {
  public id!: number;
  public name!: string;
  public slug!: string;
  public ownerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Workspace.init(
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
      unique: true,
    },
    ownerId: {
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
    modelName: 'Workspace',
    tableName: 'workspaces',
  }
);

export default Workspace;
