import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, WorkspaceMember, Workspace } from '../models';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'supersecret_access', async (err: any, decoded: any) => {
      if (err) {
        return res.sendStatus(403);
      }

      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.sendStatus(404);
      }
      
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export const authorizeRoles = (...roles: ('ADMIN' | 'MEMBER')[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    
    // Check if the route has workspaceSlug param
    const workspaceSlug = req.params.workspaceSlug || req.body.workspaceSlug || req.query.workspaceSlug;
    
    if (!workspaceSlug) {
      return next(); 
    }

    // Look up the actual Workspace ID by its slug
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const member = await WorkspaceMember.findOne({
      where: {
        workspaceId: workspace.id,
        userId: req.user.id,
        status: 'ACCEPTED',
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not an active member of this workspace' });
    }

    if (roles.length > 0 && !roles.includes(member.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
