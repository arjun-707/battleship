let mongoose = require('mongoose');
let OPTION = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
const Schema = mongoose.Schema;
class Exporter  {
    
    constructor() {
        // console.log('application started successfully')
    }
    mongoConnection(mongoURI, option = OPTION) {
        return new Promise(async (resolve, reject) => {
            mongoose.set('useCreateIndex', true);
            mongoose.set('debug', true);
            try {
                if (!mongoURI || typeof mongoURI == 'undefined' || mongoURI.length < 1)
                    return reject('invalid mongo connection url');
                let db = await mongoose.createConnection(mongoURI, option)
                return resolve(db)
            }
            catch (ex) {
                return reject(ex)
            }
        })
    }
    createMongoSchema(schemaObj) {
        try {
            return (new Schema(schemaObj));
        }
        catch (ex) {
            throw new Error(ex)
        }
    }
    createMongoModel(collectionName, newSchema) {
        try {
            if (newSchema)
                return mongoose.model(collectionName, newSchema)
            return mongoose.model(collectionName)
        }
        catch (ex) {
            throw new Error(ex)
        }
    }
    isObjectValid(arg, property = false, type = false, blank = false) {
        let status = false
        if (typeof arg == 'object')
            status = true
        if (property) {
            if (!arg[property] || typeof arg[property] == 'undefined') {
                console.log(`${arg}, ${property}, invalid object property`)
                status = false
            }
        }
        if (type) {
            if (typeof property == 'undefined') {
                console.log('property undefined')
                status = false
            }
        }
        if (blank) {
            if (arg[property] == '' || arg[property].trim().length == 0) {
                console.log('property length too short')
                status = false
            }
        }
        return status
    }
}
module.exports = (new Exporter());