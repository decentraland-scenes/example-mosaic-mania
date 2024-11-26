import { Animator, AudioSource, ColliderLayer, EasingFunction, Entity, GltfContainer, InputAction, Material, MeshRenderer, PointerEventType, PointerEvents, Schemas, TextAlignMode, TextShape, Transform, TransformTypeWithOptionals, Tween, TweenState, VisibilityComponent, engine } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import * as utils from "@dcl-sdk/utils"
import { triggerSceneEmote } from "~system/RestrictedActions"
import { _COLORS } from "./globals"

export const Cell = engine.defineComponent('cell', { 
    id:Schemas.Number,
    active:Schemas.Boolean,
    marked:Schemas.Boolean,    
    x: Schemas.Number,
    z: Schemas.Number,
    landed:Schemas.Boolean,
    color:Schemas.String,
    originalScale:Schemas.Vector3
    //debugMarker:Schemas.Entity,

})

export enum CELL_FLASH {
    RED,
    GREEN,
    FRAMED_RED,
    DEFAULT
}

export const ShrinkCell = engine.defineComponent('shrink-cell', { 
    active:Schemas.Boolean
    
})



export function spawnClickAnimation(cell:Entity, isBeingMarked:boolean, sound:boolean){

    let startScale = Vector3.create(0.1, 0.1, 0.1)
    let endScale = Vector3.create(1,0.1, 1)

   
}


export function checkWin():boolean{
    let cellGroup = engine.getEntitiesWith(Cell,Transform, GltfContainer)
    let gameWon = true

    for (const [entity, cellInfo] of cellGroup) {
        
        
    }

    if(!gameWon){
        return false
    }
    
    return true         
}

export function showCell(cell:Entity){
    VisibilityComponent.getMutable(cell).visible = true
}
export function hideCell(cell:Entity){
    VisibilityComponent.getMutable(cell).visible = false
}

export function addDebugCoords(parentCell:Entity, x:string, z:string){    
    
    let debugMarker = engine.addEntity()
    Transform.create(debugMarker,{
        position: Vector3.create(0,0.1,-0.45),
        rotation:Quaternion.fromEulerDegrees(90,0,0),
        parent: parentCell
    })
    TextShape.createOrReplace(debugMarker, {
        text: ("x: " + x + ", y: " + z ),
        fontSize: 2,
        textAlign:TextAlignMode.TAM_BOTTOM_CENTER,       
        textColor:Color4.Black(),
        outlineColor: Color4.Black(),
        outlineWidth: 0.1
        
    })

}


export function setColor(cell:Entity, color:string){

    //  'black', 'orange', 'blue', 'yellow', 'purple', 'red', 'green', 'magenta'

   // Transform.getMutable(cell).scale.y = 10

  

   Cell.getMutable(cell).color = color

    switch (color){
        case 'orange':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_orange.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
        case 'blue':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_blue.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
        case 'yellow':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_yellow.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
        case 'purple':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_purple.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
        case 'red':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_red.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
        case 'green':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_green.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
        case 'magenta':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_magenta.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
        case 'default':{
            //GltfContainer.createOrReplace(cell, {src:'models/cell_default.glb'  })
            GltfContainer.deleteFrom(cell)
            VisibilityComponent.getMutable(cell).visible = false
            resetSize(cell)
           // Transform.getMutable(cell).scale.y = 1
            break;
        }
        case 'white':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_white.glb'  })
            VisibilityComponent.getMutable(cell).visible = true
           
            break;
        }
        case 'black':{
            GltfContainer.createOrReplace(cell, {src:'models/cell_marked.glb'  })
            VisibilityComponent.getMutable(cell).visible = true
            resetSize(cell)
            break;
        }
        default:{
            GltfContainer.createOrReplace(cell, {src:'models/cell_marked.glb'  })
            resetSize(cell)
            VisibilityComponent.getMutable(cell).visible = true
            break;
        }
    }
}

export function showDebugMarker(cell:Entity, show:boolean){

    //let marker = Cell.get(cell).debugMarker
   // VisibilityComponent.getMutable(marker).visible = show
   

}

export function resetSize(cell:Entity){
    if(Tween.has(cell)){
        Tween.deleteFrom(cell)
    }
    
    Vector3.copyFrom(Cell.get(cell).originalScale, Transform.getMutable(cell).scale)
}

export function setWhiteClear(cell:Entity){

    setColor(cell, 'white')
    startShrinking(cell)
}

export function copyCell(targetCell:Entity, sourceCell:Entity){

    //let targetInfo = Cell.getMutable(targetCell)
    let sourceInfo = Cell.get(sourceCell)

    if(sourceInfo.landed){
        setLanded(targetCell)
    }
    else{
        clearLanded(targetCell)
    }

    setColor(targetCell, sourceInfo.color)

    resetSize(targetCell)

}

export function setLanded(cell:Entity){
    let cellInfo = Cell.getMutable(cell)

    //showDebugMarker(cell, true)
   
    //setColor(cell, 'orange')
    cellInfo.landed = true     
}

export function clearLanded(cell:Entity){
    let cellInfo = Cell.getMutable(cell)
   
    showDebugMarker(cell, false)
    //setColor(cell, 'orange')
    cellInfo.landed = false   
}

// returns true if the cell was a mine and the game is over
export function markCell(cell:Entity, sound:boolean, color:string ){   

    let cellInfo = Cell.getMutable(cell)
   
    cellInfo.marked = true          
    setColor(cell, color)
   
    //GltfContainer.createOrReplace(cell, {src:'models/cell_marked.glb'  })   
    //spawnClickAnimation(cell, true, sound)
        
        
    
}

export function clearCell(cell:Entity){
    
    setColor(cell, "default")
    showDebugMarker(cell, false)

   
   
}




export function createGridCell(_id:number, transform:TransformTypeWithOptionals, idX:number, idY:number, _parent:Entity, isMultiplayer:boolean):Entity{

    

    let cell = engine.addEntity()
    Transform.create(cell, transform)
    //GltfContainer.createOrReplace(cell,{src: 'models/cell_default.glb'})     

    //DEBUG ONLY
    // let debugMarker = engine.addEntity()
    // Transform.create(debugMarker,{
    //     parent: cell,
    //     scale: Vector3.create(0.2,0.2,0.2)
    // })
    // MeshRenderer.setSphere(debugMarker)
    // VisibilityComponent.create(debugMarker, {visible: false})

    /////
    Cell.createOrReplace(cell,{      
        x: idX,
        z: idY,
        marked:false,
        active:false,
        id:_id,   
        landed: false  ,
        originalScale: transform.scale?Vector3.create(transform.scale?.x, transform.scale?.y, transform.scale?.z) : Vector3.create(1,1,1)
       // debugMarker: debugMarker 
           

    })
    VisibilityComponent.createOrReplace(cell, {visible:false})
   
    Transform.getMutable(cell).parent = _parent
    
    

    //addDebugCoords(cell,idX.toString(), idY.toString())
        
    return cell 
}

 export function resetGridCell(cell:Entity, idX:number, idZ:number):Entity{

     const cellInfo = Cell.getMutable(cell)

     cellInfo.marked = false
     cellInfo.landed = false
     cellInfo.x= idX
     cellInfo.z= idZ  
     
   
    //  if(FlashCell.has(cell)){
    //     FlashCell.deleteFrom(cell)
    //  }


     GltfContainer.createOrReplace(cell,{src: 'models/cell_default.glb', invisibleMeshesCollisionMask:ColliderLayer.CL_PHYSICS | ColliderLayer.CL_POINTER})  

     Transform.getMutable(cell).position.z = -10   

    

     return cell
 }

 export function startShrinking(cell:Entity){
    ShrinkCell.createOrReplace(cell)
    console.log("START SHRINKING")

    //Transform.getMutable(cell).scale = Vector3.create(0.1, 0.1, 0.1)

    // Tween.createOrReplace(cell, {
    //     mode: Tween.Mode.Scale({
    //         start:Transform.get(cell).scale,
    //         end: Vector3.create(0.01, 0.01, 0.01),
    //       }),
    //       duration: 1000,
    //       easingFunction: EasingFunction.EF_EASEEXPO,
    // })
   // let originalSize =  Transform.get(cell).scale
    // utils.tweens.startScaling(
    //     cell,
    //     Cell.get(cell).originalScale,
    //     Vector3.create(0.01, 0.01, 0.01),
    //     0.4,
    //     utils.InterpolationType.EASEOUTQUAD,
        
    // )
 }

