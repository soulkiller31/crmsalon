import { Router } from 'express';
import * as messageLogController from '../controllers/messageLogController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/stats', messageLogController.getMessageLogStats);
router.get('/', messageLogController.getMessageLogs);

export default router;
