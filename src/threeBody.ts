import { Object3D, Vector3 } from "three";
import { Body } from "cannon-es";
import gameManager from "./gameManager";


//Interface for Cannon.js + Three.js

export class ThreeBody {

    object: Object3D;
    body: Body;
    trigger: boolean = false;
    constraints: Vector3 = new Vector3();

    public constructor(body: Body, object: Object3D) {
        this.body = body;
        this.object = object;
    }

    addToWorld() {
        gameManager.world.addBody(this.body);
        gameManager.physicsBodies.push(this);
    }

    removeFromWorld() {
        gameManager.world.removeBody(this.body);
        gameManager.physicsBodies.splice(gameManager.physicsBodies.indexOf(this), 1)
    }
    

}