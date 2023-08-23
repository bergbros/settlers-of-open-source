import express, { Request, Response, NextFunction } from 'express';
import { userManager } from '../../user-manager.js';

var router = express.Router();

router.route('/create')
  .get((req: Request, res: Response) => {
    var username = req.query.username;
    var userID = userManager.addUser(username as string);
    if (userID == null) {
      // username is already taken
      res.status(409).send('Username already in use.');
    } else {
      // TS gets mad about session maybe being null :(
      req.session &&
        (req.session.userID = userID) &&
        (req.session.username = req.query.username);

      // TODO send a "socket secret" also that can be used to associate a socket with a user HTTP session instead of just a userID. 
      res.send(userID);
    }
  });

router.route('/check')
  .get((req: Request, res: Response) => {
    if (!req.session?.userID) {
      // For completeness, should probably also check username (TODO?)
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  });

export const userApiRouter = router;