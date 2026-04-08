import { Router } from 'express';
import { getHomeInfo } from '../controllers/homeController';

const router = Router();

router.get('/home', getHomeInfo);

export default router;
