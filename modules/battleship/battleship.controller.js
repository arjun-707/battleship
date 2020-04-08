import Battleship from './battleship.model.js'

class BattleshipController {
  constructor() {
  }
  async register(req, res) {
    let s = {
      email: 'arjun@9stacks.com'
    }
    let v = await Battleship.find()
    res.status(400).send({
      msg: 'pong',
      data: v
    })
  }
  async placement(req, res) {

  }
  async attack(req, res) {

  }
}
module.exports = new BattleshipController()