import Phaser from '../lib/phaser.js'

import PowerUp from '../game/PowerUp.js'
//import Ennemy from '../game/Ennemy.js'

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
		this.load.image('hero-jump', 'assets/hero_jump.png')
		this.load.image('powerup', 'assets/powerup.png')
		//this.load.image('ennemy', 'assets/ennemy.png')


		this.cursors = this.input.keyboard.createCursorKeys()
		
		
	}

	create()
	{
		this.add.image(240, 320, 'background')
			.setScrollFactor(1, 0)

		this.ground = this.physics.add.staticGroup()
		this.platforms = this.physics.add.staticGroup()
		this.wall = this.physics.add.staticGroup()
		this.wall2 = this.physics.add.staticGroup()


		this.ground.create(250, 950, 'ground')
		this.wall.create(710,576,'wall')
		this.wall2.create(-210,576,'wall2')

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

		this.anims.create({
			key: 'normal',
			frames: [ { key: 'hero', frame: 7 } ],
			frameRate: 10
		});
		

		this.anims.create({
			key:'left',
			frames: this.anims.generateFrameNumbers('hero', {start: 0, end : 6}),
			frameRate: 5,
			repeat: -1
		})

		this.anims.create({
			key:'right',
			frames: this.anims.generateFrameNumbers('hero', {start: 7, end : 13}),
			frameRate: 5,
			repeat: 1
		})

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
		
		this.physics.add.collider(this.platforms, this.powerups)
		this.physics.add.overlap(this.player, this.powerups, this.PoweringUp, undefined, this)

		//this.ennemy = this.physics.add.group({
			//classType: Ennemy
		//})

		//this.physics.add.collider(this.platforms, this.ennemy)
		//this.physics.add.collider(this.ennemy, this.player, hitEnnemy, undefined, this)

		//this.input.gamepad.once('connected', function (pad) {
			//paddleConnected = true;
			//paddle = pad;
			//});
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
			if (platform.y >= scrollY + 700)
			{
				platform.y = scrollY - Phaser.Math.Between(50,100)
				platform.body.updateFromGameObject()
				//this.addPowerUp(platform)
			}
		})

		const touchingDown = this.player.body.touching.down

		//if (paddleConnected == true)
    	//{
        	//if (paddle.A && player.body.touching.down)
        	//{
        	//player.setVelocityY(-330);
        	//}

        	//else if (paddle.R2 && player.body.touching.down)
        	//{
            	//player.setVelocityX(160);
            	//player.anims.play('right', true);
        	//}

        	//else if (paddle.R2 && !player.body.touching.down)
        	//{
            	//player.setVelocityX(160);
            	//player.anims.play('rightjump', true);
        	//}

        	//else if (paddle.L2 && player.body.touching.down)
        	//{
            	//player.setVelocityX(-160);
            	//player.anims.play('left', true);
        	//}

        	//else if (paddle.L2 && !player.body.touching.down)
        	//{
            	//player.setVelocityX(-160);
            	//player.anims.play('leftjump', true);
        	//}
		//}

		if (this.cursors.up.isDown && touchingDown)
		{
			this.player.setVelocityY(-290)

		}
		

		else if (this.cursors.left.isDown )
		{
			this.player.anims.play('left', true)
			this.player.setVelocityX(-200)
		}
		else if (this.cursors.right.isDown )
		{
			this.player.anims.play('right', true)
			this.player.setVelocityX(200)
			
		}
		else
		{
			this.player.setVelocityX(0)
			this.player.anims.play('normal')
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
		const y = sprite.y - sprite.displayHeight

		/** @type {Phaser.Physics.Arcade.Sprite} */
		const powerup = this.powerups.get(sprite.x, y, 'powerup')

		powerup.setActive(true)
		powerup.setVisible(true)

		this.add.existing(powerup)

		powerup.body.setSize(powerup.width, powerup.height)

		this.physics.world.enable(powerup)

		return powerup
	}

	/**
	 * 
	 * @param {Phaser.Physics.Arcade.Sprite} player 
	 * @param {PowerUp} powerup 
	 */
	PoweringUp(player, powerup)
	{
		this.powerup.killAndHide(powerup)

		this.physics.world.disableBody(powerup.body)

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

	//hitEnnemy(){

	//}

	walljump(){
		const touchingRight = this.player.body.touching.right
		this.player.anims.play('walljumpD')
		if (this.cursors.up.isDown && touchingRight){
			this.player.setVelocityX(-800)
			this.player.setVelocityY(-200)
		}
	}
	walljump2(){
		const touchingLeft = this.player.body.touching.left
		this.player.anims.play('walljumpG')
		if (this.cursors.up.isDown && touchingLeft){
			this.player.setVelocityX(800)
			this.player.setVelocityY(-200)
		}
	}
}