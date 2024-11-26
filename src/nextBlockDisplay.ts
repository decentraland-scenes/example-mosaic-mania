import { engine, Entity, Material, MeshRenderer, Transform } from "@dcl/sdk/ecs"
import { createGridCell, setColor, showCell } from "./cell"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { _COLORS, _TETROMINOS } from "./globals"

export class NextBlockDisplay {
    root:Entity
    background:Entity
    cellPool:Entity[]


    constructor(isMultiplayer:boolean){
        this.root = engine.addEntity()
        Transform.create(this.root, {
            position: Vector3.create(5.5,7.25,0.35), 
            rotation: Quaternion.fromEulerDegrees(90,0,0),
            scale:Vector3.create(0.4,0.4,0.4)                
        })                

        this.background = engine.addEntity()
        Transform.create(this.background,{
            position: Vector3.create(0,0,0.5),
            rotation: Quaternion.fromEulerDegrees(90,0,0),
            scale: Vector3.create(4,5,1),
            parent:this.root
        })
        MeshRenderer.setPlane(this.background)
        Material.setPbrMaterial(this.background,{
            albedoColor: Color4.Black()
        })
        
        this.cellPool = [] 


        for (let i=0; i<4; i++){
            let cell = createGridCell(
                300000+300*i,
                {
                    position: Vector3.create(i*1,0,0)
                },
                i,
                0,
                this.root,
                isMultiplayer


             )
             showCell(cell)
             this.cellPool.push(cell)
        }
    }
    displayBlock(schema:Array<Array<number>>, color:string){

        let blockIterator = 0
        for (let y = 0; y < schema.length; y++) {
            for (let x = 0; x < schema[y].length; x++) {
                let offsetX = schema.length/2
                let offsetY = schema[y].length/2
                if(schema[y][x] == 1){
                    const transform = Transform.getMutable(this.cellPool[blockIterator]) 
                    transform.position = Vector3.create(y*1 - offsetX+0.5, 0, x*1 - offsetY+1)
                    setColor(this.cellPool[blockIterator], color)
                    blockIterator +=1
                }
                
            }
        }
    }
}