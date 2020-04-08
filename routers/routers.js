import fs from 'fs';

const recursiveReadDirectory = (dirPath) => {
  let files = []
  if (fs.existsSync(dirPath)) {
    const filesOrDir = fs.readdirSync(dirPath);
    filesOrDir.map(filename => {
      if (fs.lstatSync(`${dirPath}/${filename}`).isDirectory()) {
        recursiveReadDirectory(`${dirPath}${filename}`).map(e => files.push(e))
      }
      else {
        files.push(`${dirPath}/${filename}`)
      }
    })
  }
  return files
}
module.exports = (app) => {
  const routeFiles = recursiveReadDirectory(`${__dirname}/../modules/`);
  if (Array.isArray(routeFiles) && routeFiles.length) {
    routeFiles.map(file => {
      if (file.indexOf('route.js') > -1) {
        require(file)(app)
      }
    })
  }
  else {
    __WARN('no route found')
  }
}