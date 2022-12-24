/*var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(event) {
    if(event.keyCode == 39) {
        rightPressed = true;
    }
    else if(event.keyCode == 37) {
        leftPressed = true;
    }
    if(event.keyCode == 40) {
    	downPressed = true;
    }
    else if(event.keyCode == 38) {
    	upPressed = true;
    }
}*/

document.getElementById("first").addEventListener("mouseover", changeColor);

function changeColor(){
    this.style.backgroundColor="orange";
}