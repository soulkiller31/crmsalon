import { Router } from 'express';
import * as messageLogController from '../controllers/messageLogController.js';

const router = Router();

router.get('/stats', messageLogController.getMessageLogStats);
router.get('/', messageLogController.getMessageLogs);

export default router;
