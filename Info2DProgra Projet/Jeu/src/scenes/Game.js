import Phaser from '../lib/phaser.js'

import PowerUp from '../game/PowerUp.js'
import Ennemy from '../game/Ennemy.js'

export default class Game extends Phaser.Scene
{
	/** @type {Phaser.Physics.Arcade.StaticGroup} */
	platforms

	/** @type {Phaser.Physics.Arcade.Sprite} */
	player

	/** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
	cursors

	/** @type {Phaser.Physics.Arcade.Group} */
	powerups

	/** @type {Phaser.Physics.Arcade.Group} */
	ennemies


	constructor()
	{
		super('game')
	}

	

	preload()
	{
		this.load.image('background', 'assets/bg.png')
		this.load.image('wall', 'assets/wall.png')
		this.load.image('wall2', 'assets/wall2.png')
		this.load.image('platform', 'assets/platform.png')
		this.load.image('ground', 'assets/ground.png')
		//this.load.image('ice_platform', 'assets/iceplatform.png')
		this.load.spritesheet('hero', 'assets/hero.png', {frameWidth: 60, frameHeight: 76})
		this.load.image('powerup', 'assets/powerup.png')
		this.load.image('ennemy', 'assets/Ennemi.png')
		this.load.image('coeur1', 'assets/coeur.png')
		this.load.image('coeur2', 'assets/coeur.png')
		this.load.image('coeur3', 'assets/coeur.png')


		this.cursors = this.input.keyboard.createCursorKeys()
		
		
	}

	create()
	{
		this.add.image(250, 285, 'background')
			.setScrollFactor(1, 0)

		this.ground = this.physics.add.staticGroup()
		this.platforms = this.physics.add.staticGroup()
		this.wall = this.physics.add.staticGroup()
		this.wall2 = this.physics.add.staticGroup()


		
		this.wall.create(740,576,'wall')
		this.wall2.create(-240,576,'wall2')
		this.ground.create(250, 950, 'ground')

		this.coeur1 = this.add.image(-230,70,'coeur1').setScrollFactor(1,0)
		this.coeur2 = this.add.image(-170,70,'coeur2').setScrollFactor(1,0)
		this.coeur3 = this.add.image(-110,70,'coeur3').setScrollFactor(1,0)

		// Création de 5 plateformes par mouvement de caméra
		for (let i = 0; i < 8; ++i)
		{
			const x = Phaser.Math.Between(0, 600)
			const y = 100 * i
	
			/** @type {Phaser.Physics.Arcade.Sprite} */
			const platform = this.platforms.create(x, y, 'platform')
	
			/** @type {Phaser.Physics.Arcade.StaticBody} */
			const body = platform.body
			body.updateFromGameObject()
		}

		this.player = this.physics.add.sprite(250, 750, 'hero')
		this.life = 3

		this.anims.create({
			key: 'normal',
			frames: [ { key: 'hero', frame: 9 } ],
			frameRate: 10
		});
		
		this.anims.create({
			key:'leftjump',
			frames: this.anims.generateFrameNumbers('hero', {start: 0, end : 1}),
			frameRate: 1,
			repeat: -1
		})

		this.anims.create({
			key:'left',
			frames: this.anims.generateFrameNumbers('hero', {start: 2, end : 8}),
			frameRate: 5,
			repeat: -1
		})
		

		this.anims.create({
			key:'right',
			frames: this.anims.generateFrameNumbers('hero', {start: 9, end : 15}),
			frameRate: 5,
			repeat: 1
		})
		this.anims.create({
			key:'rightjump',
			frames: this.anims.generateFrameNumbers('hero', {start: 16, end : 17}),
			frameRate: 1,
			repeat: 1
		})

		this.anims.create({
			key: 'walljumpG',
			frames: [ { key: 'hero', frame: 18 } ],
			frameRate: 10
		});

		this.anims.create({
			key: 'walljumpD',
			frames: [ { key: 'hero', frame: 19 } ],
			frameRate: 10
		});

		this.physics.add.collider(this.ground, this.player)
		this.physics.add.collider(this.platforms, this.player)
		this.physics.add.collider(this.wall, this.player,this.walljump,undefined,this)
		this.physics.add.collider(this.wall2, this.player,this.walljump2,undefined,this)
		
		this.player.body.checkCollision.up = false
		//pour le debug
		//this.player.body.checkCollision.left = false
		//this.player.body.checkCollision.right = false

		this.cameras.main.startFollow(this.player)
		this.cameras.main.setDeadzone(this.scale.width * 1.5)

		this.powerups = this.physics.add.group({
			classType: PowerUp
		})

		this.DoubleJump = false
		
		this.physics.add.collider(this.platforms, this.powerups)
		this.physics.add.overlap(this.player, this.powerups, this.PoweringUp, undefined, this)

		this.ennemies = this.physics.add.group({
			classType: Ennemy
		})

		this.physics.add.collider(this.wall, this.ennemies)
		this.physics.add.collider(this.wall2, this.ennemies)
		this.physics.add.collider(this.ennemies, this.player, this.hitEnnemy, undefined, this)

		this.paddleConnected=false;

		this.input.gamepad.once('connected', function (pad) {
			this.paddleConnected = true;
			paddle = pad;
			});
	}

	update(t, dt)
	{
		if (!this.player)
		{
			return
		}

		this.platforms.children.iterate(child => {
			/** @type {Phaser.Physics.Arcade.Sprite} */
			const platform = child
			const scrollY = this.cameras.main.scrollY
			if (platform.y >= scrollY + 700){
			this.addPowerUp(this.player)	
			}
			if (platform.y >= scrollY + 700)
			{
				platform.y = scrollY - Phaser.Math.Between(50,100)
				platform.body.updateFromGameObject()
				this.addEnnemies(platform)
			}
		})

		const touchingDown = this.player.body.touching.down

		if (this.paddleConnected == true)
    	{
        	if (paddle.A && touchingDown)
        	{
        		this.player.setVelocityY(-290);
				this.player.anims.play('rightjump', true);
        	}
			else if (paddle.A && !touchingDown && this.DoubleJump)
			{
				this.player.setVelocityY(-190)
				this.player.anims.play('rightjump', true)
				this.DoubleJump = false
			}

        	else if (paddle.R2 && touchingDown)
        	{
            	this.player.setVelocityX(160);
            	this.player.anims.play('right', true);
        	}

        	else if (paddle.R2 && !touchingDown)
        	{
            	this.player.setVelocityX(160);
            	this.player.anims.play('rightjump', true);
        	}

        	else if (paddle.L2 && touchingDown)
        	{
            	this.player.setVelocityX(-160);
            	this.player.anims.play('left', true);
        	}

        	else if (paddle.L2 && !touchingDown)
        	{
            	this.player.setVelocityX(-160);
            	this.player.anims.play('leftjump', true);
        	}
		}

		else if (this.cursors.up.isDown && touchingDown)
		{
			this.player.setVelocityY(-290)
			this.player.anims.play('rightjump', true);
		}

		else if (this.cursors.up.isDown && !touchingDown && this.DoubleJump)
		{
			this.player.setVelocityY(-250)
			this.player.anims.play('rightjump', true)
			this.DoubleJump = false
		}

		else if (this.cursors.left.isDown && touchingDown)
		{
			this.player.anims.play('left', true)
			this.player.setVelocityX(-200)
		}
		else if (this.cursors.left.isDown && !touchingDown)
		{
			this.player.anims.play('leftjump', true)
			this.player.setVelocityX(-200)
		}

		else if (this.cursors.right.isDown && touchingDown)
		{
			this.player.anims.play('right', true)
			this.player.setVelocityX(200)	
		}
		else if (this.cursors.right.isDown && !touchingDown)
		{
			this.player.anims.play('rightjump', true)
			this.player.setVelocityX(200)	
		}

		else
		{
			this.player.setVelocityX(0)
			if (touchingDown){
				this.player.anims.play('normal')
			}
			
		}


		const bottomPlatform = this.findBottomMostPlatform()
		if (this.player.y > bottomPlatform.y + 200)
		{
			this.scene.start('game-over')
		}
	}

	/**
	 * 
	 * @param {Phaser.GameObjects.Sprite} sprite 
	 */
	addPowerUp(sprite)
	{

		const y = sprite.y - 300

		/** @type {Phaser.Physics.Arcade.Sprite} */
		const powerup = this.powerups.get(sprite.x, y, 'powerup')

		powerup.setActive(true)
		powerup.setVisible(true)

		this.add.existing(powerup)

		powerup.body.setSize(powerup.width, powerup.height)

		this.physics.world.enable(powerup)

		return powerup
	}

	addEnnemies(sprite){
		const y = sprite.y - sprite.displayHeight

		/** @type {Phaser.Physics.Arcade.Sprite} */
		const ennemy = this.ennemies.get(sprite.x, y, 'ennemy')

		ennemy.setActive(true)
		ennemy.setVisible(true)

		this.add.existing(ennemy)

		ennemy.body.setSize(ennemy.width, ennemy.height)

		this.physics.world.enable(ennemy)

		return ennemy
	}

	/**
	 * 
	 * @param {Phaser.Physics.Arcade.Sprite} player 
	 * @param {PowerUp} powerup 
	 */
	PoweringUp(player, powerup)
	{
		this.powerups.killAndHide(powerup)

		this.physics.world.disableBody(powerup.body)

		this.DoubleJump = true
	}

	findBottomMostPlatform()
	{
		const platforms = this.platforms.getChildren()
		let bottomPlatform = platforms[0]

		for (let i = 0; i < platforms.length; ++i)
		{
			const platform = platforms[i]

			// Supprime les plate-formes 
			if (platform.y < bottomPlatform.y)
			{
				continue
			}

			bottomPlatform = platform
		}

		return bottomPlatform
	}
	/**
	 * 
	 * @param {Phaser.Physics.Arcade.Sprite} player 
	 * @param {Ennemy} ennemy 
	 */
	hitEnnemy(player, ennemy)
	{
		this.ennemies.killAndHide(ennemy)
		this.physics.world.disableBody(ennemy.body)
		this.life -= 1
		if (this.life == 2){
			this.coeur3.destroy()
		}
		if (this.life == 1){
			this.coeur2.destroy()
		}
		if (this.life == 0){
			this.scene.start('game-over')
		}
	}

	walljump(){
		const touchingRight = this.player.body.touching.right
		this.player.anims.play('walljumpD')
		if (this.cursors.left.isDown && touchingRight){
			this.player.setVelocityX(-800)
			this.player.setVelocityY(-250)
		}
	}
	walljump2(){
		const touchingLeft = this.player.body.touching.left
		this.player.anims.play('walljumpG')
		if (this.cursors.right.isDown && touchingLeft){
			this.player.setVelocityX(800)
			this.player.setVelocityY(-250)
		}
	}
}