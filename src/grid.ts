
import { Entity, GltfContainer, Transform,TransformTypeWithOptionals,VisibilityComponent,engine } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from "@dcl-sdk/utils"
import { Cell, checkWin, createGridCell,  resetGridCell, markCell, } from './cell'
import { SoundBox } from './soundbox'
import { triggerSceneEmote } from '~system/RestrictedActions'
import { Game , gameStateEntity} from './game'
import { GameStateData} from './gameState'
import { loseSound, winSound } from './globals'
import { Trail } from './streakTrails'
import * as ui from "./ui"
//import { LevelData } from './levelData'



export class GridMap {
    root:Entity
    backgroundPlane:Entity    
    gridLnX:number
    gridLnY:number
    lowerCornerX:number
    lowerCornerY:number
    maxCellCount:number = 20
    markedCells:number = 5  
    sideLengthX:number
    sideLengthY:number
    stepX:number 
    stepY:number 
    areCellsSetUp:boolean = false    
    soundBox:SoundBox
    private levelWon:boolean = false
    clickCount:number = 0
    winAnimHandler:ui.WinAnimationHandler
    trail:Trail 
    game:Game  

    constructor(transform:TransformTypeWithOptionals, _sideLengthX:number, _sideLengthZ:number, _rotation:Quaternion, game:Game){         

        this.game = game
        
        this.root = engine.addEntity()
        Transform.create(this.root,transform)  
       
        this.trail = new Trail(this.root)       
      
        this.sideLengthX = _sideLengthX 
        this.sideLengthY = _sideLengthZ
        this.gridLnX = 10
        this.gridLnY = 20
        this.stepX = this.sideLengthX/this.gridLnX
        this.stepY = this.sideLengthY/this.gridLnY
        this.lowerCornerX = -this.sideLengthX/2
        this.lowerCornerY = -this.sideLengthY/2
        

        this.backgroundPlane = engine.addEntity()
        Transform.create(this.backgroundPlane, {
            position: Vector3.create(-this.sideLengthX/2 + this.stepX/2,0, -this.sideLengthY/2 + this.stepX),
            rotation: Quaternion.fromEulerDegrees(0,0,0),           
            parent: this.root})
        GltfContainer.create(this.backgroundPlane, {src: "models/grid_bg.glb"})
        
        
        this.winAnimHandler = new ui.WinAnimationHandler(Vector3.create(14,3.8,0))
        //this.avatarAnimator = new AvatarAnimHandler()            

        this.soundBox = new SoundBox()

        this.initEntityPool()        

    }

    

    showTrail(topY:number, currentX:number, currentY:number, currentSchema:number[][], currentColor:number){
   
        let width =  currentSchema[0].length * this.stepX
        let topPos = Vector3.create(this.lowerCornerX + currentX *this.stepX + width/2, 0.05,  this.lowerCornerY + topY * this.stepY )
        let bottomPos = Vector3.create(this.lowerCornerX + (currentX *this.stepX) + width/2,  0.05 , this.lowerCornerY + currentY*this.stepY)

        this.trail.drawTrails(topPos,bottomPos, width, currentColor )
    }

    getCell(x:number, z:number):Entity{
       return  GameStateData.get(gameStateEntity).cells[x][z]
    }   

    
    initEntityPool(){
        
        this.lowerCornerX = -this.sideLengthX/2
        this.lowerCornerY = -this.sideLengthY/2

        let scaleX = this.sideLengthX/this.gridLnX *0.99
        let scaleY = this.sideLengthY/this.gridLnY *0.99
        const gameStateData = GameStateData.getMutable(gameStateEntity)

        for(let y=0; y< this.gridLnY; y++){
            let newLine:Entity[] = []
            for(let x=0; x< this.gridLnX;x++){

                let cell = createGridCell(
                    y*this.gridLnX +x,
                    {
                        position: Vector3.create( this.lowerCornerX + this.stepX/2 + x*this.stepX, -10, this.lowerCornerY + this.stepY/2 + y*this.stepY -20),
                        scale: Vector3.create(scaleX, scaleY, scaleX ),     
                        rotation:Quaternion.fromEulerDegrees(0,0,0)           
                    },                
                    x,
                    y,
                    this.root,
                    this.game.isMultiplayer                

            ) 
            newLine.push(cell)    
            }
            
            gameStateData.cells.push(newLine)           
            
        }
    }
    
    initGrid(){
        this.lowerCornerX = -this.sideLengthX/2
        this.lowerCornerY = -this.sideLengthY/2

        

        let scaleX = this.sideLengthX/this.gridLnX *0.98
        let scaleZ = this.sideLengthY/this.gridLnY *0.98

        this.stepX = this.sideLengthX/this.gridLnX
        this.stepY = this.sideLengthX/this.gridLnX

        //rectangle level moves up a bit
        if(this.gridLnX != this.gridLnY){
            this.lowerCornerY +=  this.stepY/2
        }

        const gameStateData = GameStateData.getMutable(gameStateEntity)
     

        for(let y=0; y< this.gridLnY; y++){           
            for(let x=0; x< this.gridLnX;x++){
              
                let cell = gameStateData.cells[y][x]
                const cellTransform = Transform.getMutable(cell)
              
                let cellData = Cell.getMutable(cell)
                VisibilityComponent.getMutable(cell).visible = true
                cellData.active = true
             
                cellTransform.position =  Vector3.create( this.lowerCornerX + this.stepX/2 + x*this.stepX,0.0, this.lowerCornerY + this.stepY/2 + y*this.stepY )               
                cellTransform.scale =  Vector3.create(scaleX, scaleZ, scaleX)  

                cellData.originalScale = Vector3.create(scaleX, scaleZ, scaleX)

            }            
        }

            
        

    } 
    isLevelComplete():boolean{
        return this.levelWon
    }

    winGame(soundOn:boolean){
        console.log("GAME WON")
        
        if(soundOn){
            this.soundBox.playSound(winSound)  
        }
        this.winAnimHandler.playWinAnimation()
        triggerSceneEmote({ src: 'assets/scene/Pose_Win.glb', loop: false })
        this.levelWon = true 

        utils.timers.setTimeout(()=>{           
            this.winAnimHandler.hide()             
        }, 3000)
    }

    loseGame(soundOn:boolean){
        console.log("GAME LOST") 
        if(soundOn){
            this.soundBox.playSound(loseSound)  
        }
             
    }

    resetGrid(){
        //RESTART CURRENT LEVEL       
        this.setLevel()     
    }


    deactivateAllCells(){
        const gameStateData = GameStateData.getMutable(gameStateEntity)

        for(let i=0; i < gameStateData.cells.length; i++){
            for(let j=0; j < gameStateData.cells[i].length; j++){

               Cell.getMutable(gameStateData.cells[i][j]).active = false
               VisibilityComponent.getMutable(gameStateData.cells[i][j]).visible = false
               resetGridCell(gameStateData.cells[i][j], i, j)
            }
        }
    }


    setLevel(){

        const gameStateData = GameStateData.getMutable(gameStateEntity)

        this.levelWon = false
        this.areCellsSetUp = false       
            
        this.gridLnX =  10
        this.gridLnY = 20
        this.stepX = this.sideLengthX/this.gridLnX
        this.stepY = this.sideLengthY/this.gridLnY
        
       
        this.deactivateAllCells()
        this.initGrid()
        
        gameStateData.roundTime = 30      
        gameStateData.elapsedTime = 0
    }   
}