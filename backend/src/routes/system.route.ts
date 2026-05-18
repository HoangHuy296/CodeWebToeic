import { Router } from 'express';
import { getHealth, getRoot } from '../controllers/system.controller.js';

const systemRouter = Router();

systemRouter.get('/', getRoot);
systemRouter.get('/api/health', getHealth);

export { systemRouter };

