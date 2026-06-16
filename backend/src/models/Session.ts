import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Session extends Model {
  public id!: number;
  public userId!: number;
  public refreshToken!: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init(
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
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
  }
);

export default Session;
