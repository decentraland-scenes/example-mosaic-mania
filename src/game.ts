import { engine, Entity, InputAction, InputModifier, inputSystem, PointerEventType, Transform, MainCamera } from "@dcl/sdk/ecs";
import { GAME_STATE, GameStateData } from "./gameState";
import { GridMap } from "./grid";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { movePlayerTo, triggerEmote } from "~system/RestrictedActions";
import { Cell, clearCell, clearLanded, copyCell, markCell, resetSize, setColor, setLanded, ShrinkCell, startShrinking } from "./cell";
import { _COLORS, _TETROMINOS, sceneParentEntity } from "./globals";
import { blockCamera, freeCamera, initCamera, lockPlayer, unlockPlayer } from "./lockPlayer";
import { NextBlockDisplay } from "./nextBlockDisplay";
import { SoundBox } from "./soundbox";
import { MusicPlayer } from "./music";
import { MainMenu } from "./menu";
import * as utils from "@dcl-sdk/utils"
import { shuffle } from "./utils";
import { ClickBlocker } from "./clickBlocker";
import * as ui from "./ui"
// import { SCOREBOARD_VALUE_TYPE } from "@dcl-sdk/mini-games/src/ui";




export let gameStateEntity:Entity

export class Game {
    // private readonly _canvas : HTMLCanvasElement;
    // private readonly _ctx : CanvasRenderingContext2D;

    grid:GridMap    
    nextBlockDisplay: NextBlockDisplay
    soundBox:SoundBox
    musicPlayer:MusicPlayer
    mainMenu:MainMenu    
    clickBlocker:ClickBlocker

    leftButtonHeld:boolean = false
    leftButtonTimer:number = 0
    leftButtonDelay:number = 0.32

    rightButtonHeld:boolean = false
    rightButtonTimer:number = 0
    rightButtonDelay:number = 0.32
  
    private readonly _DEFAULT_SPEED = 2.1;
    private readonly _WIDTH = 10;
    private readonly _HEIGHT = 20;    
    private readonly _NEXT_BLOCKS = 4;
  
    //private _landed:number[][] = [];
    private _currentX = 0;
    private _currentY = 20;
    private _currentBlockIndex  =0;
    private _nextBlockIndexes:number[] = [];
    public _currentSchema = [[0,0,0],[0,0,0]];   
    //private _score = 0;
    levelLimits = [5,15,25,35,45,55,65,75]
    linesCleared:number = 0
    elapsedTime:number =0
    clearTime:number = 0
    clearDuration:number = 0.4
    showScoreTime:number = 0
    linesToBeCleared:number[] = []
    isMultiplayer: boolean = true

  
    public constructor(isMultiplayer:boolean) {
      //this._canvas = document.querySelector(selector) as HTMLCanvasElement;
     // this._ctx = this._canvas.getContext('2d');
  
    
     this.isMultiplayer = isMultiplayer

     gameStateEntity = engine.addEntity()

      GameStateData.createOrReplace(gameStateEntity, {
          cells: [],           
          roundTime: 30,            
          sfxOn:true,
          currentLevel:0,           
          elapsedTime: 0,
          maxLevel:6,
          currentSpeed: this._DEFAULT_SPEED,
          state:GAME_STATE.IDLE
          
  
  
      })

      this.grid = new GridMap(
        {
          position: Vector3.create(0, 3.2, -7.65),
          rotation:Quaternion.fromEulerDegrees(-90,180,0),          
          parent:sceneParentEntity
      },
        3,
        3,                         
        Quaternion.fromEulerDegrees(0,180,0),
        this)

      // virutal camera
      initCamera()
      InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
            $case: 'standard',
            standard: {
                disableAll: false,
            },
        },
    })

      // MAIN MENU
      this.mainMenu = new MainMenu(this)       
      this.mainMenu.countdown.hide() 

      // NEXT BLOCK DISPLAY
      this.nextBlockDisplay = new NextBlockDisplay(this.isMultiplayer)
     
      //this.update = this.update.bind(this);
      this.render = this.render.bind(this);
      this.drawBlock = this.drawBlock.bind(this);
      //this.onPressKeyboard = this.onPressKeyboard.bind(this);
      this.getNewBlock = this.getNewBlock.bind(this);
      this.checkCollision = this.checkCollision.bind(this);
      //this.checkLines = this.checkLines.bind(this);

      //MUSIC
      this.musicPlayer = new MusicPlayer()
      this.soundBox = new SoundBox() 
      

      this.clickBlocker = new ClickBlocker( sceneParentEntity)

      //UPDATE
      engine.addSystem((dt:number)=>{            
       
        switch(this.getState()){

          case GAME_STATE.MAIN_LOOP: {
            GameStateData.getMutable(gameStateEntity).gameTime +=dt
            this.elapsedTime +=  GameStateData.get(gameStateEntity).currentSpeed * dt

            let shouldRender = false
            if(this.elapsedTime > 1){
                this._currentY -= 1;
                this.elapsedTime = 0
                shouldRender = true 
               
            }    
            if (this.checkCollision(this._currentSchema, 0, 0)) {
    
              // IF COLLIDING AND TOUCHING THE TOP OF THE GRID -> GAME OVER
                if(this._currentY >= this._HEIGHT-2){
                  console.log("GAME OVER")
                  this.gameOver()
                 
                  //this.startLevel(0)
                }
                else{
                  this.setSolid();                  
                  this.clearBothButtons()

                  this.linesToBeCleared = this.checkLines()

                  if(this.linesToBeCleared.length > 0){
                    console.log("CLEARING STATE")           
                    //this.render();        
                    this.setState(GAME_STATE.CLEARING_LINES)
                    this.clearTime = 0
                  }else{
                    this.getNewBlock();
                    this.linesToBeCleared = []
                  }
                 
                }            
              }               
             
              if(shouldRender){
                this.render();
              }  
              
              break;
          }
          case GAME_STATE.CLEARING_LINES: {
            GameStateData.getMutable(gameStateEntity).gameTime +=dt
            this.clearTime +=dt

            const shrinkCells = engine.getEntitiesWith(ShrinkCell, Cell, Transform) 

            for (const [entity] of shrinkCells) {
              const transform = Transform.getMutable(entity)
              const info = Cell.getMutable(entity)
              
              let factor = utils.interpolate(utils.InterpolationType.EASEQUAD,  this.clearTime / this.clearDuration)

              transform.scale = Vector3.lerp(info.originalScale, Vector3.create(0.01, 0.01, 0.01), factor )           
            }

            if(this.clearTime > this.clearDuration){
              console.log("MAIN LOOP STATE")
              this.clearLines(this.linesToBeCleared)
              this.getNewBlock();
              this.setState(GAME_STATE.MAIN_LOOP)

              this.elapsedTime = 0
              this.linesToBeCleared = []

            }
            break;
          }

          case GAME_STATE.SHOW_SCORE: {
            this.showScoreTime +=dt

            if(this.showScoreTime > 3){
              console.log("SHOW SCORE STATE")              
              this.exitPlayer()         

            }
            break;
          }
        }
        

      })
      engine.addSystem((dt:number)=>{      

        if(this.getState() == GAME_STATE.MAIN_LOOP){
          // W or UP
          if (inputSystem.isTriggered(InputAction.IA_FORWARD, PointerEventType.PET_DOWN)){
              const newSchema = this.rotateClockwise(this._currentSchema);

              let offsetX = 0
              let offsetY = 0

              if(this._currentSchema.length == 4  ){
                console.log("ROTATING AN I BLOCK")
                offsetX = -1
                offsetY = 0
                // this._currentX -= 1

              }

              if( this._currentSchema[0].length == 4 ){
                console.log("ROTATING AN I BLOCK")
                // this._currentX += 1
                offsetX = 1
                offsetY = 0
                //this._currentY += 1
              }
              if (!this.checkCollision(newSchema, offsetX, 0)
                  && !this.checkCollision(newSchema, offsetX, 1)
              ) {
                  this._currentSchema = newSchema;
                  this._currentX += offsetX
                  this._currentY += offsetY
                  this.soundBox.playMultiSound("sounds/swosh.mp3", true)

              }
              this.render();
          }

          // A or LEFT
          if (inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)){
              this.moveLeft()
              this.leftButtonHeld = true
              this.clearRightButton()
              

          }
          // A or LEFT UP
          if (inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_UP)){
              // if (!this.checkCollision(this._currentSchema, -1, 0)) {
              //     this._currentX -= 1;
              //     this.render();
              // }
              this.clearLeftButton()
          }
          // D or RIGHT
          if (inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)){
              this.moveRight()
              this.rightButtonHeld = true
              this.clearLeftButton()
          }
          // D or RIGHT UP
          if (inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_UP)){
            
              this.clearRightButton()
          }

          // S or DOWN
          if (inputSystem.isTriggered(InputAction.IA_BACKWARD, PointerEventType.PET_DOWN)){
              if (!this.checkCollision(this._currentSchema, 0, 1)) {
                  this._currentY -= 1;
                  this.elapsedTime = 0;
                  this.render();
              }
              this.clearBothButtons()
          }

          // SPACE
          if (inputSystem.isTriggered(InputAction.IA_JUMP, PointerEventType.PET_DOWN)){

              let topY = this._currentY

              while (!this.checkCollision(this._currentSchema, 0, 1)) {
                  this._currentY -= 1;
                  this.elapsedTime = 0;
                  this.render();
              }
              let bottomY = this._currentY

              if(topY - bottomY > 2){
                this.soundBox.playMultiSound("sounds/hit.mp3", true)
                console.log("COLOR: " + _TETROMINOS[this._currentBlockIndex].color )
                // console.log("TRAIL FROM: " + this._currentX + ", " + topY)
                // console.log("TRAIL TO: " + this._currentX + ", " + bottomY)
                this.grid.showTrail(topY, this._currentX, bottomY, this._currentSchema, _TETROMINOS[this._currentBlockIndex].color )
              }
            
              this.clearBothButtons()
          }

          //LEFT CONTINUOUS MOVEMENT
          if(this.leftButtonHeld){
            this.leftButtonTimer += dt
            if(this.leftButtonTimer > this.leftButtonDelay){
              this.moveLeft()
            }
            
          }
          //RIGHT CONTINUOUS MOVEMENT
          if(this.rightButtonHeld){
            this.rightButtonTimer += dt
            if(this.rightButtonTimer > this.rightButtonDelay){
              this.moveRight()
            }
            
          }
        }

        })            

        //this.getNewBlock();
      
    }  

    moveLeft(){
      if (!this.checkCollision(this._currentSchema, -1, 0)) {
        this._currentX -= 1;
        this.render();
        this.soundBox.playMultiSound("sounds/move_blip.mp3", true)
      }
    }
    moveRight(){
      if (!this.checkCollision(this._currentSchema, 1, 0)) {
        this._currentX += 1;
        this.render();
        this.soundBox.playMultiSound("sounds/move_blip.mp3", true)
     }
    }
    clearLeftButton(){
      this.leftButtonHeld = false
      this.leftButtonTimer = 0
    }
    clearRightButton(){
      this.rightButtonHeld = false
      this.rightButtonTimer = 0
    }
    clearBothButtons(){
      this.clearLeftButton()
      this.clearRightButton()
    }
    
  
    private render() {    
      //console.log("CURRENT Y: " + this._currentY)
      for (let y = 0; y < this._HEIGHT; y++) {
        for (let x = 0; x < this._WIDTH; x++) {     
          
          if(!Cell.get(this.getCell(x,y)).landed && Cell.get(this.getCell(x,y)).color != "default"){
            clearCell(this.getCell(x,y))
          }
          
                    
        }
      }
      
      if(this.getState() == GAME_STATE.MAIN_LOOP){
        for (let y = 0; y < this._currentSchema.length; y++) {
          for (let x = 0; x < this._currentSchema[y].length; x++) {
            if (this._currentSchema[y][x] === 1) {
              this.drawBlock(
                (x + this._currentX) ,
                (this._currentY - y ) ,
                _COLORS[_TETROMINOS[this._currentBlockIndex].color]
              )
            }
          }
        }  
      }
    
    }
  
    private drawBlock(x : number, y : number, color : string) {

      if(y >=0 && x >=0 && y < this._HEIGHT && x < this._WIDTH){
        let cell = this.getCell(x,y)
        markCell(cell, false, color)
      }   
    }

    getState():GAME_STATE{
      return GameStateData.get(gameStateEntity).state
    }

    setState(state:GAME_STATE){
      GameStateData.getMutable(gameStateEntity).state = state
    }

    getCell(x:number, y:number):Entity{

      return GameStateData.get(gameStateEntity).cells[y][x]
    }

    getCurrentLevel():number{
      return GameStateData.get(gameStateEntity).currentLevel
    }

    isLanded(x:number, y:number):boolean {

      if(y >= this._HEIGHT || x > this._WIDTH-1 || y < 0 ||x < 0 ){
        return false
      }
      return Cell.get(this.getCell(x,y)).landed
    }
  
    private checkCollision(schema : Array<Array<number>>, offsetX : number, offsetY : number) : boolean {
      for (let y = 0; y < schema.length; y++) {
        for (let x = 0; x < schema[y].length; x++) {
          
          const pieceY = this._currentY -  y  - offsetY;
          const pieceX = x + this._currentX + offsetX;
          //console.log("PIECE Y: " + pieceY)
          if (schema[y][x] !== 0 && pieceY < this._HEIGHT
            && (pieceY < 0
              || pieceX < 0
              || pieceX > this._WIDTH-1
             // || this._landed[pieceY][pieceX] !== 0)) {
              || this.isLanded(pieceX, pieceY) 
            )) {
           
              //console.log("COLLIDED!")
            return true;
          }
        }
      }
  
      return false;
    }
  
    private setSolid() {

     // console.log("SETTING SOLID: " + this._currentY)
      for (let y = 0; y < this._currentSchema.length; y++) {
        for (let x = 0; x < this._currentSchema[y].length; x++) {
          if (this._currentSchema[y][x] === 1) {            
            if(x + this._currentX < this._WIDTH && this._currentY - y +1  >= 0)
            setLanded(this.getCell( x + this._currentX, this._currentY - y +1 ))
            //this._landed[y + this._currentY - 1][x + this._currentX] = this._TETROMINOS[this._currentBlockIndex].color;
          }
        }
      }
    }
  
    
  
    private getNewBlock() {
      //console.log("GETTING NEW BLOCK")
      // if (this._nextBlockIndexes.length === 0) {
      //   for(let i = 0; i < this._NEXT_BLOCKS; i++) {
      //     this._nextBlockIndexes.push(Math.floor(Math.random() * (_TETROMINOS.length - 0.5)));
      //   }
      // }
      console.log("NEXT INDEX ARRAY LENGTH: " + this._nextBlockIndexes.length)
      if (this._nextBlockIndexes.length === 0) {
        this._nextBlockIndexes = []
        for(let i = 0; i < _TETROMINOS.length; i++) {
          this._nextBlockIndexes.push(i);
        }
        this._nextBlockIndexes = shuffle(this._nextBlockIndexes)
        for (let i=0; i < this._nextBlockIndexes.length; i++){
          //console.log("Next index: " + i + " : " + this._nextBlockIndexes[i])
        }
      }
      this._currentBlockIndex = this._nextBlockIndexes[0];
      //console.log("Current Block Index: " + this._currentBlockIndex)

      this._currentSchema = Game.copy(_TETROMINOS[this._currentBlockIndex].schema);
      this._nextBlockIndexes.shift();
      //this._nextBlockIndexes.push(Math.floor(Math.random() * (_TETROMINOS.length - 0.5)));

      if (this._nextBlockIndexes.length === 0) {
        this._nextBlockIndexes = []
        for(let i = 0; i < _TETROMINOS.length; i++) {
          this._nextBlockIndexes.push(i);
        }
        this._nextBlockIndexes = shuffle(this._nextBlockIndexes)

        for (let i=0; i < this._nextBlockIndexes.length; i++){
          //console.log("Next index: " + i + " : " + this._nextBlockIndexes[i])
        }
      }
     
      this.nextBlockDisplay.displayBlock(_TETROMINOS[this._nextBlockIndexes[0]].schema, _COLORS[_TETROMINOS[this._nextBlockIndexes[0]].color])
      
      
  
      for (let i = 0; i < Math.random() * 4; i++) {
        this._currentSchema = this.rotateClockwise(this._currentSchema);
      }
  
      this._currentY = this._HEIGHT-1;
      this._currentX = Math.floor((this._WIDTH / 2) - (this._currentSchema[0].length / 2));
    }  
    
  
    private static copy(arr : Array<Array<number>>) : Array<Array<number>> {
      return JSON.parse(JSON.stringify(arr));
    }
  
    rotateClockwise(arr : Array<Array<number>>) : Array<Array<number>> {
      let transformedArray:number[][] = [];
  
      const M = arr.length;
      const N = arr[0].length;
  
      for (let y = 0; y < N; y++) {
        transformedArray.push([]);
        for (let x = 0; x < M; x++) {
          transformedArray[y].push();
        }
      }
  
      for (let y = 0; y < M; y++) {
        for (let x = 0; x < N; x++) {
          transformedArray[x][ M - 1 - y] = arr[y][x];
        }
      }

      
      // if(this._currentSchema.length == 4  ){
      //   console.log("ROTATING AN I BLOCK")
      //   this._currentX -= 2
      // }

      // if( this._currentSchema[0].length == 4 ){
      //   console.log("ROTATING AN I BLOCK")
      //   this._currentX += 2
      // }
     
  
      return transformedArray;
    }
  
    private checkLines():number[] {
      let linesToShift:number[] = [];
      for (let y = 0; y <= this._HEIGHT - 1; y++) {
        let blocksInRow = 0;
        for (let x = 0; x < this._WIDTH; x++) {

         // console.log("CHECKING ROW: " + y)
          if (this.isLanded(x,y)) {
            blocksInRow++;
          }
        //  console.log("BLOCKS FOUND:" + blocksInRow)
        }
        if (blocksInRow === this._WIDTH) {

          utils.timers.setTimeout(()=>{this.soundBox.playMultiSound("sounds/clear_line.mp3", false)}, 150 * linesToShift.length)

          linesToShift.push(y);
          this.linesCleared += 1;

          

          for (let x = 0; x < this._WIDTH; x++) {
            // console.log("CHECKING ROW: " + y)
            setColor(this.getCell(x,y), "white")
            startShrinking(this.getCell(x,y))
          }
              
         // console.log("LINES TO BE CLEARED: " + this.linesCleared) 
          console.log("LINE COMPLETED: " + y) 
          //console.log("BLOCKS IN ROW : " + blocksInRow) 
          
        }

      }
      //up the speed after level limit is hit
      if(this.linesCleared >= this.levelLimits[GameStateData.get(gameStateEntity).currentLevel]){
        this.nextLevel()
      }
  
      switch (linesToShift.length) {
        case 0:
          break;
        case 1:
          this.incrementSore( 40 * (this.getCurrentLevel()+1) );
          break;
        case 2:
          this.incrementSore(100 * (this.getCurrentLevel()+1) ) ;
          break;
        case 3:
          this.incrementSore( 300 * (this.getCurrentLevel()+1) );
          break;
        case 4:
          this.incrementSore(1200 * (this.getCurrentLevel()+1) );
          break;
        default:
          this.incrementSore( 800 + ( 400 * linesToShift.length) )
          break;
      }    
      
      return linesToShift     
    }

    private clearLines(linesToClear:number[]){
      console.log("LINES TO SHIFT: " + linesToClear.length)
      let lineOffset = 0

      for (const line of linesToClear) {

        this.shiftLines(line-lineOffset)
        lineOffset++ 
        this.render()
      }
    }
  
    private shiftLines(line : number) {
      for (let y = line; y < this._HEIGHT-1; y++) {
        for (let x = 0; x < this._WIDTH; x++) {
          resetSize(this.getCell(x,y))
          resetSize(this.getCell(x,y+1))
          ShrinkCell.deleteFrom(this.getCell(x,y))
          copyCell( this.getCell(x,y), this.getCell(x,y+1))
        }
      }
     
    }

    incrementSore(score:number){
      const gameData = GameStateData.getMutable(gameStateEntity)
      gameData.score += score
      this.mainMenu.scoreCounter.setNumber( gameData.score)
    }

    nextLevel(){
      let state = GameStateData.getMutable(gameStateEntity)
      state.currentLevel += 1
      state.currentSpeed += 0.75
      this.mainMenu.levelButtons[state.currentLevel].enable()
    }

    startLevel(level:number){ 
      
      const gameStateNonMutable = GameStateData.get(gameStateEntity)

      if(level < gameStateNonMutable.maxLevel){        
          
          const gameState = GameStateData.getMutable(gameStateEntity)
         
          this.grid.setLevel()
          gameState.currentLevel = level 
          this.getNewBlock()            
          
          gameState.elapsedTime = 0
          gameState.currentSpeed =  this._DEFAULT_SPEED
          gameState.currentLevel = level
          this.linesCleared = 0
          //this._score = 0
          this.mainMenu.scoreCounter.setNumber(0)
          this.mainMenu.resetLevelButtons()
          this.getNewBlock();        
          gameState.state = GAME_STATE.MAIN_LOOP   

         
      }
  }


  startCountDown(){
    this.mainMenu.countdown.show()
    this.soundBox.playSound("sounds/pre_countdown.mp3")
    let countDown = 4 
    this.mainMenu.countdown.setTimeAnimated(countDown--)
    let countDownTimer = utils.timers.setInterval(()=>{
      this.mainMenu.countdown.setTimeAnimated(countDown--)
    }, 1000)

    utils.timers.setTimeout(() => {     
      this.startLevel(0)     
      this.musicPlayer.playMusic()
      utils.timers.clearInterval(countDownTimer)
      this.mainMenu.countdown.hide()
      GameStateData.getMutable(gameStateEntity).score = 0
      GameStateData.getMutable(gameStateEntity).gameTime = 0
    }, 4000)
  }

  newGame(){

    utils.timers.setTimeout(() => {
      
      lockPlayer()  
      blockCamera()    
      this.mainMenu.moveScoreToTop()
      this.startCountDown()
      this.clickBlocker.disable()
     
    }, 1000)

      console.log("GETS THROUGH PLAYER CHECK")      

    }

    gameOver(){
      this.setState(GAME_STATE.SHOW_SCORE)
      this.mainMenu.moveScoreToCenter()
      
    }    

    exitPlayer(){
      
      unlockPlayer()
      freeCamera()
      this.clickBlocker.enable()     
      
      this.mainMenu.moveScoreToTop()
      this.setState(GAME_STATE.IDLE)
      this.showScoreTime = 0
    }

    toggleSFX(){
      const gameState = GameStateData.getMutable(gameStateEntity)

      gameState.sfxOn = !gameState.sfxOn
      
  }
}