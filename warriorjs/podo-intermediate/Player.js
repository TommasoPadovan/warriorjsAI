class Player {
    constructor() {
        this.MAX_HEALT = 20;
        this.CRIT_HEALTH = 10;
        this.resting = false;
    }

    playTurn(warrior) {
        if (this.resting) {
            warrior.rest();
            if (warrior.health() >= this.MAX_HEALT) this.resting = false;
            return;
        }

        const enemyDirections = ['forward', 'left', 'right', 'backward'].map(direction => {
            if (warrior.feel(direction).isEnemy()) return {direction: direction, what: 'enemy'};
            else if (warrior.feel(direction).isCaptive()) return {direction: direction, what: 'captive'};
            else return {};
        });

        if (warrior.health() < this.CRIT_HEALTH) {
            if (enemyDirections.some(dir => dir.what === 'enemy')){
                this.bindAnEnemy(enemyDirections, warrior);
                return;
            }
            else this.restUntilMaxHealth(warrior);
        } else {
            if (this.countEnemyMelee(enemyDirections)>1) {
                this.bindAnEnemy(enemyDirections, warrior);
                return;
            } else if (this.countEnemyMelee(enemyDirections) === 1){
                this.attackAnEnemy(enemyDirections, warrior);
                return;
            } else if (this.countCaptiveMelee(enemyDirections) > 0) {
                this.unbindACaptive(enemyDirections, warrior);
                return;
            } else {
                this.walkTowardsNextObjective(warrior);
                return;
            }
        }

        // if (enemyDirection) warrior.attack(enemyDirection);
        // else {
        //     if (warrior.health() < this.MAX_HEALT) warrior.rest();
        //     else warrior.walk(warrior.directionOfStairs());
        // }
    }

    restUntilMaxHealth(warrior) {
        warrior.rest();
        this.resting = true;
    }

    countEnemyMelee(enemyDirections) {
        let c = 0;
        enemyDirections.forEach(dir => {
           if (dir.what === 'enemy') c++;
        });
        return c;
    }

    bindAnEnemy(enemyDirections, warrior) {
        warrior.bind(enemyDirections.find(dir => dir.what === 'enemy').direction);
    }

    attackAnEnemy(enemyDirections, warrior) {
        warrior.attack(enemyDirections.find(dir => dir.what === 'enemy').direction);
    }

    countCaptiveMelee(enemyDirections) {
        let c = 0;
        enemyDirections.forEach(dir => {
            if (dir.what === 'captive') c++;
        });
        return c;
    }

    unbindACaptive(enemyDirections, warrior) {
        warrior.rescue(enemyDirections.find(dir => dir.what === 'captive').direction);
    }

    walkTowardsStairs(warrior) {
        warrior.walk(warrior.directionOfStairs());
    }

    walkTowardsNextObjective(warrior) {
        const direction = this.nextObjective(warrior);
        console.log("will walk " + direction);
        warrior.walk(direction);
    }

    nextObjective(warrior) {
        const spaces = warrior.listen();
        let dir = undefined;
        [
            space => space.isEnemy(),
            space => space.isCaptive()
        ].forEach(fun => {
            if (spaces.some(fun)) {
                dir = warrior.directionOf(spaces.find(fun));
            }
        });

        if (!dir) dir = warrior.directionOfStairs();
        return dir;


    }
}

