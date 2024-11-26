
const c4 = (2 * Math.PI) / 3;
const c5 = (2 * Math.PI) / 4.5;
const n1 = 7.5625;
const d1 = 2.75;

export enum EasingType {
    LINEAR,
    EASEINQUAD,
    EASEOUTQUAD,
    EASEQUAD,
    EASEINSINE,
    EASEOUTSINE,
    EASESINE,
    EASEINEXPO,
    EASEOUTEXPO,
    EASEEXPO,
    EASEINELASTIC,
    EASEOUTELASTIC,
    EASEELASTIC,
    EASEINBOUNCE,
    EASEOUTEBOUNCE,
    EASEBOUNCE
}

export function interpolateWithEasing(x:number, easingType:EasingType):number{

    switch ( easingType ){
        case EasingType.LINEAR : {
            return x;
        }
        case EasingType.EASEINQUAD : {
            return x * x;
        }
        case EasingType.EASEOUTQUAD : {
            return 1 - (1 - x) * (1 - x);
        }
        case EasingType.EASEQUAD : {
            return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        }
        case EasingType.EASEINSINE : {
            return 1 - Math.cos((x * Math.PI) / 2);
        }
        case EasingType.EASEOUTSINE : {
            return  Math.sin((x * Math.PI) / 2);
        }
        case EasingType.EASESINE : {
            return -(Math.cos(Math.PI * x) - 1) / 2;
        }
        case EasingType.EASEINEXPO : {
            return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        }
        case EasingType.EASEOUTEXPO : {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        }
        case EasingType.EASEEXPO : {
            return x === 0
            ? 0
            : x === 1
            ? 1
            : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
            : (2 - Math.pow(2, -20 * x + 10)) / 2;
        }
        case EasingType.EASEINELASTIC : {
            return x === 0
            ? 0
            : x === 1
            ? 1
            : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
        }
        case EasingType.EASEOUTELASTIC : {       

            return x === 0
            ? 0
            : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        }
        case EasingType.EASEELASTIC : {
            

            return x === 0
              ? 0
              : x === 1
              ? 1
              : x < 0.5
              ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
              : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
        }
        case EasingType.EASEINBOUNCE : {
            return 1 - easeOutBounce(1 - x);
        }
        case EasingType.EASEOUTEBOUNCE : {
            return easeOutBounce(x)
        }
        case EasingType.EASEBOUNCE : {
            return x < 0.5
            ? (1 - easeOutBounce(1 - 2 * x)) / 2
            : (1 + easeOutBounce(2 * x - 1)) / 2;           
        }        
    }

    return x
}

function easeOutBounce(x: number): number {   
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
    }