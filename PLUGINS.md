# Plugin Development
  
## Prerequisites

- Plugin names MUST be unique

## Instructions

1. Create new git branch with a name of the form `feat/<retailer-country>`
1. `cd packages`
1. `cp -R <plugin-name>/ <new-plugin-name>/`
1. Open `package.json` in new plugin folder and update name and description values
1. Go back to plugin folder and open `src/index.ts`
1. Rename plugin class name and update merchant meta attributes
1. Rename parser class name and update meta attributes
1. Go to `cli-starter/` and add new plugin to `dependencies` in `package.json`
1. Open `openreceipt.config.js` and add plugin name to `plugins` section
1. Open `tsconfig.json` and add plugin path to `references` section
1. Ensure you have emails in the `cli-starter/examples/` folder. `ls -la examples/`
1. Run `yarn build --watch`
1. In a new terminal session, run `yarn start run examples/<YOUR EML FILE>`
1. copy recieved from emails and add to meta src addresses
1. extract html out of .eml file -------this.engine.log.info(this.engine.state.email.html)
1. `yarn start run examples/.eml file`
1. copy html from console output into `file.html`
1. inspect the html file headers for important info such as order number, order items,quantity, tax and markers.
1. comment out everything except the items property in the parse method of the parser.

-----------------now you have to find markers, extract text from between them, convert to dom (and back to strings!) when appropriate in order to reduce the html to the data that we need----------------

-----------------now examine nodes for unique properties and build the parser around them--------------------------------
