var express=require('express');
var http=require('http');
var app=express();

//I shouldn't have had to add localhost but I did???
var server=http.createServer(app).listen(8080,'localhost');//process.env.PORT);
var io=require('socket.io').listen(server);

app.use(express.static(__dirname+'/public'));
//the * in place of a URI makes it the default I think?
app.get('*',function(request,response){
response.redirect('Default.html');
});

// the list of users is a js object so that it can be updated and sent to clients each time a new client connects
// the conversation list is updated by directly changing the html doc, 
//this means that each client's html doc is different because it starts blank and adds what happens after connections
var users={};

// I think connection is sent from express when a new client connects
// everything is sockets.on is done for each client (socket) so it deals with
// events from different clients depending on the username and stuff
io.sockets.on('connection',function(socket){
//
	socket.on('sendChat',function(data){
		io.sockets.emit('updateChat',socket.username,data);
	});

	socket.on('addUser',function(username){
		socket.username=username;
		//they key (in users[key]) is set to the same as the value (=value), this means:
		//in the users object we have a list of key-value pairs where they key and value are identical
		//I think a list called usernames could have been used but may have taken more code or somehting?
		users[username]=username;
		// the 'chat service' is just a username place holder that tells the user the message was sent from the service
		socket.emit('updateChat','chat service','you are connected');
		socket.broadcast.emit('updateChat',username,'has connected');
		io.sockets.emit('updateUsers',users);
	});
	//disconnect is sent when the client shuts down, like connect it may be built into express?
	socket.on('disconnect',function(){
		delete users[socket.username];
		socket.broadcast.emit('updateChat',socket.username,'has disconnected');
		io.sockets.emit('updateUsers',users);
	});
	console.log('New client has been connected');
//
})

