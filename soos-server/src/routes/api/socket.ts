import express, { Request, Response, NextFunction } from 'express';
import { userManager } from '../../user-manager.js';

var router = express.Router();

router.route('/check')
  .get((req: Request, res: Response) => {
    var socketID = userManager.getSocketForUser(req.session?.userID);
    if (socketID) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

export const socketApiRouter = router;