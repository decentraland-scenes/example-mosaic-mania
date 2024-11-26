import { EasingFunction, engine, Entity, Material, MaterialTransparencyMode, MeshRenderer, Texture, Transform, Tween, VisibilityComponent } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import * as utils from "@dcl-sdk/utils"
import { ColorCodeArray } from "./globals"
import { tweenUtils } from "./tweenSystem"
import { EasingType } from "./easingFunctions"

export class Trail{
    rootScale:Entity
    rootPos:Entity
    trails:Entity[]

    constructor(_parent:Entity){

        this.rootPos = engine.addEntity()
        Transform.create(this.rootPos, {
            parent: _parent,
            rotation: Quaternion.fromEulerDegrees(90,0,0),
            position: Vector3.create(0,0,0)
        })
        this.rootScale = engine.addEntity()
        Transform.create(this.rootScale, {
            parent: this.rootPos,
            rotation: Quaternion.fromEulerDegrees(0,0,0),
            position: Vector3.create(0,0,0)
        })
        this.trails = []

        //for(let i=0; i<2; i++){
            let trail = engine.addEntity()

            Transform.create(trail, {
                parent: this.rootScale,
                position: Vector3.create(0,0.5,0.0),
                rotation: Quaternion.fromEulerDegrees(0,0,0)
            })
            MeshRenderer.setPlane(trail)
            Material.setPbrMaterial(trail,{
                albedoColor:Color4.White(),
                texture:  Material.Texture.Common({src:"images/trail.png"}),
                transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
                alphaTexture: Material.Texture.Common({src:"images/trail.png"}),
                emissiveTexture: Material.Texture.Common({src:"images/trail.png"}),
                emissiveIntensity: 0.8,
                emissiveColor: Color4.White()
                
            })
            VisibilityComponent.create(trail, {visible: false})
            
            this.trails.push(trail)
       // }
    }

    drawTrails(topPos:Vector3, bottomPos:Vector3, width:number, colorIndex:number){

        

        let transformPos = Transform.getMutable(this.rootPos)
        let transformScale = Transform.getMutable(this.rootScale)

        transformPos.position = Vector3.create(bottomPos.x,  bottomPos.y, bottomPos.z)
        transformScale.scale = Vector3.create(width,  (topPos.z - bottomPos.z), 1)

        for(let trail of this.trails){

            console.log("TRAIL FROM: " + topPos.x + ", " + topPos.z)
            console.log("TRAIL TO: " + bottomPos.x + ", " + bottomPos.z)

            VisibilityComponent.getMutable(trail).visible = true

            console.log("trail color: " + colorIndex + ", hex: " + ColorCodeArray[colorIndex])
            if(colorIndex >= 0 && colorIndex < ColorCodeArray.length){
                Material.setPbrMaterial(trail,{
                    albedoColor: Color4.fromHexString("#" + ColorCodeArray[colorIndex] ),
                    texture:  Material.Texture.Common({src:"images/trail.png"}),
                    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
                    alphaTexture: Material.Texture.Common({src:"images/trail.png"}),
                    emissiveTexture: Material.Texture.Common({src:"images/trail.png"}),
                    emissiveIntensity: 0.8,
                    emissiveColor: Color4.fromHexString("#" + ColorCodeArray[colorIndex]) 
                    
                })
            }
            
        }

        tweenUtils.startScaling(
            this.rootScale, 
            transformScale.scale, 
            {x: transformScale.scale.x, y: 0 , z: transformScale.scale.z}, 
            0.35,
            EasingType.EASEINEXPO
        )

        // Tween.createOrReplace(this.rootScale, {
        //     mode: Tween.Mode.Scale({
        //       start: transformScale.scale,
        //       end: Vector3.create(transformScale.scale.x, 0, transformScale.scale.z),
        //     }),
        //     duration: 200,
        //     easingFunction: EasingFunction.EF_EASEINEXPO,
        //   })

        // utils.tweens.startScaling(
        //     this.root,
        //     transform.scale,
        //     Vector3.create(transform.scale.x, 0, transform.scale.z),
        //     0.2,
        //     utils.InterpolationType.EASEINEXPO,
        //     ()=>{
        //         for(let trail of this.trails){
        //             VisibilityComponent.getMutable(trail).visible = false
        //         }
        //     }

        // )
    }
        

}