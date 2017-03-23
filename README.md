# Installation

Create bot user: https://my.slack.com/services/new/bot

`npm install`

# Running

`token=xxx node app.js`

# Docker

You can use this repo for running node projects: https://github.com/jacekelgda/docker-node-express-bootstrap
and then just add application under `/app`.

Remember to add `token` as env variable in docker container ( either in docker-compose or inside container `export token=zzz`).

# Heroku deployment

`heroku create app-name`

`git push heroku master`

Add `token` to config vars with bot user token.
