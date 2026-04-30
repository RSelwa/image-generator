<div align="center">
    <img src="https://app.flim.ai/icons/logo-marginless.svg" alt="Logo" width="80">

<h3 align="center">Flim cloud functions monorepo</h3>
  <p align="center">
    The dream is to have a monorepo for all our cloud functions, with shared
    code, and a simple way to add new functions.
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#create-a-new-function">Create a new function</a></li>
        <li><a href="#auto-deploy">Auto deploy</a></li>
        <li><a href="#rules">Firebase Rules</a></li>
        <li><a href="#api">API</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#structure">Structure</a></li>
    <li>
      <a href="#firebase">Firebase</a>
      <ul>
        <li><a href="#deploy">Deploy</a></li>
        <li><a href="#emulator">Emulator</a></li>
      </ul>
    </li>
       <li><a href="#troubleshooting">Troubleshooting</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Since we want to bundle the gcf as small as possible but still be able to share
libs between functions, we needed a new system and a monorepo seemed like a good
fit.

> This monorepo has made by [Thijs Koerselman](https://github.com/0x80) and is
> based on his [Mono TS](https://github.com/0x80/mono-ts)

### Built With

- [Turborepo](https://turbo.build/) to orchestrate the build process and
  dependencies, including the v2 watch task.
- Multiple isolated Firebase deployments, using
  [firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
- Firebase emulators with hot reloading
- Shared Biomejs configuration for linting and formatting
- [Vitest](https://vitest.dev/) for testing
- [Husky](https://typicode.github.io/husky/#/) for pre-commit and pre-push hooks
- [PNPM](https://pnpm.io/) as a package manager

## Getting Started

This is an example of how you can set up this monorepo for your own Google Cloud
Functions.

### Prerequisites

To run this project, you will need to have the following installed and
configured:

- pnpm
  ```sh
  npm install -g pnpm@latest
  ```
- Firebase CLI and logged

  ```sh
  pnpm install -g firebase-tools
  npx firebase login
  ```

- Install dependencies recursively

  ```sh
  pnpm install -r
  ```

### Create a new function

**You need to run all your commands at the roo of the monorepo**

1. Run the cli and follow the prompts to create a new function:
   ```sh
   pnpm create:function
   ```
2. If you need specific env variables, you can add them to the `.env` file in
   the folder of your cloud function.
   ```sh
   echo "MY_ENV_VAR=value" >> ./functions/[function]/.env
   ```
3. If you need to add a new package, you can run:
   ```sh
   pnpm add [package-name] --filter @repo/[function]
   ```

### Auto deploy

The Cloud function will be automatically deployed on `tiktok-generator-fa261` when you
push on develop and on `flim-prod` when you push on main. When you create a new
function with the CLI, it will automatically create a GH Action file to deploy
the function.

You can update which files trigger the deployment by editing the
`.github/workflows/[function].yml` file. in the `on: push: paths:` section.

### Rules

You can write, update and test your rules in the `rules` folder. You can run the
rules tests with the following command:

```sh
pnpm --filter @repo/rules test
```

If you want to run the tests and the emulator at the same time, you can use the
following command

```sh
firebase emulators:exec --only firestore "pnpm --filter @repo/rules test"
```

### API

#### Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env` and fill in the required values:

```sh
cp apps/api/.env.example apps/api/.env
# Edit .env as needed
```

At minimum, you need to set:

```sh
OPENSEARCH_URL=https://name:password@instance-opensearch.com
# (other variables as needed for your environment)
```

#### Install Dependencies

From the root of the monorepo:

```sh
pnpm install
```

#### Start the Development Server

From the root of the monorepo, run:

```sh
pnpm --filter @repo/api dev
```

The API will be available at [http://localhost:8080](http://localhost:8080).

#### Run Tests

To run all tests for the API:

```sh
pnpm --filter @repo/api test
```

## Usage

**You need to run all your commands at the roo of the monorepo** When you want
to use this monorepo, you can follow these steps:

1. Build your files dynamically (watch mode):

   ```sh
   pnpm watch
   ```

   Statically:

   ```sh
   pnpm build # build functions statically
   ```

2. Run your emulators (run full emulator suite):
   ```sh
    pnpm emulate
   ```
3. If you want to run a specific function, you can use the
   `firebase emulators:start` command with the `--only` flag:

   ```sh
   firebase emulators:start --only functions:[function-name]
   ```

## Structure

The monorepo is structured in a way that allows you to share code between

### Packages

- [common](./libs/common) Code that is shared across all monorepo, _would be a
  good idea to rename to utils_.
- [providers](./libs/providers) Code for the providers, like the database, auth,
  stripe, etc...
- [core](./libs/schemas) Code for the schemas used across all codebase.

### Functions

This folder contains all the cloud functions

### Rules

This folder contains all the firestore rules and their tests.

### Apps
This folder contains all the apps used in Flim
- [api](./apps/api) The Flim API

## Firebase

In their
[documentation for monorepos](https://firebase.google.com/docs/functions/organize-functions?gen=2nd#managing_multiple_source_packages_monorepo),
Firebase recommends putting all configurations in the root of the monorepo. This
makes it possible to deploy all packages at once, and easily start the emulators
shared between all packages.

### Deploy

Firebase does not natively support monorepos where packages used shared code
from other packages. The Firebase deploy pipeline wants to upload a
self-contained package that can be treated similarly to an NPM package, so that
it can run an install and execute the main entry from the manifest.

To support shared packages, this repo uses
[firestore-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate),
which is a firebase-tools fork I created to integrate
[isolate-package](https://github.com/0x80/isolate-package/). I wrote an
[article](https://thijs-koerselman.medium.com/deploy-to-firebase-without-the-hacks-e685de39025e)
explaining what it does and why it is needed.

This demo can be run using only the emulators, but if you would like to see the
deployment to Firebase working you can simply execute
`npx firebase deploy --project your-project-name` the root of the monorepo.

You might notice `@google-cloud/functions-framework` as a dependency in the
service package even though it is not being used in code imports. It is
currently required for Firebase to be able to deploy a PNPM workspace. Without
it you will get an error asking you to install the dependency. I don't quite
understand how the two are related, but it works.

### Emulator

With the firebase config in the root of the monorepo, you can configure and
start the emulators for all packages at once with `pnpm emulate`.

I have stored these in `.env` files in the respective service packages. Normally
you would want to store them in a file that is not part of the repository like
`.env.local` but by placing them in `.env` I prevent having to give instructions
for setting them up just for running the demo.

#### Secrets

You can follow the system of secrets of
[firebase doc](https://firebase.google.com/docs/functions/config-env?gen=2nd#secret_parameters)

and use the `defineSecret` function to define secrets in your code. You can then
access them using the `.value()` method.

See the example in
[`functions/http-base/src/cloud-function.ts`](./functions/http-base/src/cloud-function.ts).

When you add a new secret with the command

```sh
firebase functions:secrets:set [SECRET_NAME] # on dev
firebase functions:secrets:set --project flim-prod [SECRET_NAME] # on prod
```

**⚠️ DON'T FORGET TO SETUP THE SECRET ON PROD TOO ⚠️**

By doing

## Troubleshooting

A list of common issues and how to solve them:

<details>
  <summary><b>The emulators doesn't work when I try to start it</b></summary>

You're probably missing the rights because you're logged out of firebase tools.
You can fix this by running:

```sh
npx firebase login
```

</details>

<details>
  <summary><b>My tests are not running in the emulator suite</b></summary>

You forgot to add the env variable to force the tests to run in the emulator.

</details>

<details>
  <summary><b>I don't want cache on my commands</b></summary>

You can use the `--cache=local:w` flag to disable the cache for a specific
command.

```sh
pnpm run test --cache=local:w
```

[caching with Turborepo](https://turborepo.com/docs/reference/run#--cache-options)

</details>

## Environnement variables

Check for .env.example for environnement variables to setup

## Github Secrets

 There are few github secrets to setup for auto deploy cloud functions
 - PROJECT_ID
 - FIREBASE_TOKEN

## Service account
Put the service account at the root of the repo
export GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
echo $GOOGLE_APPLICATION_CREDENTIALS

## PM 2 Commands
pm2 start pnpm --name "dev" -- -F @repo/front start -p 3001 <!-- OR 3000 -->
Two pm2 environment "dev" and "prod"

## Auto deploy with ssh and PM2

Steps to follow:

- To allow the folder to be used by github, create a deploy key

- Create a folder in the web server `/var/www/<folder>`
- create the .env file
- Build the app
- Command to start pm2 server : ` pm2 start pnpm --name PM2_NAME_APP -- start --port PORT_NUMBER`

- Add these variables in the Secrets repository :
  - VPS_HOST: The ip address: XXX.XXX.XXX.XXX
  - VPS_USER: The ssh user (often `debian`)
  - SSH_PRIVATE_KEY: A key of your local computer who has his PUBLIC key in the `authorized_keys` (like `-----BEGIN OPENSSH PRIVATE KEY-----`)

- Check that environnement in the CI file is the same as the `PM2_NAME_APP` previously setup

- Create a nginx file reverse proxy in the vps:
  - Create a file in `/etc/nginx`
  - default nginx reverse proxy:
- ```server {
    server_name me.geo-gamer.net;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        }
    }
  ```

- Create a link between site-available and site-enabled : `sudo ln -s /etc/nginx/sites-available/<FILE> /etc/nginx/sites-enabled/`
- Check that nginx config is good : `sudo nginx -t`
- Reload nginx: `sudo systemctl reload nginx`
- run certbot : `sudo certbot --nginx -d me.geo-gamer.net`

- Use `ecosystem.config.js` to setup pm2 deploy, just run `pm2 start ecosystem.config.js`

## Send build to vps
# First method (slow)
 scp -r apps/front/.next/ debian@141.94.220.102:/var/www/prod/

# second method (slow)
tar -czf next.tar.gz apps/front/.next/
scp -r next.tar.gz debian@141.94.220.102:/var/www/prod/
