import express from 'express';

import { userApiRouter } from './serveruser.js';
import { socketApiRouter } from './serversocket.js';
import { gameApiRouter } from './servergame.js';

const router = express.Router();

// Adding child routes
router.use('/user', userApiRouter);
router.use('/socket', socketApiRouter);
router.use('/game', gameApiRouter);

export const apiRouter = router;
