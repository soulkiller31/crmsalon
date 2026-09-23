import { Router } from 'express';
import * as serviceController from '../controllers/serviceController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { serviceValidation } from '../validators/index.js';

const router = Router();

router.use(authenticate);
router.get('/', serviceController.getServices);
router.post('/', serviceValidation, validate, serviceController.createService);
router.put('/:id', serviceValidation, validate, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router;
