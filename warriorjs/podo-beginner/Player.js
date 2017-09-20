//let {MySpace} = require("/home/pado/Unipd/AI/warriorjsAI/warriorjs/podo-beginner/model.js");
//"/home/pado/Unipd/AI/warriorjsAI/warriorjs/podo-beginner/model.js"


function oppositeDirection(direction) {
	if (direction === 'backward') return 'forward';
	else return 'backward';
}

var i = 0;
const MAX_HEALTH = 20;

class Player {

    constructor() {
        this.healthLastTurn = MAX_HEALTH;
        this.healthThisTurn = MAX_HEALTH;

        this.facing = "right";

        this.actualPoints = 0;
        this.potentialPoint = 0;

        this.actionLastTurn = Actions.noOp;
        this.actionThisTurn = Actions.noOp;
    }

    playTurn(warrior) {
        console.log(warrior.look('backward'));
        console.log("####################################");

        this.updateStatus(warrior);

        //this.deltaScoreForSuccessors()
    };


    updateStatus(warrior) {
        this.healthLastTurn = this.healthThisTurn;
        this.healthThisTurn = warrior.health();

        this.actionLastTurn = this.actionThisTurn;
    }

    updatePoints(warrior) {
        //penalty for each turn spent
        this.actualPoints --;
    }

    getSuccessors(warrior) {
        //base actions
        const aux = [Actions.noOp,
                Actions.rest];
        //movement
        switch (this.facing) {
            case "right":
                if (warrior.feel().isEmpty())
                    aux.push(Actions.walkLeft);
                if (warrior.feel('backward').isEmpty())
                    aux.push(Actions.walkRight);
                break;
            case "left":
                if (warrior.feel().isEmpty())
                    aux.push(Actions.walkRight);
                if (warrior.feel('backward').isEmpty())
                    aux.push(Actions.walkLeft);
                break;
        }

        //attack melee
        if (warrior.feel().isEnemy())
            aux.push(Actions.attackMelee);
        if (warrior.feel('backward').isEnemy())
            aux.push(Actions.attackMeleeBackward);

        //attack ranged
        switch (this.facing) {
            case "right":
                if (warrior.look().find(space => space.isEnemy()))
                    aux.push(Actions.attackRangedLeft);
                if (warrior.look().find(space => space.isEnemy()))
                    aux.push(Actions.attackRangedRight);
                break;
            case "left":
                if (warrior.look().find(space => space.isEnemy()))
                    aux.push(Actions.attackRangedRight);
                if (warrior.look().find(space => space.isEnemy()))
                    aux.push(Actions.attackRangedLeft);
                break;
        }

        //rescue
        if (warrior.feel().isCaptive())
            aux.push(Actions.rescue);
        if (warrior.feel('backward').isCaptive())
            aux.push(Actions.rescueBackward);


        return aux;
    }

    seeEnemy(warrior, leftOrRight) {

    }




}

const EnemyTypes = {
    unknown: 0,
    melee: 1,
    archer: 2,
    wizard: 3
};


const Actions = {
    noOp: 0,
    rest: 1,
    walkLeft: 2,
    walkRight: 3,
    attackMelee: 4,
    attackMeleeBackward: 5,
    attackRangedLeft: 6,
    attackRangedRight: 7,
    rescue: 8,
    rescueBackward: 9,
    pivot: 10
};

const Enemies = {
    sludge: {
        health: 12,
        dmg:    3,
        range:  0
    },
    thickSludge: {
        health: 24,
        dmg:    3,
        range:  0
    },
    archer: {
        health: 7,
        dmg:    3,
        range:  2
    },
    wizard: {
        health: 1,
        dmg:    11,
        range:  1
    }
};