var most_recent_selected_color='#ffffff';
var cur_cols = new Map();
var bought_avatar = false;

function begin(){
    var paths=document.querySelectorAll('path');
    var paths_arr=Array.from(paths);
    
    paths_arr.forEach(function(elem){
        elem.addEventListener('click', path_click);
    });
    
    $('#color-input').on('input', function(){
        most_recent_selected_color = document.getElementById('color-input').value;
        console.log(most_recent_selected_color);
    });
    
    var ids=["skin", "shirt", "pants", "shoes"];
    for(var i=0; i<ids.length; i++){
        cur_cols[ids[i]]=document.getElementById(ids[i]).getAttribute('fill');
    }
    console.log(cur_cols);
}
function path_click(){
    console.log("In path click");
    console.log(this.id);
    this.setAttribute('fill', most_recent_selected_color);
    cur_cols[this.id]=most_recent_selected_color;
}
function buy(cost, id, type, name){
    var ajax_params={
        'url': "https://temp-2023jwang.sites.tjhsst.edu/buy?cost="+cost+"&id="+id+"&type="+type+"&name="+name,
        'method': "get",
        'success': onServerResponse
    };
    if(type==1){
        bought_avatar = true;
    }
    $.ajax(ajax_params);
}
function onServerResponse(responseString){
    document.getElementById("inner").innerHTML = responseString;
    if(bought_avatar){
        var paths=document.querySelectorAll('path');
        var paths_arr=Array.from(paths);
        
        paths_arr.forEach(function(elem){
            elem.addEventListener('click', path_click);
        });
        $('#color-input').on('input', function(){
            most_recent_selected_color = document.getElementById('color-input').value;
            console.log(most_recent_selected_color);
        });
        bought_avatar = false;
    }
}
function saveAvatar(){
    var query="";
    var attributes=["shirt", "pants", "shoes", "hair"];
    attributes.forEach(function(elem){
        if(elem in cur_cols){
            query+="&"+elem+"="+cur_cols[elem].substring(1);
        }
    });
    var ajax_params={
        'url': "https://temp-2023jwang.sites.tjhsst.edu/avatar?skin="+cur_cols.skin.substring(1)+query,
        'method': "get",
        'success': onAvatarUpdated
    };
    $.ajax(ajax_params);
}
function onAvatarUpdated(reseponseString){
    console.log("Updated yay");
}
function updateUserInfo(){
    var username=document.getElementById("username").value;
    var email=document.getElementById("email").value;
    var password=document.getElementById("password").value;
    var ajax_params={
        'url': "https://temp-2023jwang.sites.tjhsst.edu/updateprofile?username="+username+"&email="+email+"&password="+password,
        'method': "get",
        'success': onUserUpdated
    };
    $.ajax(ajax_params);
}
function onUserUpdated(responseString){
    document.getElementById("profile-info").innerHTML = responseString;
}
begin();