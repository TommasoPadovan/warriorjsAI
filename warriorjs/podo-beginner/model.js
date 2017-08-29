/**
* This class is the model of the world.
*/
console.log('culo');

class MySpace {
	constructor() {
		this.damage = 0;
		this.isCaptive = false;
		this.enemy = null;
	}

	damageTakenHere(dmg) {
		const oldDmg = this.damage;
		this.damage = (dmg > 0) ? dmg : 0;

		if (oldDmg < this.damage) return 'enemyDiscover';
		else if (oldDmg > this.damage) return 'enemyDead';
		else return 'noChange'
	}
}


module.exports = MySpace;


let space = new MySpace();
console.log(space.damage);
console.log(space.damageTakenHere(420));
console.log(space.damage);
console.log(space.damageTakenHere(-322));
console.log(space.damage);














const EnemyTypes = {
	unknown: 0,
	melee: 1,
	archer: 2,
	wizard: 3
};