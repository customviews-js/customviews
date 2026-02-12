{% set title = "Non Sticky Header" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuideNSH.md
  pageNav: 2
</frontmatter>


hello there lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.

Introduction
This problem set gives you a chance to implement the Peggle gameplay in these layers:

First, you need to build a physics engine.
Next, you need to build the Peggle game engine on top of it.
Finally, you need to render the engine onto the screen.
This is how the three layers will interact:

The renderer will ask the Peggle game engine: "hey, what is the state of the current game?" and the Peggle game engine will answer appropriately, for example "the ball is at this position, the pegs are at these locations, these are the ones that are blue" and so on.
The Peggle game engine will ask the physics engine: "hey, what will the state of the current object be in the next tick?" and the physics engine will answer with like "move this object here; this object collides with that object so the new position is here" and so on.
Note that you must build all of these from scratch -- this means no external libraries, and you cannot use physics engine related libraries such as SpriteKit and UIKit Dynamics.

Why do we do this? We believe that designing such a complex system allows you to apply and hone your software engineering skills. Besides, it is always fun to build something that you take for granted, from scratch! (In the same line, if you have free time, it's fun to build your own SQL engine, or your own web server, or your own compiler.)

In the final problem set, you will be required to bundle the physics engine as its own library to be used in your final game. Imagine that you are part of a big game company that produces many games. Other teams in your company should be able to import the physics engine and create their own games out of it. Hence, be sure to practice separation of code properly.

In the following subsections, we are going to provide some pointers on how to build such a stack.

The Physics Engine
The physics engine simulates physics interactions between objects. This include things like object movement and collision.

Having the physics engine as a separate layer from the game engine allows you to build other game engines on top of the physics engine. For example, you should not only be able to build a Peggle game engine on top of it, but also possibly Bubble Blast, Angry Birds, or Mario Bros!

Note that building a physics engine that is too general might be too overkill for this assignment. You are to decide what features your physics engine supports; the only requirement is that the physics engine is enough to build the Peggle game. Nevertheless, we will require additional features in the final problem set, and if your design is not general enough and it is not easily extensible, you will face difficulties in implementing these additional features.

You are again reminded not to use other libraries such as SpriteKit. Nevertheless, it is always a good idea to draw inspiration from such libraries. Take a look at what APIs does SpriteKit and other physics engines expose!

If you do not have a physics background or have forgotten your physics classes, here are some things that you might want to research:

What are vectors? How do you calculate the angle between two vectors?
Suppose a particle is in a certain position (x, y) represented by a vector. This particle has a velocity (vx, vy) and acceleration (ax, ay). In t seconds, what will be its new position, new velocity, and new acceleration?
Suppose two particles with certain velocity and acceleration collide at a certain point. What would be its new velocity and acceleration?
You may also read up on the bouncing ball problem for more understanding on how to make a ball bounce.
The Peggle Game Engine
On top of the physics engine, you need to build the game engine. Peggle-specific logic will come in this layer, such as:

What pegs are
What the ball is
Launching the ball
Lighting up pegs when hit by a ball
Removing the ball once it goes out of bounds
The Renderer
Finally, you need to render the game onto the screen. In the context of MVC, the physics engine and the Peggle game engine are the model: they model the domain logic, and they can be presented with anything (be it a web app, ASCII art, etc). The renderer would act as the view, throwing whatever the state of the game engine is onto the screen.

In the context of iOS development, you can, again, use either SwiftUI or Storyboards (i.e. UIKit).

The Game Loop
To run the game, we need to build a game loop. This game loop runs many times every second (depending on the framerate of your game, typically 60 FPS or frames per second); on each time, the game will advance to the next step. This article provides an excellent explanation of how the game loop works.

In the context of iOS development, you are recommended to make use of CADisplayLink. Unlike other mechanisms of timing, CADisplayLink syncs with the display refresh directly.

Part 1: Explain your Design (25 points)
Similar to the previous problem set, please come up with a developer guide, as well as at least 2 scenarios where you make a trade-off. For more information, please refer to the previous problem set.

The dev guide makes up 15 points and the trade-off explanations make up 10 points.

Part 2: Gameplay (85 points)
Now that we have finished designing, let us create the game. The game should have the following features.

Ball Launch (15 points)
In the game, a ball should be launched from the top-center of the screen. The player should be able to decide at which direction the ball should be launched. However, the ball should only launch downwards, never upwards, even with the help of gravity.

You get to decide the best way for the player to input a direction and launch the ball, but please explain how the player is supposed to go about doing so in your README.md file. You are also provided with a sprite of a cannon that you can use if you wish. However, this sprite is only needed in Problem Set 4. Note that the cannon.png is a spritesheet, you only need to implement one cannon.

Ball Movement (20 points)
Once the ball is launched, it should move according to the laws of physics. Specifically, the ball should be subjected to a downward acceleration (gravity) and the force from the initial launch. In layman terms, the movement of the ball should be affected by both the gravity and the initial direction of the ball.

Thankfully, we are not a physics class, so we are not concerned with the accuracy of your physics simulation. We only require a visually sensible and reasonable movement of the ball (no polygonal movements, please). Of course, following some physics theorems may be easier than inventing your own.

Ball Collision (20 points)
Once the ball touches a wall or peg, the ball should bounce away in a natural and reasonable manner. Ideally, your implementation should demonstrate that our bouncy ball is indeed bouncy (not just micro-bounces, please). You may refer to this page as a starting point in your research on the bouncing ball problem.

Peg Lighting (15 points)
Once the ball touches a peg, the peg should light up, indicating that the ball has hit the peg. Once a peg is lit, it should remain lit.