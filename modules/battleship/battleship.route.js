import controller from './battleship.controller';
module.exports = (router) => {
  router.get('/register', controller.register)
  router.post('/coordinates/placement', controller.placement)
  router.post('/attack', controller.attack)
}