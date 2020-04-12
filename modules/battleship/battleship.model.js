'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    fullName: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    userName: {
        type: String,
        unique: true,
        required: true
    },
    userNameLC: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    registeredOn: {
        type: Number,
        default: +new Date()
    },
    metaData: {
        type: mongoose.Schema.Types.Mixed
    }
});

const GameSchema = new Schema({
    startedOn: {
        type: Number,
        default: 0
    },
    endedOn: {
        type: Number,
        default: 0 // +new Date()
    },
    createdOn: {
        type: Number,
        default: +new Date()
    },
    createdBy: {
        ref: 'Player',
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String,
        enum: ['waiting', 'ready', 'placing', 'running', 'cancelled', 'paused', 'finished', 'expired'],
        default: 'waiting'
    },
    winner: {
        ref: 'Player',
        type: mongoose.Schema.Types.ObjectId
    },
    winningAttempt: {
        type: Number,
        default: 0
    },
    metaData: {
        type: mongoose.Schema.Types.Mixed
    }
});

const BoardSchema = new Schema({
    playerId: {
        ref: 'Player',
        type: mongoose.Schema.Types.ObjectId
    },
    gameId: {
        ref: 'Game',
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String,
        enum: ['ready', 'placing', 'running', 'stopped'],
        default: 'ready'
    },
    createdOn: {
        type: Number,
        default: +new Date()
    },
    metaData: {
        type: mongoose.Schema.Types.Mixed
    },
    placement: {
        type: mongoose.Schema.Types.Mixed,
        default: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    hits: {
        type: Number,
        default: 0
    }
});

const AttackSchema = new Schema({
    playerId: {
        ref: 'Player',
        type: mongoose.Schema.Types.ObjectId
    },
    gameId: {
        ref: 'Game',
        type: mongoose.Schema.Types.ObjectId
    },
    boardId: {
        ref: 'Board',
        type: mongoose.Schema.Types.ObjectId
    },
    createdOn: {
        type: Number,
        default: +new Date()
    },
    coordinate: {
        type: String
    },
    action: {
        type: String,
        enum: ['miss', 'hit']
    },
    isLastHit: {
        type: Boolean,
        default: false
    },
    shipSunk: {
        type: Boolean,
        default: false
    }
});

const __ROW = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9 }
const __WINNING = 30
const __SHIPS = {
    battleship: { count: 1, points: 5, identifier: 'B' },
    cruisers: { count: 2, points: 4, identifier: 'C' },
    destroyers: { count: 3, points: 3, identifier: 'D' },
    submarines: { count: 4, points: 2, identifier: 'S' }
}
const SHIP_IDENTIFIER = {
    B: 'battleship',
    C: 'cruisers',
    D: 'destroyers',
    S: 'submarines'
}
module.exports = {
    PlayerModel: mongoose.model('Player', PlayerSchema),
    GameModel: mongoose.model('Game', GameSchema),
    BoardModel: mongoose.model('Board', BoardSchema),
    AttackModel: mongoose.model('Attack', AttackSchema),
    __ROW,
    __WINNING,
    __SHIPS,
    SHIP_IDENTIFIER
}