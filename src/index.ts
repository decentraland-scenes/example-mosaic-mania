import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Game, gameStateEntity } from './game'
import playersApi, { getPlayer } from '@dcl/sdk/players'
import { addEnvironment } from './environment'
import { GameStateData } from './gameState'
import { addInstructions } from './instructions'
import { startTweenSystem } from './tweenSystem'
import { addHideArea, freeCamera, unlockPlayer } from './lockPlayer'
import { sceneParentEntity } from './globals'

export function main() {

  let game = new Game(false)
 
  addEnvironment(sceneParentEntity)
  addInstructions()
  addHideArea()
  startTweenSystem() 
  
}


