import { engine, Entity, MeshCollider, MeshRenderer, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

export class ClickBlocker {
    blockerEntity:Entity

    constructor(parent:Entity){
        this.blockerEntity = engine.addEntity()
        Transform.create( this.blockerEntity, {
            parent: parent,
            scale:Vector3.create(10,12,3), 
            position: Vector3.create(0, 6 ,-6.5)  
        })
        //MeshRenderer.setBox(this.blockerEntity)
        MeshCollider.setBox( this.blockerEntity)
    }

    enable(){
        if(!MeshCollider.has(this.blockerEntity)){
            MeshCollider.setBox( this.blockerEntity)
        }
    }
    disable(){
        MeshCollider.deleteFrom(this.blockerEntity)
        
       
    }
}