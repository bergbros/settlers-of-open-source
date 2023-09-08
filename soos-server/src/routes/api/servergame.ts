import express, { Request, Response, NextFunction } from 'express';
import { userManager } from '../../db/user-manager.js';
import { gameManager } from '../../db/game-manager.js';

const router = express.Router();

router.route('/new')
  .get((req: Request, res: Response) => {
    // create game
    const gamecode = gameManager.createGame();
    const ownerID = req.session ? req.session.userID : null;
    if (ownerID === null) {
      res.sendStatus(400); // Shouldn't get here
      return;
    }

    userManager.makeUserOwnerOfGameCode(ownerID, gamecode);
    // return game code
    res.send(gamecode);
  });

router.route('/check')
  .get((req: Request, res: Response) => {
    const gamecode = req.query.gamecode;

    if (gameManager.gameExists(gamecode as string)) {
      // joinability - check room length and return 204 if not joinable
      return res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

router.route('/result/:gamecode')
  .get((req: Request, res: Response) => {
    res.send('Hello World!');
  });

export const gameApiRouter = router;
