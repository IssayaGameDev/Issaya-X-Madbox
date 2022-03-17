import { Vec3,Box ,Body} from 'cannon-es';
import { ThreeBody } from './threeBody';
import {  Object3D,Vector3 } from 'three';
import gameManager from './gameManager';


class Tools {

    boxToBody(object: Object3D,options: {mass: number,extents?: Vector3 },collisionResponse: boolean = true ){
        const body = new Body({
            mass: options.mass,
            material: gameManager.world.defaultMaterial,
            collisionResponse: collisionResponse,
        });

        let size = new Vector3(1, 1, 1);

        size.multiply(
            new Vector3(
                object.scale.x,
                object.scale.y,
                object.scale.z,
            ),
        );

        if(options.extents)
            size.multiply(options.extents);
        let thing = new Vec3(
            Math.abs(size.x / 2),
            Math.abs(size.y / 2),
            Math.abs(size.z / 2),
        );

        const shape = new Box(thing);
        body.addShape(shape);

        body.position.copy(object.position as any);

        body.quaternion.copy(object.quaternion as any);

        return new ThreeBody(body,object);
    }







}export default new Tools();
