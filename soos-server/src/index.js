"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-call */
const express_1 = tslib_1.__importDefault(require("express"));
const soos_gamelogic_1 = tslib_1.__importDefault(require("soos-gamelogic"));
const app = (0, express_1.default)();
const port = 3000;
app.get('/', (req, res) => {
    const game = new soos_gamelogic_1.default();
    res.send('Hello World! Result of game: ' + game.playGame());
});
app.listen(port, () => {
    console.log(`Settlers of Open Source server listening on port ${port}`);
});
