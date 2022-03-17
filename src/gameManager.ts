import * as CANNON from 'cannon-es';
import { ThreeBody } from './threeBody';
import { Level } from './level';
import { MathUtils, Quaternion, Vector3,PerspectiveCamera ,WebGLRenderer,Scene} from 'three';


interface InputManager {
    currentPosition: {x: number, y: number},
    startPosition: {x: number, y: number},
    offset: {x: number, y: number},
    isPlayerTouch: boolean,
}
interface UI {
    menu: HTMLBodyElement,
    gameOver: HTMLBodyElement,
    goText:HTMLBodyElement,
    restart:HTMLBodyElement,
    score: HTMLBodyElement,
    highScore: HTMLBodyElement,
    hs: HTMLBodyElement,
    level1: HTMLBodyElement,
    level2: HTMLBodyElement,
    level3: HTMLBodyElement,
    level4: HTMLBodyElement,
}


export class GameManager {

    public scene: Scene;
    public camera: PerspectiveCamera;
    public renderer: WebGLRenderer;
    public canvas: HTMLCanvasElement;
    public level: Level | undefined;
    public unlockedLevels: number = 1;
    public bestScore: number = 0;
    public world: CANNON.World;
    public entities: any[] = [];
    public physicsBodies: ThreeBody[] = [];
    public play: boolean =false;
    public input: InputManager = {
        currentPosition: {x: 0, y: 0},
        startPosition: {x: 0, y: 0},
        offset: {x: 0, y: 0},
        isPlayerTouch: false,
    }; 
    public ui: UI = {
        menu:document.getElementById("menu") as HTMLBodyElement,
        gameOver:document.getElementById("gameOver") as HTMLBodyElement,
        goText:document.getElementById("goText") as HTMLBodyElement,
        restart:document.getElementById("restart") as HTMLBodyElement,
        score: document.getElementById("score") as HTMLBodyElement,
        highScore: document.getElementById("highScore") as HTMLBodyElement,
        hs: document.getElementById("score") as HTMLBodyElement,
        level1: document.getElementById("level1") as HTMLBodyElement,
        level2: document.getElementById("level2") as HTMLBodyElement,
        level3: document.getElementById("level3") as HTMLBodyElement,
        level4: document.getElementById("level4") as HTMLBodyElement,
    }; 


    public slowMo: number = 1;
        constructor() {

        window.onload = ()=> {
            this.ui = {
                menu:document.getElementById("menu") as HTMLBodyElement,
                gameOver:document.getElementById("gameOver") as HTMLBodyElement,
                goText:document.getElementById("goText") as HTMLBodyElement,
                restart:document.getElementById("restart") as HTMLBodyElement,
                score: document.getElementById("score") as HTMLBodyElement,
                highScore: document.getElementById("highScore") as HTMLBodyElement,
                hs: document.getElementById("hs") as HTMLBodyElement,
                level1: document.getElementById("level1") as HTMLBodyElement,
                level2: document.getElementById("level2") as HTMLBodyElement,
                level3: document.getElementById("level3") as HTMLBodyElement,
                level4: document.getElementById("level4") as HTMLBodyElement,
            }
        };

        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.canvas  = document.getElementById('main-canvas') as HTMLCanvasElement;
        this.renderer = new WebGLRenderer({antialias: true,canvas: this.canvas,alpha:true});
       this.renderer.autoClear = false
        this.world = new CANNON.World();
        this.world.gravity.set(0,-10,0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.defaultContactMaterial.friction = 0;
        this.level = undefined;
        this._setup();
        

        this.animate()
     
    }
 
   

    _setup(){

        this.camera.position.y = 5;
        this.camera.rotation.y += MathUtils.degToRad(180);
        this.camera.rotation.x += MathUtils.degToRad(45);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize',()=> this.onWindowResize(), false)

         window.addEventListener("touchstart", (e) => this.touchStartHandler(e), false);
         window.addEventListener("touchmove", (e) => this.touchMoveHandler(e), false);
        window.addEventListener("touchend", (e) => this.touchEndHandler(e), false); 
        window.addEventListener("mousedown", (e) => this.touchStartHandler(e), false);
        window.addEventListener("mousemove", (e) => this.touchMoveHandler(e), false);
        window.addEventListener("mouseup", (e) => this.touchEndHandler(e), false);
       
        
    }
    unlockLevel(){
        this.unlockedLevels +=1;

        switch (this.unlockedLevels) {
            case 2:
                this.ui.level2.style.opacity = "1";
                break;
            case 3:
                this.ui.level3.style.opacity = "1";
                break;
            case 4:
                this.ui.level4.style.opacity = "1";
                break;
            default:
                break;
        }

    }

    
    touchStartHandler(e: MouseEvent | TouchEvent){
        this.input.isPlayerTouch = true;
        if ('touches' in e) {
            
            this.input.startPosition.x =  e.touches[0].clientX / window.innerWidth * 2 - 1;
            this.input.startPosition.y =  (e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
        else{
            this.input.startPosition.x =  e.clientX / window.innerWidth * 2 - 1;
            this.input.startPosition.y =  (e.clientY / window.innerHeight) * 2 + 1;
        }

        
    }
    touchMoveHandler(e:  MouseEvent | TouchEvent){
        if ('touches' in e) {
            this.input.currentPosition.x =  e.touches[0].clientX / window.innerWidth * 2 - 1;
            this.input.currentPosition.y =  (e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
        else{
            this.input.currentPosition.x = e.clientX / window.innerWidth * 2 - 1;
            this.input.currentPosition.y = (e.clientY / window.innerHeight) * 2 + 1;
        }

        if(this.input.isPlayerTouch && this.level?.state == 1){

            this.input.offset.x  = this.input.currentPosition.x - this.input.startPosition.x

            this.level?.player.threeBody?.body.velocity.set(-this.input.offset.x*20,this.level?.player.threeBody?.body.velocity.y,this.level?.player.threeBody?.body.velocity.z);
        }

    }
    touchEndHandler(e:  MouseEvent | TouchEvent){
        this.input.isPlayerTouch = false;

        if(this.level?.state == 1){
            this.level?.player.threeBody?.body.velocity.set(0,this.level?.player.threeBody?.body.velocity.y,this.level?.player.threeBody?.body.velocity.z)
        }
    }

    cameraUpdate(){
        if(this.level?.player ){


            if(this.level.state == 1){
                this.camera.lookAt(this.level.player.position)
                this.camera.position.lerp(new Vector3().copy(this.level.player.position).add(new Vector3(0,3,-10)),.1);
            }

            else if(this.level.player.cubeBodies.length >0){
                var center = new Vector3()
                var count = 0;                 
                
                for (let index = 0; index < this.level.player.cubeBodies.length; index++) {
                    const element = this.level.player.cubeBodies[index];
                    center.add(element.object.position);
                    count++;
                }
                var theCenter = center.divideScalar(count);
                this.camera.position.lerp(new Vector3().copy(theCenter).add(new Vector3(0,3,-10)),.1);
                this.camera.lookAt(theCenter)

            }

            else{
                this.camera.position.lerp(new Vector3().set(-5,5,0),.1);
                this.camera.lookAt(this.level.player.position)
            }
        }

        this.camera.position.y = MathUtils.clamp(this.camera.position.y,0,Infinity);
    }


    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.canvas.width =  window.innerWidth ;
        this.canvas.height = window.innerHeight;

        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.render()
    }

    updatePhysics(){
        this.world.step(1/(60*this.slowMo));

        for (var i = 0; i <this.physicsBodies.length; i++) {



            const physicBody = this.physicsBodies[i];
            var possition = new Vector3();
            var quaternion = new Quaternion();
            var scale = new Vector3();

            if(physicBody.object != null && physicBody.object.parent != null){
                
          
                physicBody.object.matrixWorld.decompose(
                    possition,
                    quaternion,
                    scale,
                );

                if (   !physicBody.trigger ) {
                    physicBody.object.updateMatrixWorld(true);

                    
                    let position = physicBody.object.parent.worldToLocal(
                        new Vector3(physicBody.body?.position.x,physicBody.body?.position.y,physicBody.body?.position.z),
                    );

                        physicBody.object.position.x = position.x;
                        physicBody.object.position.y = position.y;
                        physicBody.object.position.z = position.z;
            
                    


                    physicBody.object.quaternion.copy(
                        physicBody.body.quaternion as any,
                    );

                    
                }

                else if( physicBody.trigger  ){
                    physicBody.body.position.copy(new CANNON.Vec3(possition.x,possition.y,possition.z) );
                    physicBody.body.quaternion.copy(new CANNON.Quaternion(quaternion.x,quaternion.y,quaternion.z) );
                } 


            }
        }
    }
    animate() {
        requestAnimationFrame(()=>this.animate());
        this.entities.forEach(entity => {
            entity.update();
        });
        this.updatePhysics();
        this.cameraUpdate()
        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera)

    }
}
export default new GameManager();
