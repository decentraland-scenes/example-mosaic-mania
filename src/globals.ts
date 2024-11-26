import { engine, GltfContainer, Transform } from "@dcl/sdk/ecs";
import { Color3, Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import { Trail } from "./streakTrails";

export const SCENE_CENTER = Vector3.create(8,0,8) 
export const SCENE_ROTATION_Y = 0

export let sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, { 
    position:Vector3.create(8,0,8),
    rotation: Quaternion.fromEulerDegrees(0, SCENE_ROTATION_Y,0)

})

//SFX ATTACH TO OBJECT
export let winSound = 'sounds/win.mp3'
export let loseSound = 'sounds/lose.mp3'

export let _COLORS = [
    'black', 'orange', 'blue', 'yellow', 'purple', 'red', 'green', 'magenta'
  ];

export let ColorCodeArray = [
    '00000000', 
    'ff7e31ff',
    '0095daff',
    'f7c518ff',
    '9e67caff',
    'e5166aff',
    '00d79fff',
    'ff24bfff'
]  

export const _TETROMINOS = [
{
    name: 'L',
    color: 1,
    schema: [
    [1, 1, 1],
    [1, 0, 0]
    ]
}, {
    name: 'J',
    color: 2,
    schema: [
    [1, 1, 1],
    [0, 0, 1]
    ]
}, {
    name: 'O',
    color: 3,
    schema: [
    [1, 1],
    [1, 1]
    ]
}, {
    name: 'I',
    color: 4,
    schema: [
    [1, 1, 1, 1]
    ],
}, {
    name: 'Z',
    color: 5,
    schema: [
    [0, 1, 1],
    [1, 1, 0]
    ]
}, {
    name: 'S',
    color: 6,
    schema: [
    [1, 1, 0],
    [0, 1, 1]
    ]
}, {
    name: 'T',
    color: 7,
    schema: [
    [0, 1, 0],
    [1, 1, 1]
    ]
}
];


//preload

let cell_blue = engine.addEntity()
Transform.create(cell_blue, { position: Vector3.create(8,-2,8)})
GltfContainer.createOrReplace(cell_blue, {src:'models/cell_blue.glb'  })

let cell_default = engine.addEntity()
Transform.create(cell_default, { position: Vector3.create(9,-2,8)})
GltfContainer.createOrReplace(cell_default, {src:'models/cell_default.glb'  })

let cell_green = engine.addEntity()
Transform.create(cell_green, { position: Vector3.create(9.5,-2,8)})
GltfContainer.createOrReplace(cell_green, {src:'models/cell_green.glb'  })

let cell_magenta = engine.addEntity()
Transform.create(cell_magenta, { position: Vector3.create(10,-2,8)})
GltfContainer.createOrReplace(cell_magenta, {src:'models/cell_magenta.glb'  })

let cell_orange = engine.addEntity()
Transform.create(cell_orange, { position: Vector3.create(10.5,-2,8)})
GltfContainer.createOrReplace(cell_orange, {src:'models/cell_orange.glb'  })

let cell_purple = engine.addEntity()
Transform.create(cell_purple, { position: Vector3.create(11,-2,8)})
GltfContainer.createOrReplace(cell_purple, {src:'models/cell_purple.glb'  })

let cell_red = engine.addEntity()
Transform.create(cell_red, { position: Vector3.create(11.5,-2,8)})
GltfContainer.createOrReplace(cell_red, {src:'models/cell_red.glb'  })

let cell_white = engine.addEntity()
Transform.create(cell_white, { position: Vector3.create(12,-2,8)})
GltfContainer.createOrReplace(cell_white, {src:'models/cell_white.glb'  })

let cell_yellow = engine.addEntity()
Transform.create(cell_yellow, { position: Vector3.create(12.5,-2,8)})
GltfContainer.createOrReplace(cell_yellow, {src:'models/cell_yellow.glb'  })

// default
export let material ={
    albedoColor: Color4.Yellow(),
    emissiveColor: Color3.Yellow(),
    emissiveIntensity: 2,
    transparencyMode: 2,
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}



//Black 
export let matBlack ={
    albedoColor: Color4.Black(),           
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}      

//Green
export let matGreen ={
    albedoColor: Color4.Green(),   
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}


//yellow
export let matYellow ={
    albedoColor: Color4.fromHexString("#FF9900FF"),
    emissiveColor:  Color3.fromHexString("#FF9900"),
    emissiveIntensity: 1,           
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}        

//Red 
export let matRed ={
    albedoColor: Color4.Red(),
    emissiveColor: Color3.Red(),
    emissiveIntensity: 1,            
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}


//White 
export let matWhite ={
    albedoColor: Color4.Gray(),
    emissiveColor: Color3.Gray(),
    emissiveIntensity: 1,            
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}       

 
