//let {MySpace} = require("/home/pado/Unipd/AI/warriorjsAI/warriorjs/podo-beginner/model.js");
//"/home/pado/Unipd/AI/warriorjsAI/warriorjs/podo-beginner/model.js"

const MAX_HEALTH = 20;
const GOOD_HEALTH = 15;
const CRITIC_HEALTH = 10;
	
var underAttack = false;

var exploredBackwards = false;
var direction = 'forward';

const State = {
	noOp: 0,
	walk: 1,
	rest: 2,
	attack: 3,
	rush: 4,
	retreat: 5
};


function oppositeDirection(direction) {
	if (direction === 'backward') return 'forward';
	else return 'backward';
}

class Player {

	constructor() {

		this.health = 20;
		this.position = 0;
		this.model = {};
		this.front = 'forward';
		for (let i=-100; i<101; i++) {
			this.model[i] = new MySpace();
		}

		this.firstTurn = true;
		this.underRangedAttack = 0;
	}

    /**
	 * Warrior looks forward and backwards and returns the relative positions where he sees something
     * @param warrior
     * @returns {[null,null]}
     */
	static lookBothDirections(warrior) {
		const forward = warrior.look().findIndex(space => !space.isEmpty());
		const backward = warrior.look('backward').findIndex(space => !space.isEmpty());

		return [forward, backward];
	}

    static frontEnemyDistance(warrior) {
		let distance = warrior.look().findIndex(space => space.isEnemy());
		return distance > 0 ? distance : 666;
	}

	static enemyInSight(warrior) {
		const forwardIndex = warrior.look().findIndex(space => space.isEnemy());
		const backwardIndex = warrior.look('backward').findIndex(space => space.isEnemy());
		const firstNonempty = Player.lookBothDirections(warrior);
		if (forwardIndex !== -1 && forwardIndex === firstNonempty[0]) return true;
		if (backwardIndex !== -1 && backwardIndex === firstNonempty[1]) return true;
		return false;
	}




    playTurn(warrior) {


        //keep track of the health variations
        const deltaHealth = warrior.health() - this.health;
        this.health = warrior.health();

        /*if (deltaHealth < 0 &&
        		!warrior.feel().isEnemy() &&
				!warrior.feel('backward').isEnemy()) {
        	this.underRangedAttack ++;
		} else {
        	this.underRangedAttack = 0;
		}
		if (this.underRangedAttack === 3) {
        	this.flip(warrior);
        	return;
		}*/


        //update the model with the damage took in this turn
        if (!this.model[this.position]) this.model[this.position] = new MySpace();
        const newsMessage = this.model[this.position].damageTakenHere(deltaHealth * (-1));
        if (newsMessage === 'enemyDead') this.removeEnemyFromFront();

        //update with the elements in sight
        const positions = Player.lookBothDirections(warrior);
		if (this.firstTurn &&
            positions[0] === 1 &&
            positions[1] === 2) {
			this.firstTurn = false;
			this.flip(warrior);
			return;
		}
        const spaces = [
            warrior.look('forward')[positions[0]],
            warrior.look('backward')[positions[1]]
        ];
        const relativePositions = [positions[0]+1, (-1)*(positions[1]+1)];

        for (let i=0; i<2; i++) {
            if (positions[i] && spaces[i]) {
                if (!this.model[this.position + relativePositions[i]]) {
                    this.model[this.position + relativePositions[i]] = new MySpace();
                }
                if (spaces[i].isEmpty()) this.model[this.position+relativePositions[i]].empty();
                else if (spaces[i].isEnemy()) this.model[this.position+relativePositions[i]].enemy_here();
                else if (spaces[i].isCaptive()) this.model[this.position+relativePositions[i]].captive_here();
                //else if (spaces[i].isStair()) this.model[this.position+relativePositions[i]].stair();
            }
        }




        //if I am in a safe place, rest until full health
        if (this.getSpace().damage === 0 && !Player.enemyInSight(warrior)) {
            if (warrior.health() < MAX_HEALTH) warrior.rest();
            else {
            	if (warrior.feel().isCaptive()) warrior.rescue();
            	else this.walk(warrior);
            }
        } else {	//Im taking damage
			if (warrior.health()<CRITIC_HEALTH) {
				this.walkToRestToward(this.nearestSafePlace(), warrior);
			} else {
                if (warrior.feel().isCaptive()) warrior.rescue();
				else if (Player.frontEnemyDistance(warrior)<=2)
					warrior.shoot();
				else
					this.walk(warrior);
			}
        }




    };

	getSpace(i=0) {
		return this.model[this.position+i];
	}

	walk(warrior, direction='forward') {
		if (warrior.feel(direction).isWall())
			this.flip(warrior);
		else {
            const front = this.front === 'forward' ? 1 : -1;
            const dir = direction === 'forward' ? 1 : -1;

            this.position += (front * dir);

            warrior.walk(direction);
        }
	}


	flip(warrior) {
		this.front = this.front === 'forward' ? 'backward' : 'forward';
		warrior.pivot();
	}

    walkToRestToward(i, warrior) {
		const currentPos = this.position;
		if (i<0) this.walk(warrior, 'backward');
		else if (i === 0) warrior.rest();
		else this.walk(warrior);
	}

    nearestSafePlace() {
		if (this.getSpace().damage === 0) {
			return 0;
        }
		else {
			let i=1;
			while(true) {
				if (this.getSpace((-1) * i).damage === 0) {
					return (-1)*i;
                }
				if (this.getSpace(i).damage === 0) return i;
				i++;
			}
		}
	}

    removeEnemyFromFront() {
		const front = this.front === 'forward' ? 1 : -1;
		let i = 1;
		while (this.getSpace(front*i).enemy===null && i<=3) i++;
		if (i<=3) this.getSpace(front*i).empty();
    }


}



class MySpace {
    constructor() {
        this.damage = 0;
        this.is_captive = false;
        this.isStair = false;
        this.enemy = null;
    }

    damageTakenHere(dmg) {
        const oldDmg = this.damage;
        this.damage = (dmg > 0) ? dmg : 0;

        if (oldDmg < this.damage) return 'enemyDiscover';
        else if (oldDmg > this.damage) return 'enemyDead';
        else return 'noChange';
    }

    empty() {
        this.is_captive = false;
        this.isStair = false;
        this.enemy = null;
	};

	enemy_here() {
        this.is_captive = false;
        this.isStair = false;
        this.enemy = EnemyTypes.unknown;
	};

	captive_here() {
        this.is_captive = true;
        this.isStair = false;
        this.enemy = null;
	};

	stair() {
        this.is_captive = false;
        this.isStair = true;
        this.enemy = null;
	};


}


const EnemyTypes = {
    unknown: 0,
    melee: 1,
    archer: 2,
    wizard: 3
};