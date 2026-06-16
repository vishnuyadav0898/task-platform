import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Notification extends Model {
  public id!: number;
  public userId!: number;
  public message!: string;
  public isRead!: boolean;
  public type!: 'INFO' | 'INVITE';
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM('INFO', 'INVITE'),
      allowNull: false,
      defaultValue: 'INFO',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
  }
);

export default Notification;
