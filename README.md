# cookbook

## Overview

Searching through a binder full of printed recipes is a chore.  I want to make it easier to find what you’re looking for, and start cooking.

Written with a NodeJS backend (powered by ExpressJS).  Everything is stored in a JSON file, which seems to be working fine for now.

## Getting started

Make sure you have all your dependencies!

    npm install

### Development

First terminal: `cd server/ && node cookbook.js`
Second terminal: `npm run dev`

Load up http://localhost:8080, and start developing.

### Running

    npm run build
    node server/cookbook.js
    
Visit http://localhost:8000/cookbook/ to start making recipes.

