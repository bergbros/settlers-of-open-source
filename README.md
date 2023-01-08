# Settlers of Open Source (working title)

## Development

How to run the server:

```
cd soos-server
npm start
```

How to run the client:

```
cd soos-client
npm start
```

Then navigate to http://localhost:5173 in your browser.

Note that the client will automatically pick up changes you make as you're editing code, but the server will NOT. So if you want changes to be reflected in the server, you must kill it with ctrl-C and then restart it.

Also, I haven't tested this, but I strongly suspect that changes in `soos-gamelogic` won't be detected by the client. So you'll probably have to restart the client when you edit that too.

# Architecture

`soos-client`: client-specific stuff only. Anything that will happen in the browser but not on the server.

`soos-server`: server-specific stuff only. Anything that will happen on the server but not in the browser.

`soos-gamelogic`: anything that needs to happen on both the client and the server -- this will mainly be the game logic, but it's not limited to that.

# TODO

Everything!