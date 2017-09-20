//let {MySpace} = require("/home/pado/Unipd/AI/warriorjsAI/warriorjs/podo-beginner/model.js");
//"/home/pado/Unipd/AI/warriorjsAI/warriorjs/podo-beginner/model.js"


function oppositeDirection(direction) {
	if (direction === 'backward') return 'forward';
	else return 'backward';
}

var i = 0;

class Player {


    playTurn(warrior) {
        switch(i) {
            case 0:
            case 1:
            case 2:
                warrior.walk();
                break;
            case 3:
                warrior.attack();
                break;
            case 4:
                warrior.pivot();
                break;
            case 5:
                warrior.attack('backward');
                break;
        }

        i++;


    };



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
    attackMeleeBackwards: 5,
    attackRangedLeft: 6,
    attackRangedRight: 7,
    rescue: 8

};