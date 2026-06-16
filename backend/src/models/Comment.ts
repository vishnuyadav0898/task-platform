import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Task from './Task';
import User from './User';

class Comment extends Model {
  public id!: number;
  public taskId!: number;
  public userId!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    indexes: [
      { fields: ['taskId'] },
      { fields: ['userId'] },
    ],
  }
);

export default Comment;
