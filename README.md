# 2PSports

### A Node.js Web app

## Overview:

Currently a platform for people seeking opponents for tennis, ping pong or squash.  Users sign in, choose a sport and pick their choice of locations by dragging a marker around the map and placing pins. Pins of potential opponents for their sport of choice are made visible. The user can then click on a pin to get more information about their prospective opponent. This includes, name, gender, experience level, available times and a contact email. After a choice is made they may contact the  other person by email or wait for someone to contact them.

The UI was created from a Dreamweaver enterprise template recommended by a friend. The enterprise template was designed with bootstrap 4 and the layout is very approachable to a novice.

## Front End: 
When a user signs in, a session is created and the sign in div is collapsed leaving the map and the sport icons that can be selected. A welcome message to the user appears in the header and the sign out button is activated. When the sign out button is clicked. The page refreshes completely and all state is lost. If the user has selected a sport, they may place up to three pins on the map at locations where they would like to play.  

Customer pins appear as flags to distinguish them from other pins. They are set to appear on top of other pins in the same location. Customer pins can be moved deleted and resubmitted. There is still work to be done on limiting the number of pins that can be placed for the same sport.  I want to make it three per sport for all sessions. But I ran out of time.

A player can place pins for as many sports as they like. When the icon for another sport is clicked, all pins from the previous from including the player’s are removed from the map but remain in the server database. Pins for the opponents have an information window that can be displayed by clicking the pin as mentioned in the introduction. Opponent pins cannot be moved or deleted.

To share chosen marker locations with opponents, a player clicks the ‘Submit Locations’ button near the bottom left of the map and pin locations are sent to the server. 

The instructions button shows step by step instructions for using the app.

## Back End:
The back end uses socket.io for communication with the client side. 

- On sign up or sign in message is sent to server and server responds with an error message or a ‘login success’ message along with client name and id. The client then updates the name and id variables for the session.

- When a sport image icon is clicked a ‘map load’ message is sent to the server and a response of all of the pins for that sport and customer information is sent to the client. Pins for the customer in the session are excluded.

### The database consists of two tables:

- Customer Info: (id, name, email, gender, password)
- Pins: (id, sport, skillLevel, position)

I should really have a password table as well, but that will be for another time.

## Loose ends:
This might be a good side project. 

I need to improve the database schema, and make the signup and password storage more robust. 
-	I don’t check for password length.
-	I don’t check for email format. 
-	I need to figure out how to manage the number of pin locations. I can think of lots of alternatives.

Instead of contact by email, I would like players be able to message each other through the app. And for messages from opponents to be stored while a player is not in session.

For scalability, I need to figure out how to display pins more selectively, maybe with tiling, so that I can avoid long pin request delays.
