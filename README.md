# Settlers of Open Source (working title)

## Development

Before you do anything else, initialize `soos-gamelogic` so that the client & server can be aware of it:

```
cd soos-gamelogic
npm install
npm run build
```

### How to run the server:

```bash
cd soos-server

# Required for first time setup, and each time dependencies are changed.
# Default to running it each time you pull the repo.
npm install

# start the server
npm start
```

Notes:

1. The gamelogic files must be built with `npm run build` from the `soos-gamelogic` directory before starting the server. If you run the server with `npm start` from the `soos-server` directory, this will be taken care of for you.
2. The server will automatically pick up changes that you make to any Typescript files under `soos-server`, however, it will _not_ automatically pick up changes made to gamelogic files under `soos-gamelogic`. If you change any gamelogic files, you have to build them again and restart the server. Both of those things can be accomplished by running `npm start` from the server dir again.

### How to run the client:

```bash
cd soos-client

# Required for first time setup, and each time dependencies are changed.
# Default to running it each time you pull the repo.
npm install

# start the client (opens http://localhost:5173 in browser.)
npm start
```

Changes in `soos-client` and `soos-gamelogic` should be automatically hot-reloaded by the client.

### Gamelogic

- Game logic that will be used across both client and server should be contained in `soos-gamelogic`.
- Due to some funkiness in how Node.JS modules work with TypeScript, file imports in the `gamelogic` project must specify a `.js` extension.
  - For some reason it has to be `.js` even though the file it's actually importing from is `.ts`.

```ts
// File: soos-gamelogic/src/game-map.ts

// WRONG
import GameHex from "./game-hex";
// ^ will cause an error: "Relative import paths need explicit file extensions"

// Right!
import GameHex from "./game-hex.js";
```

For imports within the `soos-client`/`soos-server` projects, it doesn't matter, you can leave off the `.js` extension.

## Naming conventions

Filenames are in `kebab-case`, class names are `UpperCamelCase`, and function/variable names are in `lowerCamelCase`. For example:

```ts
// Filename: hex-coords.ts

class HexCoords {
  someMethod() {}
}

function someFunction() {}
```

Unit test files live alongside the regular files, and just have a `test.ts` extension. For example, the test file for `hex-coords.ts` would be `hex-coords.test.ts` in the same directory.

## Unit Testing

Each sub-project (client, server, and gamelogic) has its own `test` npm script. So just `cd` into the folder of the subproject, and run `npm run test`.

Ideally, each file in the `gamelogic` and `server` portions would be pretty well unit-tested. Client stuff is a bit harder to unit test and probably changes the most anyway, so it's okay if it has low/no coverage.

# Architecture

`soos-client`: client-specific stuff only. Anything that will happen in the browser but not on the server.

`soos-server`: server-specific stuff only. Anything that will happen on the server but not in the browser.

`soos-gamelogic`: anything that needs to happen on both the client and the server -- this will mainly be the game logic, but it's not limited to that.

# TODO

Everything!

... But actually, here's a short list of what to get started on:

- Map generation
- Displaying the map hexes in the client
- Placing/displaying settlements, roads, etc.

Most of the gamelogic/client stuff is good to start on now. Once you can sort of play a game against yourself in the client, we can work on implementing AI and multiplayer.

## High-level goals:

1. Multiplayer Settlers of Catan w/ official rules
2. A bunch of customizations on top of that
3. Expansions (mainly Cities & Knights)
4. Customizations for the expansions
