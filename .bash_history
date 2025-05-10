npm install
npm install express mongoose bcrypt socket.io multer
npm start
npm install express-session
If you’re following someone else’s instructions make sure you trust them.
If in doubt post a question in our forum https://support.glitch.com
For now, the console and the editor don't automatically sync. You can
manually run the `refresh` command and it will force a refresh,
updating the editor with any console-created files.

For more information about this and other technical restrictions,
please see the Help Center: https://help.glitch.com/

Could not find Node null, using Node 10

app@crystal-organic-marlin:~ 14:53 
$ npm start

> webchat@1.0.0 start /app
> node server.js


internal/modules/cjs/loader.js:638
    throw err;
    ^

Error: Cannot find module 'express-session'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)
    at Function.Module._load (internal/modules/cjs/loader.js:562:25)
    at Module.require (internal/modules/cjs/loader.js:692:17)
    at require (internal/modules/cjs/helpers.js:25:18)
    at Object.<anonymous> (/app/server.js:4:17)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! webchat@1.0.0 start: `node server.js`
npm ERR! Exit status 1
npm ERR! 
npm ERR! Failed at the webchat@1.0.0 start script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /tmp/npm-cache/10.24.1/_logs/2025-05-10T14_53_12_195Z-debug.log

app@crystal-organic-marlin:~ 14:53 
$ 

app@crystal-organic-marlin:~ 14:53 
$ npm install express-session

npm WARN rm not removing /app/node_modules/.bin/node-pre-gyp as it wasn't installed by /app/node_modules/@mapbox/.ignored_node-pre-gyp
> bcrypt@5.1.1 install /app/node_modules/bcrypt
> node-pre-gyp install --fallback-to-build
[bcrypt] Success: "/rbd/pnpm-volume/c7673849-449d-4e04-b5c4-82ad907f40d3/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node" is installed via remote
npm WARN webchat@1.0.0 No description
npm WARN webchat@1.0.0 No repository field.
npm WARN webchat@1.0.0 No license field.
+ express-session@1.18.1
added 214 packages from 97 contributors, removed 66 packages, updated 107 packages and audited 321 packages in 36.918s
19 packages are looking for funding
  run `npm fund` for details
found 3 vulnerabilities (2 high, 1 critical)
  run `npm audit fix` to fix them, or `npm audit` for details
app@crystal-organic-marlin:~ 14:54 
$ 
app@crystal-organic-marlin:~ 14:54 
$ npm audit fix
npm start
npm install express-session --save
npm start
npm install express express-session
npm start
npm install mongoose express
npm install express mongoose dotenv
node server.js
