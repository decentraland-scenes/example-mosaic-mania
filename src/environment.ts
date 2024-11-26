import { engine, Entity, GltfContainer, Material, MeshCollider, MeshRenderer, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { Quaternion } from "@dcl/sdk/math"

export function addEnvironment(parent:Entity)
{
    let environment = engine.addEntity()
    Transform.create(environment, {
        position: Vector3.create(8, 0, 8),
        rotation: Quaternion.fromEulerDegrees(0, 90, 0)
    })
    GltfContainer.create(environment, {src:'models/environment.glb'  })

    // let gameAreaCollider = engine.addEntity()
    // Transform.create(gameAreaCollider, {
    //     parent: parent,
    //     scale:Vector3.create(10,12,13), 
    //     position: Vector3.create(0, 6 ,-1.5)  
    // })
    // //MeshRenderer.setBox(gameAreaCollider)
    // MeshCollider.setBox(gameAreaCollider)
}

