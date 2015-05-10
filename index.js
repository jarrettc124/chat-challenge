var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var usernames = [];

app.set('port', (process.env.PORT || 5000));


server.listen(app.get('port'), function() {
  console.log("Chat app is running at localhost:"+app.get('port'));
});

//Router
app.get('/', function(request, response) {
  response.sendFile(__dirname+'/index.html');
});

//Functions
function embedLink(str) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = str.match(regExp);

    if (match && match[2].length == 11) {
    
    
    	var myCode = str+'<br><iframe width="560" height="315" src="//www.youtube.com/embed/' + match[2] + '" frameborder="0" allowfullscreen></iframe>';
    	return myCode;        
        
        
    } else {
        return str;
    }
    
}



//Listen for socket connection
io.sockets.on('connection', function (socket) {

	// when the client emits 'sendMessage', this listens and executes
	socket.on('sendMessage', function (data) {
		// updateChat to clients 
		
		//Check for embedded link
		var message =  embedLink(data);
		
		
		io.sockets.emit('updateChat', socket.username, message);
	});

	socket.on('addNewUser', function(data, callback){
				
		
		if(usernames.indexOf(data)!=-1){
			//If the username client entered is not in the usernames array
			calllback(false);
		}else{
			socket.username = data;
			usernames.push(data);
			callback(true);
		}
		
		
	});
	
	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});