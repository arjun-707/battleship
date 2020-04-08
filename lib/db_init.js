import mongoose from 'mongoose';
mongoose.Promise = global.Promise
let OPTION = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect(__CONFIG.mongo.url, OPTION, (err) => {
  if (err) {
    __DANGER(err)
  }
  else {
    __SUCCESS('mongo connected')
  }
});
