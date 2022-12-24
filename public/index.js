#!/usr/bin/nodejs

// initialize express and app class object
var express = require('express');
var app = express();
var mysql = require('mysql');
//var server = require('https').createServer(app);

/*// socket.io 
var colorSessions = {};
var sessionMembers = {};
const io = require("socket.io")(server, {cors: {origin: "*"}});

io.on('connection', function(socket){
    console.log("New User");
    var socketId = Math.random();
    socket.emit('saveId', socketId);
})*/
// initialize handlebars templating engine
var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.use(express.static('static'));
hbs.registerHelper("entry", function(arg, options) {
    var ret="<form>";
    for(var prop in arg){
        ret = ret+"<span>"+prop+":   </span>";
        var ind=arg[prop].indexOf(" ");
        var type=arg[prop].substring(ind+1);
        ret = ret+"<input name=time class=number-input type=number value="+arg[prop].substring(0, ind)+">";
        ret=ret+"<span>min </span>";
        ret = ret+'<select name="exercise">';
        ret = ret+'<option value="Aerobic Exercise"'+(type=="Aerobic Exercise"?"selected":"")+'>Aerobic Exercise</option>';
        ret = ret+'<option value="Strengthening Exercise"'+(type=="Strengthening Exercise"?"selected":"")+'>Strengthening Exercise</option>';
        ret = ret+'<option value="Stretching"'+(type=="Stretching"?"selected":"")+'>Stretching</option>';
        ret = ret+'</select>';
        ret = ret+"<br>";
    }
    ret = ret+'<button onclick="submitSchedule()">Update</button>';
    ret = ret+'<button onclick="generateRec()">Generate Recommended</button>';
    ret = ret+"</form>";
    return ret;
});

// initialize the built-in library 'path'
var path = require('path');
console.log(__dirname);
app.use(express.static(path.join(__dirname,'static')));

//cookies
var cookieSession = require('cookie-session');
app.set('trust proxy', 1);
app.use(cookieSession({
    name: 'encr',
    keys: ['tAr3]DhKVtV+md?e', 'D3w8ATmew;7^B2y', 'f^hw8,g-K;duS:L:']
}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// -------------- mysql initialization -------------- //
var sql_params = {
  connectionLimit : 10,
  user            : process.env.DIRECTOR_DATABASE_USERNAME,
  password        : process.env.DIRECTOR_DATABASE_PASSWORD,
  host            : process.env.DIRECTOR_DATABASE_HOST,
  port            : process.env.DIRECTOR_DATABASE_PORT,
  database        : process.env.DIRECTOR_DATABASE_NAME
};

var pool  = mysql.createPool(sql_params);
app.locals.pool = pool;

hbs.registerHelper('fill', function(num, options){
    var result="";
    for(i=0; i<num; i++){
        result+=options.fn('<div class="shelf"></div>');
    }
    return result;
});

// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

// SSE //
/*app.get('/stream', function(req, res){
    res.writeHead(200, {
 'Content-Type' : 'text/event-stream',
 'Cache-Control' : 'no-cache',
 'Connection' : 'keep-alive'
 });
    send(res, 0);
});
function send(res, idx){
    res.write("data: "+"hello"+idx+"!\n\n");
    setTimeout(() => send(res, idx+1), 1000);
}*/
// Other endpoint handlers 
app.get('/', function(req, res){
    res.render('0_homepage', {'func': "show_login()", 'message': 'Have an account? Log in instead!'});
});
app.get('/login-box', function(req, res){
    res.render('0_login_box');
});
app.get('/signup', function(req, res){
    email = req.query.username;
    password = req.query.password;
    username = "hello";
    var sql="CALL addUser(?,?,?);";
    console.log("Calling add user.");
    pool.query(sql, [username, email, password], function(error, results, fields){
        console.log(results);
        if(results!==undefined && results[0]!==undefined){
            req.session.profile = results[0][0];
            res.redirect('./menu')
        }
        else{
            res.render('0_homepage', {'func': "show_login()", 'message': "There is an account associated with this username. Log in?"});
        }
    });
});
app.get('/login', function(req, res, next){
    const {email, password} = req.query;
    console.log(email);
    var sql="SELECT * FROM users WHERE email = ?;";
    pool.query(sql, [email], function(error, results, fields){
        if(results!==undefined && results[0]!==undefined){
            console.log("HERE");
            console.log(results);
            req.session.profile = results[0];
            res.locals.password = password;
            next();
        }
        else{
            res.render('0_homepage', {'func': "show_signup()", 'message': "This email does not exist. Create an account?"});
            return;
        }
    });
},
function(req, res, next){
    var sql="SELECT password FROM users WHERE userId=?;";
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        if(results[0].password==res.locals.password){
            res.redirect('./menu');
        }
        else{
            res.render('0_homepage', {'func': "show_login()", 'message': "Password is incorrect. Try again?"});
        }
    });
});
app.get('/signup-box', function(req, res){
    res.render('0_signup_box');
});
app.get('/menu', function(req, res){
    var sql = "DELETE FROM onExercise WHERE userId=?";
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        res.render('1_menu');
    });
});
app.get('/profile', function(req, res){
    var sql="CALL selectItems(?);";
    pool.query(sql, [req.session.profile.userId], function(error, results,fields){
        console.log("The results:");
        console.log(results);
        console.log(results[3]);
        var params={
            'profile': req.session.profile,
            'accessories': results[0],
            'backgrounds': results[1],
            'coloring': results[2]
        };
        Object.keys(results[3][0]).forEach(function(elem){
            if(results[3][0][elem]=="none"){
                params[elem+"-vis"]="hidden";
            }
            else{
                params[elem+"-vis"]="visible";
                params[elem+"-color"]=results[3][0][elem];
            }
        });
        res.render('2_profile', params);
    });
});
app.get('/buy', function(req, res, next){
    var sql="CALL spend(?,?,?,?,?);";
    console.log("Hie");
    console.log(req.query);
    pool.query(sql, [parseInt(req.session.profile.userId), parseInt(req.query.id), parseInt(req.query.cost), parseInt(req.query.type), req.query.name],function(error, results,fields){
        console.log(results);
        req.session.profile.coins=results[0][0].coins;
        next();
    });
},
function(req, res, next){
    var sql="CALL selectItems(?);";
    pool.query(sql, [req.session.profile.userId], function(error, results,fields){
        var params={
            'profile': req.session.profile,
            'accessories': results[0],
            'backgrounds': results[1],
            'coloring': results[2]
        };
        Object.keys(results[3][0]).forEach(function(elem){
            if(results[3][0][elem]=="none"){
                params[elem+"-vis"]="hidden";
            }
            else{
                params[elem+"-vis"]="visible";
                params[elem+"-color"]=results[3][0][elem];
            }
        });
        res.render('2_profile_inner', params);
    });
});
app.get('/avatar', function(req, res){
    console.log(req.query);
    var newInfo="";
    Object.keys(req.query).forEach(function(elem){
        newInfo+=elem+":"+req.query[elem]+";";
    });
    var sql="CALL updateAvatar(?,?);";
    pool.query(sql, [req.session.profile.userId, newInfo], function(error, results, fields){
        res.send("yay");
    });
});
app.get('/updateprofile', function(req, res){
    const {username, email, password} = req.query;
    var sql="CALL updateUser(?,?,?,?);";
    pool.query(sql, [req.session.profile.userId, username, email, password], function(error, results, fields){
        console.log(results);
        req.session.profile = results[0][0];
        res.render('2_profile_info', {'profile': req.session.profile});
    });
});
app.get('/relax', function(req, res){
    var sql="CALL selectPurchased(?,3);";
    var num=0;
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        if(results[0].length<15){
            num=15-results[0].length;
            console.log(num);
        }
        var params={
            'coloring-pages': results[0],
            'num': num
        };
        Object.keys(results[1][0]).forEach(function(elem){
            if(results[1][0][elem]=="none"){
                params[elem+"-vis"]="hidden";
            }
            else{
                params[elem+"-vis"]="visible";
                params[elem+"-color"]=results[1][0][elem];
            }
        });
        res.render('4_relax', params);
    });
});
app.get('/fill', function(req, res){
    var num=parseInt(req.query.num);
    var result="";
    for(i=0; i<num; i++){
        result+='<div class="shelf"></div>';
    }
    res.send(result);
});
app.get('/color', function(req, res){
    const {itemName, itemId} = req.query;
    res.render('4_relax_color', {'content': itemName+"_color", 'itemId': itemId});
});
app.get('/reveal', function(req, res){
    var itemName = req.query.itemName;
    res.render('4_relax_reveal', {'content': itemName+"_reveal"})
});
app.get('/showcolor', function(req, res){
    var sql="CALL selectPurchased(?,3);";
    var num=0;
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        if(results[0].length<15){
            num=15-results[0].length;
            console.log(num);
        }
        var params={
            'coloring-pages': results[0],
            'num': num
        };
        Object.keys(results[1][0]).forEach(function(elem){
            if(results[1][0][elem]=="none"){
                params[elem+"-vis"]="hidden";
            }
            else{
                params[elem+"-vis"]="visible";
                params[elem+"-color"]=results[1][0][elem];
            }
        });
        res.render('4_relax_color_selection', params);
    });
});
app.get('/showreveal', function(req, res){
    var sql="CALL selectPurchased(?,3);";
    var num=0;
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        if(results[0].length<15){
            num=15-results[0].length;
            console.log(num);
        }
        var params={
            'coloring-pages': results[0],
            'num': num
        };
        Object.keys(results[1][0]).forEach(function(elem){
            if(results[1][0][elem]=="none"){
                params[elem+"-vis"]="hidden";
            }
            else{
                params[elem+"-vis"]="visible";
                params[elem+"-color"]=results[1][0][elem];
            }
        });
        res.render('4_relax_reveal_selection', params);
    });
});
app.get('/save_color', function(req, res){
    const {itemId, colors} = req.query;
    console.log(req.query);
    console.log("HEREY: "+req.session.profile.userId);
    var sql="CALL updatePathColors(?,?,?);";
    pool.query(sql, [req.session.profile.userId, itemId, colors], function(error, results, fields){
        res.send("Success");
    });
});
app.get('/retrieve-colors', function(req, res){
    var itemId = req.query.itemId;
    console.log("ITEM ID: "+itemId);
    var sql="SELECT pathId, curColor FROM pathColors WHERE userId = ? AND itemId = ?;";
    pool.query(sql, [req.session.profile.userId, itemId], function(error, results, fields){
        res.json(results);
    });
});
app.get('/try', function(req, res){
    res.render('test');
});

//EXERCISE
app.get('/exercise', function(req, res, next){
    if(!('background-input' in req.query)){
        var sql="SELECT * FROM videos WHERE background=?;";
        pool.query(sql, ["beach"], function(error, results, fields){
            res.locals.vids = results;
            next();
        });
    }
    else{
        var sql="SELECT * FROM videos WHERE background=?;";
        pool.query(sql, [req.query["background-input"]], function(error, results, fields){
            res.locals.vids = results;
            next();
        });
    }
}, 
function(req, res, next){
    var sql = "DELETE FROM onExercise WHERE userId=?";
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        next();
    });
},
function(req, res, next){
    var sql="SELECT Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday FROM schedules WHERE userId=?;";
    var cur=new Date();
    var days=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        res.locals.schedule = results[0];
        res.locals.today = results[0][days[cur]];
        next();
    });
},
function(req, res, next){
    var sql="CALL selectPurchased(?,2);";
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        var params={
            'available-backgrounds': results[0], 
            'exercise-videos': res.locals.vids,
            'profile': req.session.profile,
            'schedule': res.locals.schedule,
            'today': res.locals.today
        };
        Object.keys(results[1][0]).forEach(function(elem){
            if(results[1][0][elem]=="none"){
                params[elem+"-vis"]="hidden";
            }
            else{
                params[elem+"-vis"]="visible";
                params[elem+"-color"]=results[1][0][elem];
            }
        });
        console.log(res.locals.vids);
        res.render('3_exercise', params);
    });
});
app.get('/getexercise', function(req, res){
    var sql="SELECT * FROM schedules WHERE userId=?;";
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        res.send(results[0][req.query.day]);
    });
});
app.get('/doexercise', function(req, res){
    var sql = "CALL connectToExercise(?, ?);";
    req.session.curURL = req.query.url;
   // var sql= "INSERT INTO onExercise VALUE (?, ?);";
    pool.query(sql, [req.query.url, req.session.profile.userId], function(error, results, fields){
        console.log("HERE we go");
        console.log(results);
        participants = [];
        results[0].forEach(function(entry){
            stuff = {};
            Object.keys(entry).forEach(function(elem){
                if(entry[elem]=="none"){
                    stuff[elem+"-vis"]="hidden";
                }
                else{
                    stuff[elem+"-vis"]="visible";
                    stuff[elem+"-color"]=entry[elem];
                }
            });
            participants.push(stuff);
        })
        res.render('3_exercise_video', {'url': req.query.url, 'participants': participants});
    });
});
app.get('/updateschedule', function(req, res){
    console.log(req.query);
    const {time, exercise} = req.query;
    var sql_params=[req.session.profile.userId];
    for(i=0; i<time.length; i++){
        sql_params.push(time[i]+" "+exercise[i]);
    }
    var sql="CALL updateSchedule(?,?,?,?,?,?,?,?);";
    pool.query(sql, sql_params, function(error, results, fields){
        res.render('3_exercise_schedule');
    });
});
app.get('/addcoin', function(req, res, next){
    var sql="UPDATE users SET coins=coins+30 WHERE userId=?;";
    req.session.profile.coins = req.session.profile.coins+30;
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        next();
    });
}, 
function(req, res, next){
    var sql = "DELETE FROM onExercise WHERE userId=?";
    pool.query(sql, [req.session.profile.userId], function(error, results, fields){
        res.render('3_exercise_coins', {'coins': req.session.profile.coins});
    })
});
app.get('/holiday', fuction(req, res)){
    res.render('holiday');
}
var listener = app.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", function() {
    console.log("Express server started");
});