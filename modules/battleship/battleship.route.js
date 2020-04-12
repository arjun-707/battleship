import controller from './battleship.controller';
module.exports = (router) => {

  router.get('/v1/battleship/info/:type', controller.info) // testing done
  router.post('/v1/battleship/player/registration', controller.registerPlayer) // testing done
  router.put('/v1/battleship/create/:playerId', controller.createGame) // testing done
  router.put('/v1/battleship/join/:playerId/:gameId', controller.joinGame) // testing done

  router.post('/v1/battleship/place/:playerId/:boardId', controller.boardPlacement)
  router.post('/v1/battleship/attack/:playerId/:gameId', controller.boardAttack)

}