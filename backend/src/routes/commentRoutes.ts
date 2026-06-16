import { Router } from 'express';
import { addComment, getComments } from '../controllers/commentController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.use(authenticateJWT);

router.post('/', addComment);
router.get('/', getComments);

export default router;
