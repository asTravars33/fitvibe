var backgroundsShown=false;
var participantsShown=false;
var message="";
var curRendered="";

function toggleParticipants(){
    var people = document.getElementById("participants-div");
    if(participantsShown){
        people.style.visibility = "hidden";
        participantsShown = false;
    }
    else{
        people.style.visibility = "visible";
        participantsShown = true;
    }
}
function toggleBackgrounds(){
    var pics=document.getElementById("background-pics");
    var msg=document.getElementById("choose-background");
    var coin=document.getElementById("coin-count");
    if(!backgroundsShown){
        pics.style.visibility="visible";
        msg.innerHTML = "<center><p>Hide backgrounds</p></center>";
        msg.style.gridColumn = "6/12";
        coin.style.visibility="hidden";
        backgroundsShown=true;
    }
    else{
        pics.style.visibility="hidden";
        msg.innerHTML = "<center><p>Choose background</p></center>";
        msg.style.gridColumn = "9/14";
        coin.style.visibility="visible";
        backgroundsShown=false;
    }
}
function goto(itemName, itemId, index, url){
    curRendered = document.getElementById("inner").innerHTML;
    console.log(index);
    current_item_id = itemId;
    var row=Math.floor(index/4)%3;
    var col=index%4;
    var elem=document.getElementById("avatar-rest");
    elem.style.gridRow = (4+(3*row))+"/"+(8+(3*row));
    elem.style.gridColumn= (4+(6*col))+"/"+(6+(6*col));
    setTimeout(function(){
        var ajax_params={
            'url': 'https://temp-2023jwang.sites.tjhsst.edu/doexercise?url='+url,
            'method': 'get',
            'success': onExerciseSuccess
        };
        $.ajax(ajax_params);
    }, 1000);
}
function onExerciseSuccess(responseString){
    participantsShown = true;
    document.getElementById("inner").innerHTML = responseString;
}
function toggleSchedule(){
    var elem=document.getElementById("block-schedule");
    var msg=document.getElementById("schedule");
    if(elem.style.visibility=="visible"){
        elem.style.visibility = "hidden";
        msg.innerHTML = message;
    }
    else{
        elem.style.visibility = "visible";
        message = msg.innerHTML;
        msg.innerHTML = "<center><p>Hide Schedule</p></center>";
    }
}
function submitSchedule(){
    console.log($("form").serialize());
    $.ajax({
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/updateschedule?'+$("form").serialize(),
        'method': 'get',
        'success': scheduleUpdatedSuccess
    });
}
function scheduleUpdatedSuccess(responseString){
    document.getElementById("block-schedule").innerHTML = responseString;
}
function finishWorkout(){
    $.ajax({
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/addcoin',
        'method': 'get',
        'success': coinsGivenSuccess
    });
}
function coinsGivenSuccess(responseString){
    document.getElementById("inner").innerHTML = curRendered;
    setTimeout(function(){
        document.getElementById("coin-count").innerHTML = responseString;
    }, 500);
}
function showScheduled(){
    var cur=new Date();
    var days=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    $.ajax({
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/getexercise?day='+days[cur.getDay()],
        'method': 'get',
        'success': onFetchSuccess
    });
}
function onFetchSuccess(responseString){
    console.log(responseString);
    document.getElementById("schedule").innerHTML = "<center><p>Today: "+responseString+"</p></center>";
}
function generateRec(){
    var recommended = "time=30&exercise=Aerobic%20Exercise&time=30&exercise=Stretching&time=30&exercise=Strengthening%20Exercise&time=&exercise=&time=30&exercise=Aerobic%20Exercise&time=30&exercise=Strengthening%20Exercise&time=&exercise=";
    $.ajax({
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/updateschedule?'+recommended,
        'method': 'get',
        'success': scheduleUpdatedSuccess
    });
}

showScheduled();