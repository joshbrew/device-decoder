Build with `tinybuild`, or `npm i -g tinybuild & tinybuild`

Wrapper for capacitor-community/bluetooth-le library just for quicker config of multiple devices/services with multiple characteristics per service and customizable responses to those characteristics.

Capacitor required to build mobile apps after bundling the library. 


Capacitor instructions:
#### In your project root
`npm i`

Edit the index.js and optionally the index.html in the `dist/` folder. All public asset files need to end up in `dist/`


#### Build step: 
If no tinybuild installed globally: `npm i -g tinybuild` or to keep it in dev dependencies `npm i --save-dev tinybuild`

Build:
- `tinybuild`

#### Android Studio (install it first)
- `npx cap copy` or `npx cap sync` to sync the www/ dist to the platform-specific folders.
- `npx cap open android` to open android studio ready to build and serve the apk.

Build the android project by click the Make Project hammer icon if it doesn't start automatically. Then if you see BUILD SUCCESSFUL, run with your android device connected or the built-in android emulators active.


#### XCode
- `npx cap copy` or `npx cap sync`
- `npx cap open ios` to open xcode ready to build and serve the app
