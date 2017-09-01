class Player {
    constructor() {
        this.MAX_HEALTH = 20;
        this.DECENT_HEALTH = 14;
        this.CRIT_HEALTH = 6;
        this.TOO_MUCH_TICKING = 6;
        this.resting = false;
        this.tickingCount = 0;
    }

    playTurn(warrior) {
        if (this.hearTicking(warrior)) this.tickingCount ++;
        else this.tickingCount = 0;
        if (this.tickingCount >= this.TOO_MUCH_TICKING) {
            this.walkTowardsNextObjective(warrior);
            return;
        }


        if (this.resting) {
            warrior.rest();
            if (warrior.health() >= this.DECENT_HEALTH && this.hearTicking(warrior)) this.resting = false;
            if (warrior.health() >= this.MAX_HEALTH - 1) this.resting = false;
            return;
        }


        const enemyDirections = ['forward', 'left', 'right', 'backward'].map(direction => {
            if (warrior.feel(direction).isEnemy()) return {direction: direction, what: 'enemy'};
            else if (warrior.feel(direction).isCaptive()) {
                if (warrior.feel(direction).isTicking()) {
                    return {direction: direction, what: 'tickingCaptive'};
                }
                else {
                    return {direction: direction, what: 'captive'};
                }
            }
            else return {};
        });

        if (warrior.health() < this.CRIT_HEALTH) {
            if (enemyDirections.some(dir => dir.what === 'enemy')){
                this.bindAnEnemy(enemyDirections, warrior);
                return;
            }
            else this.restUntilMaxHealth(warrior);
        } else {
            if (this.hearTicking(warrior)) {
                if (this.countTickingCaptiveMelee(enemyDirections)>0) {
                    this.unbindATickingCaptive(enemyDirections, warrior);
                } else {
                    this.walkTowardsNextObjective(warrior);
                }
            }
            else if (this.countEnemyMelee(enemyDirections)>1) {
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
        //     if (warrior.health() < this.MAX_HEALTH) warrior.rest();
        //     else warrior.walk(warrior.directionOfStairs());
        // }
    }

    restUntilMaxHealth(warrior) {
        if (this.stillEnemiesOrCaptivesAlive(warrior)) {
            warrior.rest();
            this.resting = true;
        } else {
            this.walkTowardsNextObjective(warrior);
        }
    }

    stillEnemiesOrCaptivesAlive(warrior) {
        const alivePeople = warrior.listen().filter(space => space.isEnemy() || space.isCaptive());
        console.log(alivePeople);
        return alivePeople.length > 0
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
        const dir = enemyDirections.find(dir => dir.what === 'enemy').direction;
        this.attack(dir, warrior);
    }

    attack(dir, warrior) {
        const frontalEnemies = warrior.look(dir).filter(space => space.isEnemy()).length;
        if (frontalEnemies >= 2) warrior.detonate(dir);
        else warrior.attack(dir);
    }

    countCaptiveMelee(enemyDirections) {
        let c = 0;
        enemyDirections.forEach(dir => {
            if (dir.what === 'captive') c++;
        });
        return c;
    }

    countTickingCaptiveMelee(enemyDirections) {
        let c = 0;
        enemyDirections.forEach(dir => {
            if (dir.what === 'tickingCaptive') c++;
        });
        return c;
    }

    unbindATickingCaptive(enemyDirections, warrior) {
        warrior.rescue(enemyDirections.find(dir => dir.what === 'tickingCaptive').direction);
    }

    unbindACaptive(enemyDirections, warrior) {
        warrior.rescue(enemyDirections.find(dir => dir.what === 'captive').direction);
    }

    walkTowardsStairs(warrior) {
        warrior.walk(warrior.directionOfStairs());
    }


    /**
     * @todo flat that out
     * @param warrior
     */
    walkTowardsNextObjective(warrior) {
        const whereToGo = this.nextObjective(warrior);
        const move = whereToGo[0];
        const lateralMove = this.rndArrayElement(this.ortogonalDir(move));
        const goal = whereToGo[1];

        const validMove = [
            move,
            lateralMove,
            this.oppositeDir(lateralMove)
        ].find(m => this.canIGo(m, goal, warrior));

        if (validMove) {
            warrior.walk(move);
        }
        else {
            this.rushForward(move, warrior);
        }

    }



    nextObjective(warrior) {
        const spaces = warrior.listen();
        const matchingFun = [
            space => space.isTicking(),
            space => space.isEnemy(),
            space => space.isCaptive()
        ].find(fun => spaces.some(fun));

        if (matchingFun) return [warrior.directionOf(spaces.find(matchingFun)), 'noStairs'];
        else return [warrior.directionOfStairs(), 'stairs'];
    }

    oppositeDir(dir) {
        switch (dir) {
            case 'forward':
                return 'backward';
            case 'backward':
                return 'forward';
            case 'left':
                return 'right';
            case 'right':
                return 'left';
            default:
                return undefined;
        }
    }

    ortogonalDir(dir) {
        const lr = ['left', 'right'];
        const fb = ['forward', 'backward'];
        switch (dir) {
            case 'forward':
                return lr;
            case 'backward':
                return lr;
            case 'left':
                return fb;
            case 'right':
                return fb;
            default:
                return undefined;
        }
    }

    rndArrayElement(items) {
        return items[Math.floor(Math.random()*items.length)]
    }

    canIGo(move, goal, warrior) {
        const truth = ((!warrior.feel(move).isStairs() && warrior.feel(move).isEmpty() && !warrior.feel(move).isWall()) || goal === 'stairs');
        return truth;
    }


    hearTicking(warrior) {
        return warrior.listen().find(space => space.isTicking());
    }

    rushForward(move, warrior) {
        if (warrior.feel(move).isEnemy())
            this.attack(move, warrior);
        else if (warrior.feel().isCaptive())
            warrior.rescue(move);
        else {
            warrior.walk(this.oppositeDir(move));
        }
    }
}

