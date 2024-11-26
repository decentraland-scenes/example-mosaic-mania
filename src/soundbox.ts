import { AudioSource, Entity, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { SCENE_CENTER } from "./globals"
import { GameStateData } from "./gameState"
import { gameStateEntity } from "./game"
import { pitchShift } from "./utils"

export class SoundBox {
    soundBox:Entity
    multiSound:Entity[]
    currentId:number = 0
    pitches = [-2, 2, 5, 7, 6]

    constructor(){

        this.multiSound = []
        this.soundBox = engine.addEntity()
        Transform.create(this.soundBox, {
            position: Vector3.create(SCENE_CENTER.x, SCENE_CENTER.y + 2, SCENE_CENTER.z)
        })
       // MeshRenderer.setBox(this.soundBox)

       for(let i=0; i<4; i++){
        let sound = engine.addEntity()
        Transform.create(sound, {
            position: Vector3.create(SCENE_CENTER.x, SCENE_CENTER.y + 2, SCENE_CENTER.z)
        })

        this.multiSound.push(sound)
       }

    }

    playSound(soundUrl:string){
        AudioSource.createOrReplace(this.soundBox,{
            audioClipUrl: soundUrl,
            loop: false,
            playing: GameStateData.get(gameStateEntity).sfxOn
        })
    }

    playMultiSound(soundUrl:string, pitchVariable:boolean){

        AudioSource.createOrReplace(this.multiSound[this.currentId],{
            audioClipUrl: soundUrl,
            loop: false,
            playing: GameStateData.get(gameStateEntity).sfxOn,
            pitch: pitchVariable?pitchShift(1, this.pitches[Math.floor((Math.random()*4))] ) : 1,
        })
        this.currentId +=1
        if(this.currentId >= this.multiSound.length){
            this.currentId = 0
        }
    }
}