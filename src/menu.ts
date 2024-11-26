import { engine, Entity, pointerEventsSystem, Transform } from "@dcl/sdk/ecs";
import { Game, gameStateEntity } from "./game";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import * as utils from "@dcl-sdk/utils"
import { GameStateData } from "./gameState";
import * as ui from "./ui"
import { sceneParentEntity } from "./globals";

const uiAssets = ui.uiAssets

export class MainMenu{
    menuRoot:Entity
    menuWidth:number = 10
    playButton:ui.MenuButton
    exitButton:ui.MenuButton
   // resetButton:ui.MenuButton
    musicButton:ui.MenuButton
    soundsButton:ui.MenuButton
    levelButtons:ui.MenuButton[]
    levelLabel:ui.MenuLabel
   // sublevelRoot:Entity        
    //timer:ui.Timer3D
    //triesCounter:ui.Counter3D
    scoreCounter:ui.Counter3D
    countdown:ui.Timer3D
    boardCenter:Vector3 
    boardTop:Vector3
    //subLevelMarkers:ui.BoxIcon[]
    levelButtonSpacing:number = 0.55
    dummyCounter:ui.Counter3D


    constructor(game:Game){

        const gameState = GameStateData.getMutable(gameStateEntity)


        let menuRow1Height:number = -0.5
        let menuRow2Height:number = -1.8
        let menuRow3Height:number = -2.9
        let buttonScale:number = 2.1
        let levelButtonScale:number = 1.8
        let buttonSpacing:number = 0.64
       
        this.boardCenter = Vector3.create(1, -1.5, -0.3)
        this.boardTop = Vector3.create(0.95, 0.9,-0.05)

        
       // this.subLevelMarkers  = []
        this.levelButtons = []

        this.menuRoot = engine.addEntity()
        Transform.create(this.menuRoot, {
            position: Vector3.create(0,5.5,-7.75),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.create(1,1,1),
            parent:sceneParentEntity
        })

        // this.sublevelRoot = engine.addEntity()
        // Transform.create(this.sublevelRoot,{
        //     position:Vector3.create(-3.15,-0.3 - this.levelButtonSpacing*0, -0.05),
        //     parent:this.menuRoot
        // })

         //PLAY BUTTON
         const startGameButton = this.playButton = new ui.MenuButton({
            position: Vector3.create(0, 1, 5.1),
            rotation: Quaternion.fromEulerDegrees(-33,180,0),
            scale: Vector3.create(1.3, 1.3, 1.3),
            parent: sceneParentEntity
        },
        
        uiAssets.shapes.RECT_RED,
        uiAssets.icons.playText,        
        "PLAY/SIGN UP",
        ()=>{             
            game.newGame()                     
        })
       
        

     

         //EXIT BUTTON
         this.exitButton = new ui.MenuButton({
            position: Vector3.create(2.55,menuRow1Height,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(2.6, 2.6, 2.6),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.RECT_RED, 
        uiAssets.icons.exitText,        
        "EXIT GAME",
        ()=>{            
            //setCurrentPlayer() 
            game.exitPlayer()   

        })

         //SOUND BUTTON
         this.soundsButton = new ui.MenuButton({
            position: Vector3.create(2.2,menuRow1Height-0.75,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(buttonScale, buttonScale, buttonScale),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.SQUARE_RED,
        uiAssets.icons.sound,        
        "TOGGLE SOUNDS",
        ()=>{            
            game.toggleSFX()     
        })

         //MUSIC BUTTON
         this.musicButton = new ui.MenuButton({
            position: Vector3.create(2.2+ buttonSpacing,menuRow1Height-0.75,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(buttonScale, buttonScale, buttonScale),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.SQUARE_RED,
        uiAssets.icons.music,        
        "TOGGLE MUSIC",
        ()=>{            
           game.musicPlayer.toggleMusic()
        })        
        

        
        //LEVEL BUTTONS
        for(let i=0; i< 9; i++){
            let levelButton =  new ui.MenuButton({
                position: Vector3.create(-2.4,-3 + this.levelButtonSpacing*i, 0),
                rotation: Quaternion.fromEulerDegrees(-90,0,0),
                scale: Vector3.create(levelButtonScale, levelButtonScale, levelButtonScale),
                parent: this.menuRoot
            },
            uiAssets.shapes.SQUARE_GREEN,
            uiAssets.numbers[i+1],
            (""),
            ()=>{          
                // const gameState = GameStateData.getMutable(gameStateEntity)
                // gameState.currentLevel = i 
                // game.startLevel(i)
                //this.map.setLevel(levelData[0].linesX, levelData[0].linesZ,levelData[0].mines)            
            })  
            if(i != 0){
                levelButton.disable()
            }      
            this.levelButtons.push(levelButton)

            
        }      

        // LEVEL LABEL
        this.levelLabel = new ui.MenuLabel({
            position: Vector3.create(-2.4,2.2,-0.05),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(5,5,5),
            parent: this.menuRoot
        }, 
        uiAssets.icons.levelText)

        
        // SCORE COUNTER
        this.scoreCounter = new ui.Counter3D({
            position: Vector3.create(1,3,-0.05),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.create(0.38,0.38, 0.38),
            parent: this.menuRoot
        },
        6,
        1.1,
        true, 
        600000,
        "left"
        )

        this.scoreCounter.show()
        this.scoreCounter.setNumber(0)

          // DUMMY COUNTER TO PRELOAD NUMBER ASSETS
          this.dummyCounter = new ui.Counter3D({
            position: Vector3.create(8,-2,8),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.create(0.38,0.38, 0.38),            
        },
        10,
        1.1,
        true, 
        700000,
        "center"
        )

        this.dummyCounter.show()
        this.dummyCounter.setNumber(1234567890)

        // //TIMER
        // this.timer = new ui.Timer3D({
        //     parent:this.menuRoot,
        //     position: Vector3.create(0.25, 0.9,-0.05),
        //     rotation: Quaternion.fromEulerDegrees(0,180,0),
        //     scale:Vector3.create(0.5, 0.5, 0.5)
        // },
        //  1,
        //  1.1,
        //  true,
        //  1
                 
        // )
        //COUNTDOWN
        this.countdown = new ui.Timer3D({
            parent:this.menuRoot,
            position: Vector3.create(0.0, -1.5,-0.4),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale:Vector3.create(1, 1, 1)
        },
         1,
         1.1,
         false,
         2        
        )

    }    

    moveScoreToCenter(){
        let transform = Transform.getMutable(this.scoreCounter.root)

        utils.tweens.startTranslation(
            this.scoreCounter.root,
            transform.position,
            Vector3.create(1,-1,-1.8),
            0.5,
            utils.InterpolationType.EASEOUTQUAD
        )
    }
    moveScoreToTop(){
        let transform = Transform.getMutable(this.scoreCounter.root)

        utils.tweens.startTranslation(
            this.scoreCounter.root,
            transform.position,
            Vector3.create(1,3,-0.05),
            0.5,
            utils.InterpolationType.EASEOUTQUAD
        )
    }


    resetLevelButtons(){
        for(let button of this.levelButtons){            
            button.disable()
        }
        this.levelButtons[0].enable()

    }
}

