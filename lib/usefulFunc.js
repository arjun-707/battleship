import mongoose from 'mongoose'

class Useful {
  constructor() {
    this.httpCodes = {
      SUCCESS: 200,
      BAD: 400,
      SERVER: 500,
      UNAUTHORIZED: 403,
      ALREADY: 302,
      NOT: 404,
      REDIRECT: 302,
      UNAVAILABLE: 451,
      LOCATION: 452,
      UPGRADE: 426
    }
  }
  getDefaultDates(dayAgo = 0, time = true, hourAgo = 0, minuteAgo = 0, secondAgo = 0, milisecondAgo = 0, ahead = 0) {
    var allmonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var day = (d) => {
      if (d < 10)
        return '0' + d;
      return d;
    };
    let today = new Date();
    var yesterday = new Date(today.getTime());
    if (hourAgo) {
      if (ahead)
        today.setHours(today.getHours() + hourAgo)
      else
        yesterday.setHours(today.getHours() - hourAgo)
      return {
        defaultStartDate: yesterday.getFullYear() + '-' + allmonths[yesterday.getMonth()] + '-' + day(yesterday.getDate()) + ' ' + day(yesterday.getHours()) + ':' + day(yesterday.getMinutes()) + ':' + day(yesterday.getSeconds()), 
        defaultEndDate: today.getFullYear() + '-' + allmonths[today.getMonth()] + '-' + day(today.getDate())  + ' ' + day(today.getHours()) + ':' + day(today.getMinutes()) + ':' + day(today.getSeconds()),
      }
    }
    else if (minuteAgo) {
      if (ahead)
        today.setMinutes(today.getMinutes() + minuteAgo)
      else
        yesterday.setMinutes(today.getMinutes() - minuteAgo)
      return {
        defaultStartDate: yesterday.getFullYear() + '-' + allmonths[yesterday.getMonth()] + '-' + day(yesterday.getDate()) +  ' ' + day(yesterday.getHours()) + ':' + day(yesterday.getMinutes()) + ':' + day(yesterday.getSeconds()), 
        defaultEndDate: today.getFullYear() + '-' + allmonths[today.getMonth()] + '-' + day(today.getDate())  + ' ' + day(today.getHours()) + ':' + day(today.getMinutes()) + ':' + day(today.getSeconds()),
      }
    }
    else if (secondAgo) {
      if (ahead)
        today.setSeconds(today.getSeconds() + secondAgo)
      else
        yesterday.setSeconds(today.getSeconds() - secondAgo)
      return {
        defaultStartDate: yesterday.getFullYear() + '-' + allmonths[yesterday.getMonth()] + '-' + day(yesterday.getDate())  + ' ' + day(yesterday.getHours()) + ':' + day(yesterday.getMinutes()) + ':' + day(yesterday.getSeconds()), 
        defaultEndDate: today.getFullYear() + '-' + allmonths[today.getMonth()] + '-' + day(today.getDate())  + ' ' + day(today.getHours()) + ':' + day(today.getMinutes()) + ':' + day(today.getSeconds()),
      }
    }
    else if (milisecondAgo) {
      if (ahead)
        today.setMilliseconds(today.getMilliseconds() + milisecondAgo)
      else
        yesterday.setMilliseconds(today.getMilliseconds() - milisecondAgo)
      return {
        defaultStartDate: yesterday.getFullYear() + '-' + allmonths[yesterday.getMonth()] + '-' + day(yesterday.getDate())  + ' ' + day(yesterday.getHours()) + ':' + day(yesterday.getMinutes()) + ':' + day(yesterday.getSeconds()) + ':' + day(yesterday.getMilliseconds()), 
        defaultEndDate: today.getFullYear() + '-' + allmonths[today.getMonth()] + '-' + day(today.getDate())  + ' ' + day(today.getHours()) + ':' + day(today.getMinutes()) + ':' + day(today.getSeconds()) + ':' + day(today.getMilliseconds()),
      }
    }
    else {
      if (ahead)
        today.setDate(today.getDate() + dayAgo)
      else
        yesterday.setDate(today.getDate() - dayAgo);
      return {
        defaultStartDate: yesterday.getFullYear() + '-' + allmonths[yesterday.getMonth()] + '-' + day(yesterday.getDate()) + (time ? ' 00:00:00' : ''), 
        defaultEndDate: today.getFullYear() + '-' + allmonths[today.getMonth()] + '-' + day(today.getDate()) + (time ? ' 00:00:00' : ''),
      }
    }
  }
  convertToDate(dt, time = false) {
    var allmonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var day = (d) => {
      if (d < 10)
        return '0' + d;
      return d;
    };
    let d = new Date(parseInt(dt));
    if (time)
      return d.getFullYear() + '-' + allmonths[d.getMonth()] + '-' + day(d.getDate()) + ' ' + day(d.getHours()) + ':' + day(d.getMinutes()) +  ':' + day(d.getSeconds())
    return d.getFullYear() + '-' + allmonths[d.getMonth()] + '-' + day(d.getDate())
  }
  convertToTimestamp(dt) {
    let fullDT = dt
    let splitDT = fullDT.split(' ')
    let date = splitDT[0].split('-')
    let time = splitDT[1].split(':')
    // console.log(date[0], parseInt(date[1], 10) - 1, date[2], time[0], time[1], time[2])
    return new Date(date[0], parseInt(date[1], 10) - 1, date[2], time[0], time[1], time[2])
  }
  searchInArrayOfObject(keyValue, nameKey, myArray, type = 'number') {
    let count = myArray.length
    for (var i=0; i < count; i++) {
      if ('string' == type) {
        if (myArray[i][keyValue] && nameKey && myArray[i][keyValue].toString() === nameKey.toString()) {
          return myArray[i];
        }
      }
      else {
        if (myArray[i][keyValue] === nameKey) {
          return myArray[i];
        }
      }
    }
    return {}
  }
  sleep(milisecond) {
    console.log('sleep...')
    return new Promise(resolve => {
      setTimeout(resolve, milisecond)
    })
  }
  sortBy(prop) {
    return function(a,b){
       if( a[prop] > b[prop]){
           return 1;
       }else if( a[prop] < b[prop] ){
           return -1;
       }
       return 0;
    }
  }
  getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
  }
  line() {
    let e = new Error();
    let frame = e.stack.split("\n")[2];
    console.log('frame', frame)
    let lineNumber = frame.split(":")[1];
    return lineNumber;
  }
  log(...l) {
    this.console.push(l)
  }
  writeLog(type, log) {
    if (this.type.indexOf(type) < 0 || log.length < 1) {
      error(`unknown log type, required from : (${this.type.join(', ')}) and log cannot be empty`)
      return false
    }
    if (this.serviceName) {
      let currentDT = new Date()
      let y = currentDT.getFullYear()
      let m = currentDT.getMonth()
      let d = currentDT.getDay()
      let h = currentDT.getHours()
      let min = currentDT.getMinutes()
      let s = currentDT.getSeconds()
      let ms = currentDT.getMilliseconds()
      let dt = y + '-' + ((m < 10) ? '0' + m : m) + '-' + ((d < 10) ? '0' + d : d) + ' ' +
        ((h < 10) ? '0' + h : h) + ':' + ((min < 10) ? '0' + min : min) + ':' +
        ((s < 10) ? '0' + s : s) + ':' + ((ms < 10) ? '0' + ms : ms)
      let logOption = {
        serviceName: this.serviceName,
        datetime: dt,
        console: log,
        allLog: JSON.stringify(this.console)
      }
      switch (type) {
        case 'error':
        case 5:
          this.logger.error(logOption)
          break;
        case 'warn':
        case 4:
          this.logger.warn(logOption)
          break;
        case 'info':
        case 3:
          this.logger.info(logOption)
          break;
        case 'verbose':
        case 2:
          this.logger.verbose(logOption)
          break;
        case 'debug':
        case 1:
          this.logger.debug(logOption)
          break;
        case 'silly':
        case 0:
          this.logger.silly(logOption)
          break;
      }
      return true
    }
    error('serviceName not defined to write log')
    return false
  }
  async deleteFolderRecursive(path) {
    if (await fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        let curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
  getComingDayDate(dayNum = 0) {
    let today = new Date()
    let day = today.getDay()
    day = (dayNum - day) + 7
    let future = new Date(today.getTime())
    future.setDate(today.getDate() + day);
    return {
        startDate: today.getTime(),
        endDate: future.getTime()
    }
  }
  convertKeyToVariable = (data, where) => {
    console.log(`********************************* convertKeyToVariable *********************************`)
    for (var key in data) {
      where[key] = data[key];
    }
    where['__receivedVAParams__'] = data
  }
  throwError = (err, option, code, exception = false, logMsg = false) => {
    let error = { error: true, msg: err, option: option, code: code }
    if (exception)
      error.exception = exception
    if (logMsg)
      error.logMsg = logMsg
    console.log('ERROR: ', JSON.stringify(error))
    return error
  }
  Result = (result) => ({ error: false, data: result })
  _Exception = (exception, last = false) => JSON.stringify((last) ? { exception, last } : { exception })
  isObject = (obj) => (obj instanceof Object)
  
  /*
  a = [ 2, 3, 4, 5]
  b = [ 2, 4]
  output => [3, 5]
   */
  findMissingElementsFromArray(a, b, n, m) {
    let missing = []
    for (let i = 0; i < n; i++) {
        let j
        for (j = 0; j < m; j++)
            if (a[i] == b[j])
                break;
        if (j == m)
            missing.push(a[i]);
    }
    return missing
  }
  validateMongoId = (id) => {
    try {
      return this.Result(mongoose.Types.ObjectId.isValid(id))
    }
    catch (Ex) {
      return this.throwError(DEFAULT_ERROR_MESSAGE, RET_ERR, RET_ERR_CODE, Ex)
    }
  }
  sendResponse = (RESPONSE_OBJECT, error, code, msg, data = []) => {
    console.log(`********************************* sendResponse *********************************`)
    if (RESPONSE_OBJECT && RESPONSE_OBJECT instanceof Object) {
      const responseData = {
        message: msg,
        error: error,
        result: data
      }
      if (error) {
        responseData.error = error
        responseData.result = []
        delete responseData.success
      }
      return RESPONSE_OBJECT.status(code).json(responseData)
    }
    else {
      danger(`invalid response object`)
      __ABORT()
    }
  }
  makeMongoId(id) {
    try {
      return mongoose.Types.ObjectId(id)
    }
    catch (Ex) {
      throw new Error(Ex)
    }
  }
}
module.exports = { useful: new Useful() }