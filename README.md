# ARCHIE

> Archie the Architect is a file generator and task runner / build tool. Archie does two things really well: 1) scaffolds file sets (similar to yeoman), and 2) automates the execution of tasks or commands (similar to Grunt, Gulp, and NPM scripts). While Archie was built to be used as a front end website generator and build tool, Archie is at your command to build anything your heart desires!

## Why Archie?

Yes, there already are many great build tools out there, such as Gulp, Grunt, NPM scripts, and others. Archie was created primarily for two reasons:

1. _To marry the build tool / task runner to the scaffolding tool_. Gulp, Grunt, and NPM scripts are great. So is Yeoman, which is so popular because it makes it so easy to scaffold any type of project, or to insert smaller, reusable pieces into an existing project. Archie provides the best of both worlds by combining the powerful functionality of task runners with the functionality of a scaffolding tool like yeoman.
2. _To have a task runner as simple as NPM, but as powerful as Gulp and Grunt_. Gulp and Grunt are powerful and robust, but require a fair amount of writing code and/or configuration. Archie utilizes the simplicity of NPM scripts while making it easy to access the less known, more powerful features of NPM scripts.

## Features / Concepts:

Archie has two main concepts:

1. _Archie the Installer_: An archie _building block_, or _"block"_, consists of one or more templated files that can be installed to any project. Think code snippets, but for files. With Archie, you can create and install custom, dynamic building blocks to any project or location. Example blocks you might create are:
    - A single `package.json` to be customized and reused in different projects.
    - A SASS, pug, and js file to insert a component into a project.
    - An Angular module boilerplate to insert into any Angular project.
    - An collection of files to customize and kick off an entire project.
2. _Archie the Runner_ (coming soon): Archie the task runner automates the executation of a single or group of commands and/or scripts.

## How to install a building block?

Run `archie install [src] [dest]`, where:

- `src` is the source directory for the block you want to install.
- `dest` is the destination directory you wish to install to.

_Note: You may also `archie i` as an alias to `archie install`._

## How to create a custom block?

If you know JavaScript, it is easy to learn how to create a building block. Archie uses [lodash templates](https://lodash.com/docs#template) to create dynamic file templates to later install anywhere. To create a custom block, do the following:

1. Create a directory, named after your block, and structure the directory according to how it should installed to a project.
2. Use [lodash template syntax](https://lodash.com/docs#template) to insert dynamic areas in a file template. Lodash templates understand vanilla JavaScript, so it is very powerful. _Note: see [lodash documentation](https://lodash.com/docs#template) for help creating lodash templates._
3. To have Archie gather the necessary data to customize the installation of a buildling block, create a file called `archie.block.js` in your block's root directory. Use node's `module.export` to return a `block` object, which should be structured as follows:
    - _block.questions_ = an array of questions to have Archie ask when installing a block. The answers to these questions will be used to populate dynamic data in the block. Archie uses the NPM package, [inquirer](https://www.npmjs.com/package/inquirer), to ask questions, so [see inquirer documentation](https://www.npmjs.com/package/inquirer#documentation) for question syntax.
    - _block.hooks_ = provides a mechanism to hook into Archie's compile process. Currently you can attach the following methods to _block.hooks_:
        - _block.hooks.parseAnswers(answers)_: runs immediately after all questions are answered, and gives you a way to run any last modifications on the answers object.
        - _block.hooks.postInstall(shelljs)_: runs immediately after Archie finishes installing a block, and passes [shelljs](https://www.npmjs.com/package/shelljs) for you to run shell commands. This allows you to do things post install, for example, you can have Archie run `npm install` automatically.
4. _archie.config.js_: If an `archie.config.js` file exists in the root folder you are installing a block to, Archie will do two things:
    1. Archie will bypass any questions if the answer already exists in `archie.config.js`. For example, if you have a question with a name property of `project.name`, and `archie.config.js` already has a property called `property.name`, that question will not be asked. _Note: This is assuming you do not have your own `when` property attached to the question. See [inquirer question documentation](https://www.npmjs.com/package/inquirer#questions) for more on question syntax._
    2. Archie will also pass the data in `archie.config.js` to your `block` object. This means you can use the `config` property inside of `archie.block.js` to view any configuration that exists in the block's install location.

_Note: See the sample block to see an example of all this._

## npm build tool tips:

Running multiple scripts:

- Run npm scripts in series or parallel:
    - series: `npm run task && another`
    - parallel: `npm run task & another`
    - with watch: `npm run task & another & wait`
- Run multiple scripts with `npm-run-all`
    - Accepts globs in script names to run multiple scripts: `npm-run-all build:*` or `npm-run-all build:**`
- Pipe data from one script to another:
    - Use pipe ('|') character to pass output to another command
    - Use greater than (`>`) character to output to a file
    - `node-sass src/index.scss | postcss -c .postcssrc.json | cssmin > public/index.min.css`

Hooks:

- Use `pre` and `post` for pre/post script hooks
- Use `husky` package to add git hooks (`precommit`, `prepush`, etc).

Arguments & variables:

- Passing arguments:
    - Use `--` to pass arguments to a task. Example:
    ```shell
    "scripts": {
        "...": "",
        "test" "mocha spec/ --require babel-register",
        "watch:test" "npm test -- --watch",
        "...": ""
    }
    ```
- Working with variables:
    - List env variables: `npm run env | grep [variable name] | less`
    - List project variables: `npm config list | grep [project name]`
    - Set variable: `npm config set [project name] [variable]` or `"config": {"name": "value"}` in `package.json`
    - Delete variable: `npm config delete [project name] [variable]`
    - Use `package.json` variables: `$npm_package_[variable name]`

Watching files:

- Use `onchange` package to run scripts when a file/glob changes. Example list of watch scripts:
    ```shell
    {
        "watch": "npm-run-all --parallel watch:*",
        "watch:test": "npm test -- --watch",
        "watch:lint": "onchange '**/*.js' '**/*.scss' -- npm run lint"
    }
    ```

Logging & documentation:

- Change the level of console output:
    - `--logLevel silent`, `--silent`, `-s`: less output
    - `-q`: quiet
    - `-d`: info
    - `-dd`: verbose
    - `-ddd`: super verbose / debug
- Add comments to `package.json`:
    - Use `"//"` for keys (removes cli output for the script command)

Cross-environment scripts:

- Packages to make scripts cross-environment friendly:
    - Use (escaped) double quotes instead of single quotes.
    - `cross-env` to set environment variables
    - `rimraf` instead of `rm`
    - `opn-cli` instead of `open`
    - `cross-var` for variables

Helpful commands and packages:

- List available scripts: `npm run` or `npm run | less`
- Add tab completion for all scripts from cli: `npm completion >> ~/.zshrc` or `npm completion >> ~/.bashrc`
- Use `ntl` package to run a script from a list
- Options for simpler management of scripts:
    - Use `p-s` package to move scripts from `package.json` to a `package-scripts.js` file so you can better manage and document scripts (doesn't support `npm-run-all` but does allow you to run multiple scripts)
    - Move complex scripts to a bash script:
        - Place commands for script in file with `.sh` extension
        - Run `chmod 777 [filepath]` on file
        - Replace script in `package.json` (e.g., `"build": "./scripts/build.sh"`).
    - Use `shelljs` package to move scripts to a node script and execute shell commands. (Use `bable-node` to use ES16 in node scripts).
