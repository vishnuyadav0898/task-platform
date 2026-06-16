import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Session } from '../models';

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET || 'supersecret_access', {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'supersecret_refresh', {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const session = await Session.findOne({ where: { refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      return res.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecret_refresh', async (err: any, decoded: any) => {
      if (err) return res.sendStatus(403);

      const newTokens = generateTokens(decoded.userId);
      
      session.refreshToken = newTokens.refreshToken;
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await session.save();

      res.cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken: newTokens.accessToken });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await Session.destroy({ where: { refreshToken } });
    }
    res.clearCookie('refreshToken');
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
