class Player {
    constructor() {
        this.MAX_HEALT = 20;
        this.CRIT_HEALTH = 6;
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
            else if (warrior.feel(direction).isCaptive()) {
                console.log('found captive');
                if (warrior.feel(direction).isTicking()) {
                    // console.log('found something ticky');
                    return {direction: direction, what: 'tickingCaptive'};
                }
                else {
                    // console.log('captive is not ticking; thats my feeling: ' + warrior.feel(direction).isTicking() + ' ' + warrior.feel(direction).isCaptive().isTicking());
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

    countTickingCaptiveMelee(enemyDirections) {
        let c = 0;
        enemyDirections.forEach(dir => {
            if (dir.what === 'tickingCaptive') c++;
        });
        console.log(c);
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
        if (this.canIGo(whereToGo, warrior))
            warrior.walk(whereToGo[0]);
        else {
            const lateralMove = this.rndArrayElement(this.ortogonalDir(whereToGo[0]));
            if (this.canIGo([lateralMove, whereToGo[1]], warrior)) {
                warrior.walk(lateralMove);
            } else {
                const oppositeLateralMove = this.oppositeDir(lateralMove);
                if (this.canIGo([oppositeLateralMove, whereToGo[1]], warrior)) {
                    warrior.walk(oppositeLateralMove);
                } else {
                    const oppositeMove = this.oppositeDir(whereToGo[0]);
                    if (this.canIGo([oppositeMove, whereToGo[1]], warrior))
                        warrior.walk(oppositeMove);
                }
            }

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

    canIGo(whereToGo, warrior) {
        const truth = ((!warrior.feel(whereToGo[0]).isStairs() && warrior.feel(whereToGo[0]).isEmpty() && !warrior.feel(whereToGo[0]).isWall()) || whereToGo[1] === 'stairs');
        return truth;
    }

    hearTicking(warrior) {
        return warrior.listen().find(space => space.isTicking());
    }



}

