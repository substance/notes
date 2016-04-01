# Substance Notes [![Build Status](https://travis-ci.org/substance/notes.svg?branch=master)](https://travis-ci.org/substance/notes)

Real-time collaborative notes editing.

# Install

Install dependencies

```bash
npm install
```

Seed the db

```bash
npm run seed
```

Start the app

```bash
npm start
```

To login with the test user:

```bash
http://localhost:5000/#loginKey=1234
```

# Configuration

You can configure app for different environments.
To do that just make a new copy of ```default.json``` from ```config``` folder with name of your environment and run:

```bash
export NODE_ENV=myEnv
```

For example you can create config/production.json and then run ```export NODE_ENV=production```.