import winston from 'winston';
import chalk from 'chalk';

const now = () => {
    let allmonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let day = (d) => {
      if (d < 10)
        return '0' + d;
      return d;
    };
    let today = new Date();
    return today.getFullYear() + '-' + allmonths[today.getMonth()] + '-' + day(today.getDate())  + ' ' + day(today.getHours()) + ':' + day(today.getMinutes()) + ':' + day(today.getSeconds()) + ':' + day(today.getMilliseconds())
}
global.__LINE = () => {
    let e = new Error();
    let frame = e.stack.split("\n")[2];
    // console.log('frame', e)
    // console.log(__LINE.caller)
    let lineNumber = frame.split(":")[1];
    return lineNumber;
}
global.__ABORT = () => {
    console.log('aborted')
    return process.exit()
}
global.__WARN = function() { let e = []; for(let c = 0; c < Object.keys(arguments).length - 1; c++) { e.push(arguments[c.toString()]); } let l = arguments[e.length.toString()]; winston.warn(chalk.yellow(` ${now()} - ${!isNaN(l)? `Line: ${l}`: `${l}`} ${e}`)) }
global.__ERROR = function() { let e = []; for(let c = 0; c < Object.keys(arguments).length - 1; c++) { e.push(arguments[c.toString()]); } let l = arguments[e.length.toString()]; winston.error(chalk.bold.red(` ${now()} - ${!isNaN(l)? `Line: ${l}`: `${l}`} ${e}`)) }
global.__DANGER = function () { let e = []; for (let c = 0; c < Object.keys(arguments).length - 1; c++) { e.push(arguments[c.toString()]); } let l = arguments[e.length.toString()]; winston.error(chalk.magenta(` ${now()} - ${!isNaN(l) ? `Line: ${l}` : `${l}`} ${e}`)); process.exit()}
global.__VERBOSE = function() { let e = []; for(let c = 0; c < Object.keys(arguments).length - 1; c++) { e.push(arguments[c.toString()]); } let l = arguments[e.length.toString()]; winston.error(chalk.gray(` ${now()} - ${!isNaN(l)? `Line: ${l}`: `${l}`} ${e}`)) }
global.__DEBUG = function() { let e = []; for(let c = 0; c < Object.keys(arguments).length - 1; c++) { e.push(arguments[c.toString()]); } let l = arguments[e.length.toString()]; winston.info(chalk.cyan(` ${now()} - ${!isNaN(l)? `Line: ${l}`: `${l}`} ${e}`)) }
global.__SUCCESS = function() { let e = []; for(let c = 0; c < Object.keys(arguments).length; c++) { e.push(arguments[c.toString()]); } winston.info(chalk.blue(` ${now()} - ${e}`)) }
global.__INFO = function() { let e = []; for(let c = 0; c < Object.keys(arguments).length; c++) { e.push(arguments[c.toString()]); } winston.info(chalk.green(` ${now()} - ${e}`)) }
global.__LOG = function() { let e = []; for(let c = 0; c < Object.keys(arguments).length; c++) { e.push(arguments[c.toString()]); } console.log(`result: ${now()} - `, e) }

global.__HANDLE_EXCEPTIONS = (mongoObj = [], mysqlObj = []) => {
  const closeConnections = () => {
    if (Array.isArray(mongoObj) && mongoObj.length) {
      debug('mongo connection closed')
      mongoObj.map(each => each.close())
    }
    if (Array.isArray(mysqlObj) && mysqlObj.length) {
      debug('mysql connection closed')
      mysqlObj.map(each => each.end())
    }
    return process.exit()
  }
  process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("uncaughtException: Node Aborted");
    return closeConnections()
  });
  process.on('SIGTERM', function (err) {
    console.error(err);
    console.log("SIGTERM: Node Aborted");
    return closeConnections()
  });
  process.on('SIGINT', function (err) {
    console.error(err);
    console.log("SIGINT: Node Aborted");
    return closeConnections()
  });
  process.on('exit', function (err) {
    console.error(err);
    console.log("exit: Node Aborted");
    return closeConnections()
  });
  process.on('unhandledRejection', function (err) {
    console.error(err);
    console.log("unhandledRejection: Node Aborted");
    return closeConnections()
  });
}