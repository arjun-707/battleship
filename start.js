import express from 'express';
import bodyParser from 'body-parser';
import apiRouters from './routers/routers';
import './lib/console.js';

global.__ENV = ['dev', 'prod'].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'dev'
__SUCCESS(`Environment: ${__ENV}`)
global.__ENABLE_DEBUG = ['true', 'false'].includes(process.env.DEBUG) ? JSON.parse(process.env.DEBUG) : false
global.__CONFIG = require(`./configs/${__ENV}/config.json`)

require("./lib/db_init.js")

// global.__LIB = require(`./lib/lib.js`)

const app = express()

/* const cors = require('cors')
app.use(cors()); */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// routing
apiRouters(app)

// 404 Handler
app.use((req, res, next) => {
  console.log('here', req.url)
  return res.status(404).send(`Endpoint <code>${req.url}</code> not found`);
})

/**
 * if any error or exception occurred then write into a JS file so that app can be restarted
 */
process.on('uncaughtException', (err) => {
  __DANGER(err.stack);
});

// server
app.listen(3000, function (server) {
  __DEBUG("App listening at 3000");
});
