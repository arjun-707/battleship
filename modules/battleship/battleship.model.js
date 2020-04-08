'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BattleshipSchema = new Schema({
    player1: {
        asAttacker: {
            grid: {
                '11': {
                    placed: ['true', 'false'],
                    hit: ['true', 'false'],
                    called: ['true', 'false'],
                    shipName: [''],

                }
            },
            locationsCalledSequence: [],
            movesCount: Number
        },
        asDefender: {
            grid: {
                '11': {
                    placed: ['true', 'false'],
                    hit: ['true', 'false'],
                    called: ['true', 'false'],
                    shipName: [''],

                }
            },
            locationsCalledSequence: [],
            coordinatesCovered: []
        }
    },
    player2: {

    },
    status: ['registered', 'running', 'finished', 'cancelled', 'paused'],
    startDatetime: Timestamp,
    lastUpdate: Timestamp,
    currentMatch: {
        attacker: '',
        defender: ''
    }
});
/**
 * Hook a pre save method to hash the password
 */
BattleshipSchema.pre('save', function (next) {
    if (this.player1 && this.isModified('player1')) {
        if (Array.isArray(this.boardSize) && this.boardSize.length == 2) {
            if (this.boardSize[0] == this.boardSize[1]) {

            }
        } 
    }
    this.readableUserId += 10000000;
    next();
});
module.exports = mongoose.model('Battleship', BattleshipSchema);