import * as CANNON from 'cannon-es';
import { Color, Mesh, BoxGeometry,MeshStandardMaterial,AmbientLight,FogExp2, DirectionalLight,MathUtils} from 'three';
import gameManager from './gameManager';
import { Player } from './player';
import { ThreeBody } from './threeBody';
import tools from './tools';
import { threeToCannon,ShapeType } from 'three-to-cannon';
import {  Vec3 } from 'cannon-es';



class Level {

    public player: Player;
    public floor: ThreeBody|undefined;
    public obstacles: ThreeBody[] = [];
    public difficulty: number;
    public levelId: number;
    public color: Color;
    public interval: number = 0;
    public scalableDiff: number = 0;
    public score: number = 0;
    started: boolean = false;
    //0: paused, 1: playing, 2: gameOver, 3: win
    public state: number = 0;
    scoreGoal: number = 20;
    
    public constructor( levelId: number=1,levelColor: Color = new Color(0xAB4FAF) ) {
    
    this.player = new Player(); 
    this.difficulty = levelId;
    
    this.levelId =levelId;
    this.color = levelColor;
    
    this.SetupLights();
    this.SetupScenery();

    gameManager.entities.push(this);
}


SetupLights(){
    const aLight = new AmbientLight(new Color(0xFB967F),1);
    const dLight = new DirectionalLight(new Color(0xFB967F) ,1);
    dLight.rotation.y += MathUtils.degToRad(65)
    gameManager.scene.add(aLight);
    gameManager.scene.add(dLight);
}

SetupScenery(){


    gameManager.scene.fog = new FogExp2(0xf57b00,.0125);

    const cube = new Mesh( new BoxGeometry( 1, 1, 1 ), new MeshStandardMaterial( {color: 0x1C329B} ) );
    cube.position.z += 10
    cube.scale.set(10,1,1000)
    gameManager.scene.add( cube );

    this.floor = tools.boxToBody(cube,{mass:0});
    this.floor.body.addShape( this.floor.body.shapes[0]) 
    this.floor.body.addShape( this.floor.body.shapes[0]) 


    this.floor.addToWorld();
    
}

Start(difficulty: number= 1){
    
    this.levelId = difficulty;
    if(this.levelId == 4){
        this.difficulty = 1;
        this.scalableDiff = window.setInterval(() => {
            if(this.difficulty <= 3.5){
                this.difficulty+=.33;
                this.spawner();
            }
            }, 2000);
    
    }
    else{
        this.difficulty = this.levelId;
    }

  

    this.spawner();
    this.state = 1;

    gameManager.ui.goText.textContent = 'Level '+ this.levelId;
    gameManager.ui.goText.style.visibility = 'visible';
    gameManager.ui.gameOver.style.visibility = 'hidden';
    gameManager.ui.menu.style.visibility = 'hidden';
    gameManager.ui.score.style.visibility = 'visible';

}

spawner(){
    clearInterval(this.interval);
    this.interval = window.setInterval(() => {
        this.createObstacle()
    }, 1000/this.difficulty);

    this.createObstacle()
    
}

//rewrite disgusting code
createObstacle(){

   
    const size = MathUtils.randInt(2,MathUtils.clamp(3+this.difficulty,5,5)) 
    let temp = new Mesh();


    let i = 0;
    let y = 0;
    temp = new Mesh( new BoxGeometry( 1, 1, 1 ), new MeshStandardMaterial( {color: 0xA62862} ) )
    temp.scale.x = size;
    temp.scale.z = MathUtils.clamp(size,1,3);
    
    let rand = MathUtils.randInt(0,3) ;

    if(rand == 0){
        temp.position.set(MathUtils.randFloat(0,5-(size/2)),1,150)
    }
    else if(rand == 1){
        temp.position.set(-MathUtils.randFloat(0,5-(size/2)),1,150)
    }

    else if(rand == 2){
        temp.position.set(5-(size/2),1,150)
    }

    else if(rand == 3){
        temp.position.set(-(5-(size/2)),1,150)
    }

    gameManager.scene.add(temp)

    const shape = threeToCannon(temp as any,{type: ShapeType.BOX});
     const body = new CANNON.Body({mass:1,shape: shape?.shape})
    body.shapeOffsets[0] = new Vec3(shape?.offset?.x,shape?.offset?.y,shape?.offset?.z);
    body.position.copy(new Vec3(temp.position.x,temp.position.y,temp.position.z)) 
    const obstacleTB = new ThreeBody(body,temp)
    var crashed = false;
    obstacleTB.body.addEventListener("collide", (e: any) => {
        if(e.body.id == -1){

            if(this.state != 0 && !crashed) {
                crashed= true;
                if( this.state == 1){

                    this.gameOver()
                }
            }
           
         
        }
        

    });

    obstacleTB.addToWorld()        
    this.obstacles?.push(obstacleTB)
    gameManager.scene.add( obstacleTB.object );

}

gameOver(){
    this.state = 2;
    this.player.crash()

    gameManager.ui.goText.textContent = 'Game Over';
    gameManager.ui.restart.textContent = "Restart";

    if(this.levelId == 4){
        if(gameManager.bestScore < this.score){
            gameManager.bestScore = this.score;
            gameManager.ui.highScore.textContent = "High Score: "+this.score.toString();
            gameManager.ui.hs.textContent = "Best: "+this.score.toString();
        }
    }

    else{
        
        gameManager.ui.hs.textContent = "Goal: "+this.scoreGoal.toString();

    }

    gameManager.ui.gameOver.style.visibility = 'visible';
    gameManager.ui.menu.style.visibility = 'hidden';
    gameManager.ui.score.style.visibility = 'visible';
    clearInterval(this.scalableDiff);
    clearInterval(this.interval);

}
win(){
    this.state = 3;  
    this.player.threeBody.body.velocity.x = 0;  
    gameManager.ui.hs.textContent = "Goal: "+this.scoreGoal.toString();
    gameManager.ui.goText.textContent = "Level cleared! ";
    gameManager.ui.restart.textContent = "Next Level";


    gameManager.ui.gameOver.style.visibility = 'visible';
    gameManager.ui.menu.style.visibility = 'hidden';
    gameManager.ui.score.style.visibility = 'visible';
    gameManager.unlockLevel() 
    clearInterval(this.scalableDiff);
    clearInterval(this.interval);

}

delete(){
    this.player.destroy();
    clearInterval(this.scalableDiff);
    clearInterval(this.interval);
    gameManager.scene.clear();
     gameManager.physicsBodies.forEach(body => {
        body.removeFromWorld()
    });

    this.obstacles.forEach(obstacle => {
            gameManager.physicsBodies.splice(gameManager.physicsBodies.indexOf(obstacle),1);
            this.obstacles.splice(this.obstacles.indexOf(obstacle),1);
            gameManager.world.removeBody(obstacle.body);
            gameManager.scene.remove(obstacle.object);
    });

   
    gameManager.physicsBodies = [];
    gameManager.entities = [];


}

update(){
        if(gameManager.ui.score){
            gameManager.ui.score.textContent = "Score: "+this.score.toString();
        }
        this.obstacles.forEach(obstacle => {
            if(this.state == 1 || this.difficulty == 4){
                obstacle.body.velocity.set(0,0,-40)
            }
            if(obstacle.body.position.z <= -15){
                obstacle.removeFromWorld()
                this.obstacles.splice(this.obstacles.indexOf(obstacle),1);
                gameManager.scene.remove(obstacle.object);
                if(this.state == 1){
                    this.score++;
                    if(this.score >= this.scoreGoal && this.levelId != 4){
                        this.win()
                    }
                }

            }
            
        });

    
}



}export { Level };

