
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import * as ui from "./ui"
import { sceneParentEntity } from "./globals"
//INSTRUCTIONS
export function addInstructions(){
     let instructions = new ui.InstructionsBoard({
        position: Vector3.create(7.3,4.2, 4 + 3.2),
        rotation: Quaternion.fromEulerDegrees(0,90,0),
        parent: sceneParentEntity
    },
    3.4,
    2.8,
    "images/instructions_MosaicMania.png"
    )  
}
