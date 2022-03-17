import { Level } from "./level";
import gameManager from "./gameManager"
import { MathUtils } from "three";
gameManager.level = new Level(0);

window.addEventListener("buttonClicked",(e)=> startLevel(e), false);

function startLevel(e: Event){
    var event = e as CustomEvent;
    gameManager.slowMo = 1;
    var levelId = event.detail;

    if(levelId == 0){
        if(gameManager.level?.state == 3 || gameManager.level?.levelId == 4){
            levelId = Math.round(MathUtils.clamp(gameManager.level?.levelId+1,-1,4))    
        }
        else{
            levelId = gameManager.level?.difficulty;
        }
    }


    
    if(levelId != -1  ){
        if(levelId <= gameManager.unlockedLevels){
            if(gameManager.level?.state != 0){
                gameManager.level?.delete();
                gameManager.level = new Level(levelId);
            }
            gameManager.level?.Start(levelId);

        }
    }

    else{
        gameManager.level?.delete();
        gameManager.level = new Level(0);
        gameManager.ui.gameOver.style.visibility = 'hidden';
        gameManager.ui.goText.style.visibility = 'hidden';
        gameManager.ui.menu.style.visibility = 'visible';
        gameManager.ui.score.style.visibility = 'hidden';

    }

}









