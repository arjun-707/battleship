# Battleship
Battleship Game in NodeJS

**Description**

This is an API based application for online Battleship Game.

Following are the APIs:
- **Player registration** `http://localhost:3000/v1/battleship/player/registration`: To create new player
  * Method - POST

  ###### Body part:
  ```
    email:    test@example.com
    fullName: qwerty
    userName: hello
    phone:    7887978728
    address:  H.No.23, ABC block, Delhi, India
  ```
- **Create Game Session** `http://localhost:3000/v1/battleship/create/:playerId` : To create a new game session by a player 
  * Method - PUT

- **Join Game** `http://localhost:3000/v1/battleship/join/:playerId/:gameId` : To join any game which is in `waiting` status by a player other than who created it.
  * Method - PUT
  
- **Place Coordinated** `http://localhost:3000/v1/battleship/place/:playerId/:boardId` : To place coordinates on the respective board by a player.
  * Method - POST

  ###### Body part:
  ```
    shipCoordinates: {
      battleship: [
        [{"A": 1}, {"A": 2}, {"A": 3}, {"A": 4}, {"A": 5}]
      ],
      cruisers: [
        [{"C": 0}, {"D": 0}, {"E": 0}, {"F": 0}],
        [{"C": 2}, {"D": 2}, {"E": 2}, {"F": 2}]
      ],
      destroyers: [
        [{"H": 1}, {"I": 1}, {"J": 1}],
        [{"G": 3}, {"G": 4}, {"G": 5}],
        [{"I": 3}, {"I": 4}, {"I": 5}]
      ],
      submarines: [
        [{"A": 7}, {"A": 8}],
        [{"C": 4}, {"D": 4}],
        [{"C": 6}, {"D": 6}],
        [{"J": 6}, {"J": 7}]
      ]
    }
  ```
- **Attack** `http://localhost:3000/v1/battleship/attack/:playerId/:gameId` : To attack opponent board by a player.
  * Method - POST

  ###### Body part:
  ```
    coordinates: {
      H: 3
    }
  ```
- **Fetch Data** `http://localhost:3000/v1/battleship/info/:type`: 
  * Method - GET
  * type: replace ```:type``` with any of the following ['player', 'game', 'board', 'attack']
  * other conditional parameter will be required in query params e.g: `http://localhost:3000/v1/battleship/info/attack?gameId=5e92aa836fb83711ff280063&count=100&playerId=5e92aa726fb83711ff280062`

**Requirements**
- <a href="https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04">MongoDB (3*)</a>
- <a href="https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/">NodeJS (10*)</a>

**Do following things before running the app**
- make a Database (`auth`) in MongoDB
- Setup your config as required (`configs/config.json`)
- run command `npm install` to install all the dependencies
- install nodemon globally if you want to run your app on `watch` (`npm install -g nodemon`)


**App Execution**
- `npm start`
  * the app will listen to port 3000

**Test Case**
- find the file `test-cases.txt`