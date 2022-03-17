# Madbox X Issaya
 
Hi, this is my submission for the HTML developer position!

This took me about 15 hours total, I know the assignment was supposed to be shorter but I was having a lot of fun polishing it and as you told me the time window was flexible I ended up making a cohesive visual style as well as implementing the cannon.js physics engine for a better overhaul game feel as well.
I think I could easily shave about 5 hours of work if I was more familiar with typescript which I used before but never to build a whole project. This was a nice exercise to get me to learn more about it and I am way more comfortable with it now.
The actual prototype (including the procedural generation) took me about 3 hours so not so far from the expected time of the assignment.
  
 The most difficult thing as stated above was learning and dealing with typescript's intricacies.
The rest of the process was really straightforward as I am used to doing these kinds of games.
I didn’t encounter any annoying bugs or anything during the development process but feel free to tell me if you find any ;).

I think I could have done the level generation and difficulty a bit better for it to scale properly in the endless mode which quickly gets really hard.
I also didn’t do the first 3 levels by hand as asked but if I were to do it i’ll probably use an external scene editor like blender or unity, build the level from there and write a script to properly handle it in three.js. 

To take it a step further I think I could add level variety first with different obstacles than these very basic rectangles. The fact that the gameplay is mostly handled by a physics engine makes it really easy to add things like ramps or gaps and add actions to the character controller like adding a jump. I could also add gameplay elements like power ups (boost, slowMo…). I could also use different color palettes / visual styles for different levels but I wanted to keep the Madbox esthetic through the whole experience.

Overall I ended up enjoying this assignment and had a lot of fun going through with it.

Hope you have fun playing it!


PS: For the code search these comments for interesting parts :<br/><br/>
      -Level Manager => main.ts<br/>
      -Level Generation => level.ts<br/>
      -Obstacle Generation => level.ts<br/>
      -Collision Handler => level.ts<br/>
      -Character Controller => gameManager.ts<br/>
      -Camera Controller => gameManager.ts<br/>
