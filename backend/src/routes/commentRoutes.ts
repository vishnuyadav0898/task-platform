import { Router } from 'express';
import { addComment, getComments } from '../controllers/commentController';
import { authenticate } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', addComment);
router.get('/', getComments);

export default router;
