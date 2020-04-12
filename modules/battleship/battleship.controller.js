import _ from 'lodash'
import { GameModel, PlayerModel, BoardModel, AttackModel, __ROW, __SHIPS, __WINNING, SHIP_IDENTIFIER } from './battleship.model'
import { useful } from './../../lib/usefulFunc'

class BattleshipController {
  constructor() {
  }
  /**
    * @description register new player
    * @param fullName (String)
    * @param email (String)
    * @param userName (String)
    */
  async registerPlayer(req, res) {
    let {
      fullName,
      email,
      userName
    } = req.body
    let error = false
    if (!fullName)
      error = 'fullName missing'
    else if (!email)
      error = 'email missing'
    else if (!userName)
      error = 'userName missing'
    if (error)
      return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${error}`)
    const userNameLC = userName.toLowerCase()
    const metaData = _.omit(req.body, ['fullName', 'email', 'userName'])
    try {
      let playerData = new PlayerModel({ fullName, email, userName, userNameLC, metaData })
      let savedResult = await playerData.save()
      let result = {
        registeredOn: useful.convertToDate(savedResult.registeredOn, true),
        playerId: savedResult._id,
        fullName: savedResult.fullName,
        email: savedResult.email,
        userName: savedResult.userName,
      }
      return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'saved', result)
    }
    catch (Ex) {
      if (Ex.code == 11000)
        return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: 'already exists'`)
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
  }
  /**
    * @description Let player create a game
      - check playerId exist
      - create game with playerId as createdBy and status 'waiting' (default)
      - create board with playerId and gameId
      - return response to client
    * @param playerId (Mongo ObjectId)
    */
  async createGame(req, res) {
    let { playerId } = req.params
    let error = false
    if (!playerId || useful.validateMongoId(playerId).error)
      error = 'playerId missing or invalid'
    if (error)
      return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${error}`)
    try {
      let playerCount = await PlayerModel.count({ _id: useful.makeMongoId(playerId) })
      if (playerCount) {
        try {
          let gameData = new GameModel({ createdBy: useful.makeMongoId(playerId), status: 'waiting' })
          let gameSavedResult = await gameData.save()
          if (gameSavedResult) {
            try {
              let boardData = new BoardModel({ playerId: useful.makeMongoId(playerId), gameId: useful.makeMongoId(gameSavedResult._id) })
              let boardSavedResult = await boardData.save()
              let result = {
                gameId: gameSavedResult._id,
                boardId: boardSavedResult._id,
                playerId: playerId,
                status: gameSavedResult.status
              }
              return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'created', result)
            }
            catch (Ex) {
              return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
            }
          }
        }
        catch (Ex) {
          return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
        }
      }
      else {
        return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: player not found`)
      }
    }
    catch (Ex) {
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
  }
  /**
    * @description Let player join a game
      - check playerId exist
      - find game having status 'waiting' (player cannot join board on his created game)
      - create board with playerId and gameId
      - update game status to 'ready'
      - return response to client
    * @param playerId (Mongo ObjectId)
    */
  async joinGame(req, res) {
    let { playerId, gameId } = req.params
    let error = false
    if (!playerId || useful.validateMongoId(playerId).error)
      error = 'playerId missing or invalid'
    if (!gameId || useful.validateMongoId(gameId).error)
      error = 'gameId missing or invalid'
    if (error)
      return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${error}`)
    try {
      let playerCount = await PlayerModel.count({ _id: useful.makeMongoId(playerId) })
      if (playerCount) {
        try {
          let gameResult = await GameModel.find({ _id: useful.makeMongoId(gameId), createdBy: { $ne: useful.makeMongoId(playerId) }, status: 'waiting' })
          if (gameResult && gameResult.length) {
            try {
              let boardResult = await BoardModel.find({ playerId: useful.makeMongoId(gameResult[0].createdBy), gameId: useful.makeMongoId(gameResult[0]._id) })
              try {
                let boardData = new BoardModel({ playerId: useful.makeMongoId(playerId), gameId: useful.makeMongoId(gameId) })
                let boardSavedResult = await boardData.save()
                try {
                  await GameModel.update({ _id: useful.makeMongoId(gameResult[0]._id) }, { $set: { status: 'ready' } })
                  gameResult = await GameModel.find({ _id: useful.makeMongoId(gameResult[0]._id) })
                  let result = {
                    gameId: gameResult[0]._id,
                    player1_boardId: boardResult[0]._id,
                    player2_boardId: boardSavedResult._id,
                    player1_id: gameResult[0].createdBy,
                    player2_id: playerId,
                    status: gameResult[0].status
                  }
                  return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'joined', result)
                }
                catch (Ex) {
                  return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
                }
              }
              catch (Ex) {
                return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
              }
            }
            catch (Ex) {
              return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
            }
          }
          else {
            return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: game not found or active`)
          }
        }
        catch (Ex) {
          return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
        }
      }
      else {
        return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: player not found`)
      }
    }
    catch (Ex) {
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
  }
  /**
    * @description Place ship coordinates on the board
    * @param playerId (Mongo ObjectId)
    * @param boardId (Mongo ObjectId)
    * @param shipCoordinates (JSON Object)
      - sample shipCoordinates input:{
        "shipCoordinates":{
          "battleship": [
            [{"A": 2}, {"A": 3}, {"A": 4}, {"A": 5}, {"A": 6}]
          ],
          "cruisers": [
            [{"C": 0}, {"D": 0}, {"E": 0}, {"F": 0}],
            [{"C": 2}, {"D": 2}, {"E": 2}, {"F": 2}]
          ],
          "destroyers": [
            [{"G": 1}, {"H": 1}, {"I": 1}],
            [{"G": 3}, {"G": 4}, {"G": 5}],
            [{"I": 3}, {"I": 4}, {"I": 5}]
          ],
          "submarines": [
            [{"A": 8}, {"A": 9}],
            [{"C": 4}, {"D": 4}],
            [{"C": 6}, {"D": 6}],
            [{"J": 7}, {"J": 8}]
          ]
        }
      }
    * sample placement output:
      [ [ 0,         0,         'B-0',     'B-0',     'B-0',     'B-0',     'B-0',     0,         'S-0',     'S-0' ],
        [ 0,         0,         0,         0,         0,         0,         0,         0,         0,         0     ],
        ['C-0',      0,         'C-1',     0,         'S-1',     0,         'S-2',     0,         0,         0     ],
        ['C-0',      0,         'C-1',     0,         'S-1',     0,         'S-2',     0,         0,         0     ],
        ['C-0',      0,         'C-1',     0,         0,         0,         0,         0,         0,         0     ],
        ['C-0',      0,         'C-1',     0,         0,         0,         0,         0,         0,         0     ],
        [ 0,         'D-0',     0,         'D-1',     'D-1',     'D-1',     0,         0,         0,         0     ],
        [ 0,         'D-0',     0,         0,         0,         0,         0,         0,         0,         0     ],
        [ 0,         'D-0',     0,         'D-2',     'D-2',     'D-2',     0,         0,         0,         0     ],
        [ 0,         0,         0,         0,         0,         0,         0,         'S-3',     'S-3',     0     ]
      ]
    */
  async boardPlacement(req, res) {
    let { playerId, boardId } = req.params
    let { shipCoordinates } = req.body
    let error = false
    if (!playerId || useful.validateMongoId(playerId).error)
      error = 'playerId missing or invalid'
    if (!boardId || useful.validateMongoId(boardId).error)
      error = 'boardId missing or invalid'
    if (!shipCoordinates || !shipCoordinates instanceof Object)
      error = 'shipCoordinates missing or invalid'
    if (error)
      return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${error}`)
    let shipsNames = Object.keys(shipCoordinates)
    let requiredFields = Object.keys(__SHIPS)
    var receivedFields = _.intersection(shipsNames, requiredFields);
    if (requiredFields.length != receivedFields.length)
      error = `ships missing: ${requiredFields}`
    if (error)
      return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${error}`)
    try {
      let playerCount = await PlayerModel.count({ _id: useful.makeMongoId(playerId) })
      if (!playerCount) {
        return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: player not found`)
      }
    }
    catch (Ex) {
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
    try {
      let boardResult = await BoardModel.find({ _id: useful.makeMongoId(boardId), playerId: useful.makeMongoId(playerId) }).populate('playerId').populate('gameId').lean().exec()
      if (boardResult && boardResult.length) {
        if (useful.isObject(boardResult[0]) && _.has(boardResult[0], 'playerId') && _.has(boardResult[0], 'gameId')) {
          if (boardResult[0].status == 'ready') {
            await BoardModel.update({ _id: useful.makeMongoId(boardResult[0]._id) }, {
              $set: { status: 'placing' }
            })
            let currentPlacement = boardResult[0].placement
            let size = currentPlacement.length
            for (let ship in shipCoordinates) {
              if (_.has(__SHIPS, ship)) {

                /* 
                  place ship one by one: 
                  - submarines = [ [{A: 1}, {A: 2}], [{B: 1}, {B: 2}], [{C: 1}, {C: 2}], [{D: 1}, {D: 2}] ]
                */
                let eachShip = shipCoordinates[ship]
              
                if (Array.isArray(eachShip) && eachShip.length == __SHIPS[ship].count) {
                  let eachShipLen = eachShip.length

                  /* 
                    Array of Objects inside Array: 
                    - [ [ { A: 1 }, { A: 2 }], [{ B: 1 }, { B: 2 }], [{ C: 1 }, { C: 2 }], [{ D: 1 }, { D: 2 } ] ]
                  */
                  for (let eachArrayIndex = 0; eachArrayIndex < eachShipLen; eachArrayIndex++) {
                    let eachArrayLen = eachShip[eachArrayIndex].length
                    if (eachArrayLen == __SHIPS[ship].points) {
                      let keysCord = [], valuesCord = []
                      
                      // check adjacent
                      let startPoint = eachShip[eachArrayIndex][0], endPoint = eachShip[eachArrayIndex][eachArrayLen - 1]
                      if (startPoint instanceof Object && Object.keys(startPoint).length == 1) {
                        let startPointKeyName = Object.keys(startPoint)[0] // A
                        if (_.has(__ROW, startPointKeyName)) {
                          let fPart = _.get(__ROW, startPointKeyName) // 0
                          let sPart = startPoint[startPointKeyName] // 1
                          if (fPart > 0) {
                            let before = fPart - 1
                            if (currentPlacement[before][sPart]) {
                              await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                $set: { status: 'ready' }
                              })
                              return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(startPoint)} adjacent coordinate found`)
                            }
                            if (fPart < size - 1) {
                              let after = fPart + 1
                              if (currentPlacement[after][sPart]) {
                                await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                  $set: { status: 'ready' }
                                })
                                return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(startPoint)} adjacent coordinate found`)
                              }
                            }
                          }
                          if (sPart > 0) {
                            let before = sPart - 1
                            if (currentPlacement[fPart][before]) {
                              await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                $set: { status: 'ready' }
                              })
                              return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(startPoint)} adjacent coordinate found`)
                            }
                            if (sPart < size - 1) {
                              let after = sPart + 1
                              if (currentPlacement[fPart][after]) {
                                await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                  $set: { status: 'ready' }
                                })
                                return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(startPoint)} adjacent coordinate found`)
                              }
                            }
                          }
                        }
                      }
                      
                      /*
                        Array of Objects: 
                        - [ {A: 0}, {A: 1}, {A: 2}, {A: 3}, {A: 4} ] OR [ {A: 0}, {B: 0}, {C: 0}, {D: 0}, {E: 0} ]
                      */
                      for (let index = 0; index < eachArrayLen; index++) {

                        /* 
                          each coordinate:
                          - { A: 0 }
                        */
                        let eachCord = eachShip[eachArrayIndex][index]
                        if (eachCord instanceof Object && Object.keys(eachCord).length == 1) {
                          let keyName = Object.keys(eachCord)[0] // A
                          if (_.has(__ROW, keyName)) {
                            let firstPart = _.get(__ROW, keyName) // 0
                            let secondPart = eachCord[keyName] // 1
                            __DEBUG(firstPart, secondPart, __LINE())
                            // check if coordinates are out range
                            if (firstPart >= size || secondPart >= size || firstPart < 0 || secondPart < 0) {
                              await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                $set: { status: 'ready' }
                              })
                              return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} coordinate out of range`)
                            }
                            // check if coordinate already visited
                            if (currentPlacement[firstPart][secondPart]) { // 0 1
                              await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                $set: { status: 'ready' }
                              })
                              return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} duplicate coordinate found`)
                            }

                            /* 
                              validation ship position
                              - either vertical or horizontal
                              - if horizontal [00, 01, 02, 03, 04] OR [A0, A1, A2, A3, A4]
                                the 'Keys' array values should be in sequence
                                the 'Values' array value should be similar
                              - if vertical [00, 10, 20, 30, 40] OR [A0, B0, C0, D0, E0]
                                the 'Keys' array values should be in similar
                                the 'Values' array value should be in sequence
                              */
                            keysCord.push(firstPart)
                            valuesCord.push(secondPart)
                            console.log(keysCord, valuesCord)
                            if (keysCord.length > 1 && valuesCord.length > 1) {
                              let isSameKeys = keysCord.every((val, i, arr) => val === arr[0]) // [0, 0, 0, 0, 0]
                              let isSequenceKeys = keysCord.every((val, i, arr) => { // [0, 1, 2, 3, 4]
                                let newVal = arr[i + 1]
                                if (i == arr.length - 1) newVal = val + 1;
                                return newVal - val === 1
                              })
                              let isSameValues = valuesCord.every((val, i, arr) => val === arr[0]) // [0, 0, 0, 0, 0]
                              let isSequenceValues = valuesCord.every((val, i, arr) => { // [0, 1, 2, 3, 4]
                                let newVal = arr[i + 1]
                                if (i == arr.length - 1) newVal = val + 1;
                                return newVal - val === 1
                              })
                              __DEBUG(isSameKeys, isSameValues, isSequenceKeys, isSequenceValues, __LINE())
                              if (isSameKeys || isSequenceKeys) {
                                if (isSameKeys && !isSequenceValues) {
                                  await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                    $set: { status: 'ready' }
                                  })
                                  return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} invalid coordinates`)
                                }
                                else if (isSequenceKeys && !isSameValues) {
                                  await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                    $set: { status: 'ready' }
                                  })
                                  return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} invalid coordinates`)
                                }
                              }
                              else {
                                await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                  $set: { status: 'ready' }
                                })
                                return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} invalid coordinates`)
                              }
                              if (isSameValues || isSequenceValues) {
                                if (isSameValues && !isSequenceKeys) {
                                  await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                    $set: { status: 'ready' }
                                  })
                                  return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} invalid coordinates`)
                                }
                                else if (isSequenceValues && !isSameKeys) {
                                  await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                    $set: { status: 'ready' }
                                  })
                                  return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} invalid coordinates`)
                                }
                              }
                              else {
                                await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                                  $set: { status: 'ready' }
                                })
                                return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} invalid coordinates`)
                              }
                            }
                          
                            // place ship
                            currentPlacement[firstPart][secondPart] = `${__SHIPS[ship].identifier}-${eachArrayIndex}`
                          }
                          else {
                            await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                              $set: { status: 'ready' }
                            })
                            return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ${JSON.stringify(eachCord)} coordinate out of range`)
                          }
                        }
                        else {
                          await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                            $set: { status: 'ready' }
                          })
                          return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - invalid coordinate`)
                        }
                      }
                    }
                    else {
                      await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                        $set: { status: 'ready' }
                      })
                      return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - too much coordinates received`)
                    }
                  }
                }
                else {
                  await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                    $set: { status: 'ready' }
                  })
                  return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - invalid format or too much coordinate`)
                }
              }
              else {
                await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                  $set: { status: 'ready' }
                })
                return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${ship} - ship not found`)
              }
            }
            try {
              await BoardModel.update({ _id: useful.makeMongoId(boardId) }, { $set: { placement: currentPlacement, status: 'running' } })
            }
            catch (Ex) {
              return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
            }
            try {
              let boardCount = await BoardModel.count({ playerId: { $ne: useful.makeMongoId(playerId) }, gameId: useful.makeMongoId(boardResult[0].gameId._id), status: 'running' })
              if (boardCount) {
                await GameModel.update({ _id: useful.makeMongoId(boardResult[0].gameId._id) }, {
                  $set: { status: 'running' }
                })
              }
            }
            catch (Ex) {
              return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
            }
            return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, `placed`)
          }
          else {
            return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: already placed`)
          }
        }
        else {
          return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: game not found`)
        }
      }
      else {
        return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: board not found`)
      }
    }
    catch (Ex) {
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
  }
  /**  
    * @description attack on ship
    * @param playerId (Mongo ObjectId)
    * @param boardId (Mongo ObjectId)
    * @param shipCoordinates (JSON Object)
  */
  async boardAttack(req, res) {
    let { playerId, gameId } = req.params
    let { coordinates } = req.body
    let error = false
    if (!playerId || useful.validateMongoId(playerId).error)
      error = 'playerId missing or invalid'
    if (!coordinates || !coordinates instanceof Object || Object.keys(coordinates).length > 1)
      error = 'coordinates missing or invalid'
    if (error)
      return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${error}`)
    try {
      let playerCount = await PlayerModel.count({ _id: useful.makeMongoId(playerId) })
      if (!playerCount) {
        return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: player not found`)
      }
    }
    catch (Ex) {
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
    try {
      let boardResult = await BoardModel.find({
        playerId: { $ne: useful.makeMongoId(playerId) },
        gameId: useful.makeMongoId(gameId)
      }).populate('playerId').populate('gameId').lean().exec()
      if (boardResult && boardResult.length) {
        if (useful.isObject(boardResult[0]) && _.has(boardResult[0], 'playerId') && _.has(boardResult[0], 'gameId')) {
          if (boardResult[0].status == 'ready') {
            return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: you partner has not placed coordinates on board yet, please wait.`)
          }
          if (boardResult[0].gameId.status == 'running') {
            let boardId = boardResult[0]._id
            let currentPlacement = boardResult[0].placement
            let size = currentPlacement.length
            let keyName = Object.keys(coordinates)[0]
            if (_.has(__ROW, keyName)) {
              let firstPart = _.get(__ROW, keyName) // 0
              let secondPart = coordinates[keyName] // 1

              // check if coordinates are out range
              if (firstPart >= size || secondPart >= size || firstPart < 0 || secondPart < 0) {
                return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${JSON.stringify(coordinates)} coordinate out of range`)
              }
              let fetchedCord = currentPlacement[firstPart][secondPart]
              try {
                let attackResult = await AttackModel.find({
                  boardId: useful.makeMongoId(boardId),
                  playerId: useful.makeMongoId(playerId),
                  gameId: useful.makeMongoId(boardResult[0].gameId._id),
                  coordinate: `${keyName}${secondPart}`
                })
                if (attackResult && attackResult.length) {
                  return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${JSON.stringify(coordinates)} already attacked`)
                }
              }
              catch (Ex) {
                return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
              }

              let attackData = {
                boardId: useful.makeMongoId(boardId),
                playerId: useful.makeMongoId(playerId),
                gameId: useful.makeMongoId(boardResult[0].gameId._id),
                coordinate: `${keyName}${secondPart}`,
                action: 'miss'
              }

              // if not 0
              if (fetchedCord) {
                attackData = {
                  boardId: useful.makeMongoId(boardId),
                  playerId: useful.makeMongoId(playerId),
                  gameId: useful.makeMongoId(boardResult[0].gameId._id),
                  coordinate: `${keyName}${secondPart}`,
                  action: 'hit'
                }

                // increment board hits count by 1
                try {
                  await BoardModel.update({ _id: useful.makeMongoId(boardId) }, { $inc: { hits: 1 } })
                }
                catch (Ex) {
                  return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
                }
              }

              try {
                let attackSaveResult = new AttackModel(attackData)
                await attackSaveResult.save()
              }
              catch (Ex) {
                return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
              }
              try {
                boardResult = await BoardModel.find({ _id: useful.makeMongoId(boardId) })
                if (boardResult && boardResult.length) {
                  // check if winning hit
                  if (boardResult[0].hits >= __WINNING) {
                    try {
                      await AttackModel.update(
                        {
                          boardId: useful.makeMongoId(boardId),
                          playerId: useful.makeMongoId(playerId),
                          gameId: useful.makeMongoId(boardResult[0].gameId._id)
                        },
                        {
                          $set: { isLastHit: true }
                        }
                      )
                    }
                    catch (Ex) {
                      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
                    }
                    try {
                      let attackCount = await AttackModel.count({
                        boardId: useful.makeMongoId(boardId),
                        playerId: useful.makeMongoId(playerId),
                        gameId: useful.makeMongoId(boardResult[0].gameId._id)
                      })
                      try {
                        // final update: Game Finished
                        await GameModel.update(
                          {
                            _id: useful.makeMongoId(boardResult[0].gameId._id)
                          },
                          {
                            $set: {
                              endedOn: +new Date(),
                              winner: useful.makeMongoId(playerId),
                              winningAttempt: attackCount,
                              status: 'finished'
                            }
                          }
                        )
                        return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, `Win! You have completed the game in ${attackCount} moves.`)
                      }
                      catch (Ex) {
                        return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
                      }
                    }
                    catch (Ex) {
                      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
                    }
                  }
                  else {
                    // find sunk
                    if ('hit' == attackData.action) {
                      try {
                        let attackCount = await AttackModel.count({
                          boardId: useful.makeMongoId(boardId),
                          playerId: useful.makeMongoId(playerId),
                          gameId: useful.makeMongoId(boardResult[0].gameId._id),
                          coordinate: `${keyName}${secondPart}`
                        })
                        let idName = fetchedCord.split('')
                        if (_.has(SHIP_IDENTIFIER, idName[0])) {
                          let sName = _.get(SHIP_IDENTIFIER, idName[0])
                          let shipPoint = __SHIPS[sName].points
                          if (attackCount % shipPoint == 0) {
                            return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, `You just sunk a ${sName}`)
                          }
                        }
                      }
                      catch (Ex) {
                        return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
                      }
                    }
                    return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, `${attackData.action}`)
                  }
                }
                else {
                  return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: board not found`)
                }
              }
              catch (Ex) {
                return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
              }
            }
            else {
              return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: ${JSON.stringify(coordinates)} invalid coordinate`)
            }
          }
          else {
            return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: game not running`)
          }
        }
        else {
          return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: game not found`)
        }
      }
      else {
        return useful.sendResponse(res, true, useful.httpCodes.BAD, `${__LINE()}: board not found`)
      }
    }
    catch (Ex) {
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
  }
  /**
  * @description get any info
  * @param type (String)
  * query parameters
*/
  async info(req, res) {
    let { type } = req.params
    let info = {
      count: 0,
      data: []
    }
    let param = req.query
    let skip = 0;
    if (_.has(param, 'page'))
      skip = parseInt(_.get(param, 'page')) - 1;
    let count = _.has(param, 'count') ? parseInt(_.get(param, 'count')) : 10;
    let sortBy = { 'createdOn': -1 }
    let condition = {}
    if (Object.keys(param).length > 0) {
      for (let p in param) {
        if ('id' == p) {
          if (useful.validateMongoId(_.get(param, 'id')).error)
            return useful.sendResponse(res, true, useful.httpCodes.BAD, `invalid id`)
          _.extend(condition, { _id: useful.makeMongoId(_.get(param, 'id')) });
        }
        else if (p.indexOf('Id') > -1) {
          if (useful.validateMongoId(_.get(param, p)).error)
            return useful.sendResponse(res, true, useful.httpCodes.BAD, `invalid ${p}`)
          condition[p] = useful.makeMongoId(_.get(param, p))
        }
        else
          condition[p] = _.get(param, p)
      }
      delete condition.sortBy
      delete condition.sortMethod
      delete condition.count
      delete condition.page
      if (_.has(param, 'sortBy')) {
        sortBy = {}
        if (_.has(param, 'sortMethod') && ['asc', 'ASC'].indexOf(_.get(param, 'sortMethod')) > -1)
          sortBy[_.get(param, 'sortBy')] = 1
        else
          sortBy[_.get(param, 'sortBy')] = -1
      }
    }
    __DEBUG(`condition ==> ${JSON.stringify(condition)}`, __LINE())
    try {
      switch (type) {
        case 'player':
            let playerCount = await PlayerModel.count(condition)
            if (playerCount) {
              let playerResult = await PlayerModel.find(condition).sort(sortBy).skip(skip).limit(count)
              let result = {
                registeredOn: useful.convertToDate(playerResult[0].registeredOn, true),
                playerId: playerResult[0]._id,
                fullName: playerResult[0].fullName,
                email: playerResult[0].email,
                userName: playerResult[0].userName,
              }
              info = {
                count: playerCount,
                data: result
              }
              return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'fetched', info)
            }
          break;
        case 'game':
            let gameCount = await GameModel.count(condition)
            if (gameCount) {
              let gameResult = await GameModel.find(condition).populate('playerId').sort(sortBy).skip(skip).limit(count).lean().exec()
              let result = {
                startedOn: gameResult[0].startedOn ? useful.convertToDate(gameResult[0].startedOn, true): 0,
                endedOn: gameResult[0].endedOn ? useful.convertToDate(gameResult[0].endedOn, true) : 0,
                createdOn: useful.convertToDate(gameResult[0].createdOn, true),
                status: gameResult[0].status,
                winningAttempt: gameResult[0].winningAttempt,
                gameId: gameResult[0]._id,
                createdBy: gameResult[0].createdBy,
              }
              info = {
                count: gameCount,
                data: result
              }
              return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'fetched', info)
            }
          break;
        case 'board':
            let boardCount = await BoardModel.count(condition)
            if (boardCount) {
              let boardResult = await BoardModel.find(condition).populate('playerId').populate('gameId').sort(sortBy).skip(skip).limit(count).lean().exec()
              info = {
                count: boardCount,
                data: boardResult
              }
              return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'fetched', info)
            }
          break;
        case 'attack':
            let attackCount = await AttackModel.count(condition)
            if (attackCount) {
              let attackResult = await AttackModel.find(condition).populate('playerId').populate('gameId').populate('boardId').sort(sortBy).skip(skip).limit(count).lean().exec()
              info = {
                count: attackCount,
                data: attackResult
              }
              return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'fetched', info)
            }
          break;
        default:
          return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'no data found', info)
      }
      return useful.sendResponse(res, false, useful.httpCodes.SUCCESS, 'no data found', info)
    }
    catch (Ex) {
      return useful.sendResponse(res, true, useful.httpCodes.SERVER, `${__LINE()}: ${Ex.message}`)
    }
  }
}
module.exports = new BattleshipController()