import { Vec3 } from 'cannon-es';
import { MeshStandardMaterial, BoxGeometry, Mesh, Object3D, Vector3 } from 'three';
import gameManager from './gameManager';
import { ThreeBody } from './threeBody';
import tools from './tools';

class Player extends Object3D{
    
    public mesh: Mesh |undefined;
    public threeBody: ThreeBody ;
    public cubeBodies: ThreeBody[] = [];

    public constructor() {
      super();
      gameManager.entities.push(this);
      gameManager.scene.add(this);

      const geometry = new BoxGeometry( 1, 1, 1 );
        const material = new MeshStandardMaterial( {color: 0xE05A5A} );
        this.mesh = new Mesh( geometry, material );
        this.add(this.mesh)
        this.mesh.position.copy(new Vector3(0,0,0))
        this.position.z += 3
        this.position.y += 5
        
        
        this.threeBody = tools.boxToBody(this ,{mass:1});

        this.threeBody.body.linearFactor.set(1,1,0)
        this.threeBody.body.id  = -1;
        this.threeBody.addToWorld();

       

    }
   
    setup(){
        
    }

    crash(numberOfDivisions: number =5){
        gameManager.slowMo = 10;
    
       const cubes = new Object3D()
     
        cubes.position.copy(this.threeBody.object.position)
        cubes.quaternion.set(this.threeBody.body.quaternion.x,this.threeBody.body.quaternion.y,this.threeBody.body.quaternion.z,this.threeBody.body.quaternion.w)
        gameManager.scene.remove(this.threeBody.object)
        this.threeBody.removeFromWorld()

        let padding = 1/numberOfDivisions;

        let i = 0;
        let j = 0;
        let k = 0;
        let pos;
        let threeBody;
        const geometry = new BoxGeometry( 1, 1, 1 );
        const material = new MeshStandardMaterial( {color: 0xE05A5A,wireframe: false} );
        let mesh = new Mesh( geometry, material );
        
        mesh.scale.divideScalar(numberOfDivisions)      

        for( i =0; i < numberOfDivisions; i ++) {
            for( j=0;j< numberOfDivisions;j++){
                for( k=0; k < numberOfDivisions;k++){
                    pos = new Vector3(k * padding,j * padding,i * padding);
                    mesh =mesh.clone()
                    cubes.add(mesh)        
                    threeBody = tools.boxToBody(mesh ,{mass:.01});
                    threeBody.object.position.set(pos.x,pos.y,pos.z)
                    threeBody.body.position.set( threeBody.object.getWorldPosition(new Vector3()).x, threeBody.object.getWorldPosition(new Vector3()).y, threeBody.object.getWorldPosition(new Vector3()).z)
                    threeBody.body.velocity.copy(this.threeBody.body.velocity)
                 threeBody.body.linearFactor = new Vec3(1,1,1)
                    gameManager.scene.add(threeBody.object)
                    this.cubeBodies.push(threeBody)
                    threeBody.addToWorld()
                }
            }
        }
        cubes.position.x -= (1+ .5 * (numberOfDivisions -3)) /numberOfDivisions
        cubes.position.y -= (1+ .5 * (numberOfDivisions -3)) /numberOfDivisions
        cubes.position.z -= (1+ .5 * (numberOfDivisions -3)) /numberOfDivisions

        gameManager.scene.add(cubes)


    }
    destroy(){
        this.cubeBodies.forEach(body => {
            body.removeFromWorld();
        });
    }

    update(){

        if(this.threeBody.body.position.y <= 0 && gameManager.level?.state == 1){
            gameManager.level?.gameOver();
        }

        if(this.threeBody.body.velocity.x != 0){
            this.threeBody.object.rotation.y = this.threeBody.body.velocity.x/20;
            this.threeBody.body.quaternion.setFromEuler(this.threeBody.object.rotation.x,this.threeBody.object.rotation.y,this.threeBody.object.rotation.z)
        }

        
    }



}export { Player };
