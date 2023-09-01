import express from 'express';

import { userApiRouter } from './user.js';
import { socketApiRouter } from './socket.js';
import { gameApiRouter } from './game.js';

const router = express.Router();

// Adding child routes
router.use('/user', userApiRouter);
router.use('/socket', socketApiRouter);
router.use('/game', gameApiRouter);

export const apiRouter = router;
