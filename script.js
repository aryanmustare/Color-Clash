(function(win) {

    var CCG = {
        init: function() {
            this.canvas = document.getElementById("gameCanvas");
            this.canvas.width = this.canvas.width;
            this.canvas.height = this.canvas.height;
            this.ctx = this.canvas.getContext("2d");
            this.bgColor = "rgba(20,20,20,.7)";
            this.pBullets = [];
            this.eBullets = [];
            this.activeEnemies = [];
            this.explosions = [];
            this.bulletCount = 0;
            this.eBulletCount = 0;
            this.activeECount = 0;
            this.explosionCount = 0;
            this.maxExplosions = 10;
            this.maxEnemies = 6;
            this.currentEnemies = 0;
            this.frameCount = 0;
            this.maxLives = 3;
            this.currentLives = 0;
            this.bindEvents();
            this.player = new Player();
            this.score = 0;
            this.paused = false;
            this.shooting = false;
            this.singleShot = false;
            this.gameOver = false;
            this.requestAnimFrame = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame;
            for (var i = 0; i < this.maxEnemies; i++) {
                new Enemy();
                this.currentEnemies++;
            }
            this.invincibility(2000);
            this.loop();
        },

        bindEvents: function() {
            win.addEventListener("keydown", this.onKeyDown);
            win.addEventListener("keyup", this.onKeyUp);
            win.addEventListener("keypress", this.onKeyPress);
            this.canvas.addEventListener("click", this.onCanvasClick);
        },

        onCanvasClick: function() {
            if (!CCG.paused) {
                CCG.pause();
            } else {
                if (CCG.gameOver) {
                    CCG.init();
                } else {
                    CCG.resume();
                    CCG.loop();
                    CCG.invincibility(1000);
                }
            }
        },

        onKeyPress: function(e) {
            if (e.keyCode === 32) {
                if (!CCG.player.invincible && !CCG.singleShot) {
                    CCG.player.fire();
                    CCG.singleShot = true;
                }
                if (CCG.gameOver) {
                    CCG.init();
                }
                e.preventDefault();
            }
        },

        onKeyUp: function(e) {
            if (e.keyCode === 32) {
                CCG.shooting = false;
                CCG.singleShot = false;
                e.preventDefault();
            }
            if (e.keyCode === 37 || e.keyCode === 65) {
                CCG.player.moveLeft = false;
            }
            if (e.keyCode === 39 || e.keyCode === 68) {
                CCG.player.moveRight = false;
            }
        },

        onKeyDown: function(e) {
            if (e.keyCode === 32) {
                CCG.shooting = true;
            }
            if (e.keyCode === 37 || e.keyCode === 65) {
                CCG.player.moveLeft = true;
            }
            if (e.keyCode === 39 || e.keyCode === 68) {
                CCG.player.moveRight = true;
            }
        },

        randVal: function(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },

        invincibility: function(duration) {
            this.player.invincible = true;
            setTimeout(function() {
                CCG.player.invincible = false;
            }, duration);
        },

        checkColl: function(a, b) {
            return !(
                ((a.y + a.height) < (b.y)) ||
                (a.y > (b.y + b.height)) ||
                ((a.x + a.width) < b.x) ||
                (a.x > (b.x + b.width))
            );
        },

        clear: function() {
            this.ctx.fillStyle = CCG.bgColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        pause: function() {
            this.paused = true;
        },

        resume: function() {
            this.paused = false;
        },

        end: function() {
            this.gameOver = true;
            this.clear();
            var endMsg = "Game Over";
            var scoreMsg = "Score: " + CCG.score;
            var restartMsg = "Click or press Spacebar to Play Again";
            this.pause();
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 30px Lato, sans-serif";
            this.ctx.fillText(endMsg, this.canvas.width / 2 - this.ctx.measureText(endMsg).width / 2, this.canvas.height / 2 - 50);
            this.ctx.fillText(scoreMsg, this.canvas.width / 2 - this.ctx.measureText(scoreMsg).width / 2, this.canvas.height / 2 - 5);
            this.ctx.font = "bold 16px Lato, sans-serif";
            this.ctx.fillText(restartMsg, this.canvas.width / 2 - this.ctx.measureText(restartMsg).width / 2, this.canvas.height / 2 + 30);
        },

        updateScore: function() {
            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Lato, sans-serif";
            this.ctx.fillText("Score: " + this.score, 8, 20);
            this.ctx.fillText("Lives: " + (this.maxLives - this.currentLives), 8, 40);
        },

        loop: function() {
            if (!CCG.paused) {
                CCG.clear();
                for (var i in CCG.activeEnemies) {
                    var enemy = CCG.activeEnemies[i];
                    enemy.render();
                    enemy.update();
                    if (CCG.frameCount % enemy.shootFreq === 0) {
                        enemy.shoot();
                    }
                }
                for (var x in CCG.eBullets) {
                    CCG.eBullets[x].render();
                    CCG.eBullets[x].update();
                }
                for (var z in CCG.pBullets) {
                    CCG.pBullets[z].render();
                    CCG.pBullets[z].update();
                }
                if (CCG.player.invincible) {
                    if (CCG.frameCount % 20 === 0) {
                        CCG.player.render();
                    }
                } else {
                    CCG.player.render();
                }

                for (var i in CCG.explosions) {
                    CCG.explosions[i].render();
                }
                CCG.player.update();
                CCG.updateScore();
                CCG.frameCount = CCG.requestAnimFrame.call(win, CCG.loop);
            }
        }
    };

    var Player = function() {
        this.width = 60;
        this.height = 20;
        this.x = CCG.canvas.width / 2 - this.width / 2;
        this.y = CCG.canvas.height - this.height;
        this.moveLeft = false;
        this.moveRight = false;
        this.speed = 8;
        this.invincible = false;
        this.color = "white";
    };

    Player.prototype.die = function() {
        if (CCG.currentLives < CCG.maxLives) {
            CCG.invincibility(2000);
            CCG.currentLives++;
        } else {
            CCG.pause();
            CCG.end();
        }
    };

    Player.prototype.render = function() {
        CCG.ctx.fillStyle = this.color;
        CCG.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    Player.prototype.update = function() {
        if (this.moveLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.moveRight && this.x + this.width < CCG.canvas.width) {
            this.x += this.speed;
        }
        if (CCG.shooting && CCG.frameCount % 10 === 0) {
            this.fire();
        }
        for (var i in CCG.eBullets) {
            var bullet = CCG.eBullets[i];
            if (CCG.checkColl(bullet, this) && !CCG.player.invincible) {
                this.die();
                delete CCG.eBullets[i];
            }
        }
    };

    Player.prototype.fire = function() {
        CCG.pBullets[CCG.bulletCount] = new Bullet(this.x + this.width / 2);
        CCG.bulletCount++;
    };

    var Bullet = function(x) {
        this.width = 8;
        this.height = 20;
        this.x = x;
        this.y = CCG.canvas.height - 10;
        this.velY = 8;
        this.index = CCG.bulletCount;
        this.active = true;
        this.color = "white";
    };

    Bullet.prototype.render = function() {
        CCG.ctx.fillStyle = this.color;
        CCG.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    Bullet.prototype.update = function() {
        this.y -= this.velY;
        if (this.y < 0) {
            delete CCG.pBullets[this.index];
        }
    };

    var Enemy = function() {
        this.width = 60;
        this.height = 20;
        this.x = CCG.randVal(0, (CCG.canvas.width - this.width));
        this.y = CCG.randVal(10, 40);
        this.velY = CCG.randVal(1, 3) * 0.1;
        this.index = CCG.activeECount;
        CCG.activeEnemies[CCG.activeECount] = this;
        CCG.activeECount++;
        this.speed = CCG.randVal(2, 3);
        this.shootFreq = CCG.randVal(30, 80);
        this.moveLeft = Math.random() < 0.5;
        this.color = "hsl(" + CCG.randVal(0, 360) + ", 60%, 50%)";
    };

    Enemy.prototype.render = function() {
        CCG.ctx.fillStyle = this.color;
        CCG.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    Enemy.prototype.update = function() {
        if (this.moveLeft) {
            if (this.x > 0) {
                this.x -= this.speed;
                this.y += this.velY;
            } else {
                this.moveLeft = false;
            }
        } else {
            if (this.x + this.width < CCG.canvas.width) {
                this.x += this.speed;
                this.y += this.velY;
            } else {
                this.moveLeft = true;
            }
        }

        for (var i in CCG.pBullets) {
            var bullet = CCG.pBullets[i];
            if (CCG.checkColl(bullet, this)) {
                this.destroy();
                delete CCG.pBullets[i];
            }
        }
    };

    Enemy.prototype.destroy = function() {
        this.explode();
        delete CCG.activeEnemies[this.index];
        CCG.score += 15;
        CCG.currentEnemies = CCG.currentEnemies > 1 ? CCG.currentEnemies - 1 : 0;
        if (CCG.currentEnemies < CCG.maxEnemies) {
            CCG.currentEnemies++;
            setTimeout(function() {
                new Enemy();
            }, 2000);
        }
    };

    Enemy.prototype.explode = function() {
        for (var i = 0; i < CCG.maxExplosions; i++) {
            new Explosion(this.x + this.width / 2, this.y, this.color);
        }
    };

    Enemy.prototype.shoot = function() {
        new EnemyBullet(this.x + this.width / 2, this.y, this.color);
    };

    var EnemyBullet = function(x, y, color) {
        this.width = 8;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.velY = 6;
        this.color = color;
        this.index = CCG.eBulletCount;
        CCG.eBullets[CCG.eBulletCount] = this;
        CCG.eBulletCount++;
    };

    EnemyBullet.prototype.render = function() {
        CCG.ctx.fillStyle = this.color;
        CCG.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    EnemyBullet.prototype.update = function() {
        this.y += this.velY;
        if (this.y > CCG.canvas.height) {
            delete CCG.eBullets[this.index];
        }
    };

    var Explosion = function(x, y, color) {
        this.x = x;
        this.y = y;
        this.velX = CCG.randVal(-5, 5);
        this.velY = CCG.randVal(-5, 5);
        this.color = color || "orange";
        CCG.explosions[CCG.explosionCount] = this;
        this.id = CCG.explosionCount;
        CCG.explosionCount++;
        this.lifetime = 0;
        this.gravity = 0.05;
        this.size = 40;
        this.maxLifetime = 100;
    };
    
    Explosion.prototype.render = function() {
        this.x += this.velX;
        this.y += this.velY;
        this.velY += this.gravity;
        this.size *= 0.89;
        
        
        CCG.ctx.fillStyle = this.color;
        CCG.ctx.fillRect(this.x, this.y, this.size, this.size);
        
        
        CCG.ctx.shadowColor = this.color;
        CCG.ctx.shadowBlur = 20;
        
        this.lifetime++;
        if (this.lifetime >= this.maxLifetime) {
            delete CCG.explosions[this.id];
        }
    };

    CCG.init();

}(window));