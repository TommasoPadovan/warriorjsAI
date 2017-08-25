const MAX_HEALTH = 20;
const GOOD_HEALTH = 15;
const CRITIC_HEALTH = 7;
	
var health=20;
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
}

function oppositeDirection(direction) {
	if (direction == 'backward') return 'forward';
	else return 'backward';
}

class Player {
	

	playTurn(warrior) {
		if (health > warrior.health()) underAttack = true;
		else underAttack = false;
		health = warrior.health()

		if (!warrior.feel(direction).isEmpty()) {
			if (warrior.feel(direction).isCaptive()){
				warrior.rescue(direction);
			}

			else {
				if (warrior.feel(direction).isWall())
					warrior.pivot();
				else
					warrior.attack(direction)
			}
		} else {

			if (warrior.health()>GOOD_HEALTH) {
				warrior.walk(direction);
			} else {
				if (underAttack) {
					if (warrior.health() <= CRITIC_HEALTH) 
						warrior.walk(oppositeDirection(direction));			//run awaaaaay bwoy
					else 
						warrior.walk(direction);
				}
				else
					warrior.rest();
			}
		}
	}



}



