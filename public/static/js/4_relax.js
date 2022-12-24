var curNum=0;
var paths_arr = null;
var current_item_id = 0;

/* color variables */
var target_cols = new Map();
var cur_cols = new Map();
var most_recent_selected_color="#000000";
var recent_path = null;

/* reveal variables */
var actual_cols = new Map();
var paths_colored = 0;

/* socket */
var socket = io("https://temp-2023jwang.sites.tjhsst.edu");
var id=0;
socket.on('connnection');
socket.on('saveId', function(data){
    id=data;
    console.log("Saved: "+id);
});
socket.on('addMember', function(data){
    const coloringPage = document.createElement("div");
    coloringPage.innerHTML = "<center>{{> (lookup . '"+data.name+"')}}</center>";
    coloringPage.id = "pic"+data.memberId;
    document.getElementById("session").appendChild(coloringPage);
});

/* fill in extra shelves */
function fill(num){
    curNum=num;
    var ajax_params={
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/fill?num='+num,
        'method': 'get',
        'success': onFillSuccess
    };
    $.ajax(ajax_params);
}
function onFillSuccess(responseString){
    document.getElementById("shelves-extra").innerHTML = responseString;
}
/*function goto(itemId){
    var rect = document.getElementById(itemId).getBoundingClientRect();
    var elem = document.getElementById("avatar-rest");
    console.log(rect.top);
    console.log(rect.left);
    elem.style.top = rect.top+"px";
    elem.style.left = rect.left+"px";
}*/
function gotoColor(itemName, itemId, index){
    console.log(index);
    console.log("GOING TO: "+itemId);
    current_item_id = itemId;
    var row=Math.floor(index/4)%3;
    var col=index%4;
    var elem=document.getElementById("avatar-rest");
    elem.style.gridRow = (4+(3*row))+"/"+(8+(3*row));
    elem.style.gridColumn= (4+(6*col))+"/"+(6+(6*col));
    setTimeout(function(){
        var ajax_params={
            'url': 'https://temp-2023jwang.sites.tjhsst.edu/color?itemName='+itemName+"&itemId="+itemId,
            'method': 'get',
            'success': onColorSuccess
        };
        $.ajax(ajax_params);
    }, 1000);
}
function gotoReveal(itemName, index){
    console.log(index);
    var row=Math.floor(index/4)%3;
    var col=index%4;
    var elem=document.getElementById("avatar-rest");
    elem.style.gridRow = (4+(3*row))+"/"+(8+(3*row));
    elem.style.gridColumn= (4+(6*col))+"/"+(4+(6*col));
    setTimeout(function(){
        var ajax_params={
            'url': 'https://temp-2023jwang.sites.tjhsst.edu/reveal?itemName='+itemName,
            'method': 'get',
            'success': onRevealSuccess
        };
        $.ajax(ajax_params);
    }, 1000);
}
function onColorSuccess(responseString){
    document.getElementById("inner").innerHTML = responseString;
    colorPrep();
}
function onRevealSuccess(responseString){
    console.log("success");
    document.getElementById("inner").innerHTML = responseString;
    revealPrep();
}

/* Change the type of coloring page displayed */

function showColor(){
    var ajax_params={
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/showcolor',
        'method': 'get',
        'success': onShowColorSuccess
    };
    $.ajax(ajax_params);
}
function onShowColorSuccess(responseString){
    document.getElementById("inner").innerHTML = responseString;
    fill(curNum);
}

function showReveal(){
    var ajax_params={
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/showreveal',
        'method':'get',
        'success': onShowRevealSuccess
    };
    $.ajax(ajax_params);
}
function onShowRevealSuccess(responseString){
    document.getElementById("inner").innerHTML = responseString;
    fill(curNum);
}

/* coloring mode */
function colorPrep(){
    cur_cols.clear();
    target_cols.clear();
    most_recent_selected_color="#000000";
    $('#color-input').on('input', function(){
        most_recent_selected_color = document.getElementById('color-input').value;
    });
    $('#default-fill').on('click', showDefault);
    console.log("CURRENT ITEM ID: "+current_item_id);
    var ajax_params={
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/retrieve-colors?itemId='+current_item_id,
        'method': 'get',
        'success': onColorPrepResponse
    };
    $.ajax(ajax_params);
}
function onColorPrepResponse(responseObject){
    console.log(responseObject);
    var paths = document.querySelectorAll('path');
    paths_arr = Array.from(paths);
    paths_arr.forEach(function(elem){
        target_cols.set(elem.id, elem.style.fill);
        elem.style.stroke = "black";
        elem.style.strokeWidth = "1px";
        elem.addEventListener('click', pathClick);
    });
    if(responseObject.length===0){
        paths_arr.forEach(function(cur){
            cur.style.fill = '#ffffff';
            cur_cols.set(cur.id, "#ffffff");
        });
    }
    else{
        responseObject.forEach(function(elem){
            var path=document.getElementById(elem.pathId);
            path.style.fill = elem.curColor;
            cur_cols.set(path.id, elem.curColor);
        });
    }
}
function pathClick(){
    console.log(most_recent_selected_color)
    this.style.fill = most_recent_selected_color;
    cur_cols.set(this.id, most_recent_selected_color);
    console.log(cur_cols);
}
function showDefault(){
    paths_arr.forEach(function(elem){
        var targ = target_cols.get(elem.id);
        elem.style.fill = targ;
    });
    document.getElementById("default-fill").innerHTML = "<center><p>Return</p></center>";
    $('#default-fill').on('click', returnColors);
}
function returnColors(){
    paths_arr.forEach(function(elem){
        var targ = cur_cols.get(elem.id);
        elem.style.fill = targ;
    });
    document.getElementById("default-fill").innerHTML = "<center><p>Show Original</p></center>";
    $('#default-fill').on('click', showDefault);
}
function saveProgress(itemId){
    console.log("HEFDJFKLDSJFKDSL: "+itemId);
    //prepare the String
    var pathColors="";
    cur_cols.forEach(function(value, key){
        pathColors+=key+":"+value.substring(1)+";";
    });
    console.log(cur_cols);
    console.log(pathColors);
    var ajax_params={
        'url': 'https://temp-2023jwang.sites.tjhsst.edu/save_color?itemId='+itemId+'&colors='+pathColors,
        'method': 'get',
        'success': onSaveColorSuccess
    };
    $.ajax(ajax_params);
}
function onSaveColorSuccess(responseString){
    console.log("Saved");
}

/* reveal mode */
function revealPrep(){
    actual_cols.clear();
    var paths = document.querySelectorAll('path');
    paths_arr = Array.from(paths);
    paths_arr.forEach(function(elem){
        actual_cols.set(elem.id, elem.style.fill);
        elem.style.fill = '#2D2F31';
        elem.addEventListener("mouseover", reveal);
    });
}

function reveal(){
    this.style.fill=actual_cols.get(this.id);
    paths_colored++;
}