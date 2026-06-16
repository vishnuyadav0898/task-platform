import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Activity extends Model {
  public id!: number;
  public userId!: number;
  public projectId!: number;
  public action!: string;
  public entityType!: string;
  public entityId!: number;
  public metadata!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Activity.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'TASK', 'PROJECT'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Activity',
});

export default Activity;
