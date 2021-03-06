import Phaser from '../lib/phaser.js'

export default class PowerUp extends Phaser.Physics.Arcade.Sprite
{
	/**
	 * @param {Phaser.Scene} scene 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} texture 
	 */
	constructor(scene, x, y, texture = 'powerup')
	{
		super(scene, x, y, texture)

	}
}
