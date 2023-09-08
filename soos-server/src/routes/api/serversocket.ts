import express, { Request, Response, NextFunction } from 'express';
import { userManager } from '../../db/user-manager.js';

const router = express.Router();

router.route('/check')
  .get((req: Request, res: Response) => {
    const socketID = userManager.getSocketForUser(req.session?.userID);
    if (socketID) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

export const socketApiRouter = router;
