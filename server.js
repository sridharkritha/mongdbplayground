	const express = require("express");
	const app = express();
	const httpServer = require("http").createServer(app); // explicitly create a 'http' server instead of using express() server

	app.use(express.json()); // for body parsing

	const path = require('path');
	const { MongoClient } = require('mongodb');

	const PORT = process.env.PORT || 3000;
	app.use(express.static(path.join(__dirname,'clientSide')));

	//////////////////////////////////////// SOCKET.IO SETUP ///////////////////////////////////////////////////////////
	const io = require("socket.io")(httpServer);

	// [Server => Client(S)] Notify all the connected clients
	function notifyAllUser(event, data) {
		io.emit(event, data);
	}

	// Client request for a new connection
	io.on('connection', async (socket) => {
		console.log('Server: A new client connected to me !');

		// when client(browser) closed/disconnect from the server
		socket.on('disconnect', function() {
			console.log('A Client has closed / disconnected from the Server !');
		});

		let result = null;
		// [Client => Server] Receive data from client to server
		socket.on('CLIENT_TO_SERVER_EVENT', async (data) => {
			try {
				let obj = JSON.parse(data);
				// if (typeof obj === 'string')obj = JSON.parse(data);
				console.log(obj);

				// 1. Create new collection data
				result = await g_collection.updateOne({}, { $set: obj.collection }, { upsert: true });
				console.log(result);

				// https://stackoverflow.com/questions/30564053/how-can-i-synchronously-determine-a-javascript-promises-state
				// 2. Query the collection 
				let strFormQuery = 'await g_collection.' + obj.query;
				console.log(strFormQuery);
				strFormQuery = '(async () => {' + strFormQuery + '})();'; // wrap around async function
				result = eval(strFormQuery); // execute the query				
				// result = await g_collection.findp(); // execute the query
				console.log(result);

				// 3. Show the final output
				const cursor = await g_collection.find({}, {});
				// Store the results in an array
				const findResult = await cursor.toArray();
				notifyAllUser('SERVER_TO_CLIENT_OUTPUT', JSON.stringify(findResult, null, 2));
			}
			catch(error) {
				console.log(error);
				notifyAllUser('SERVER_TO_CLIENT_COLLECTION_ERROR', JSON.stringify({ errorType: error.name, errorMsg: error.message }));
			}
		});

		// Clear the database
		socket.on('CLIENT_TO_SERVER_CLEAR_DATABASE', async (data) => {
			try {
					let result = await g_collection.drop();
					console.log(result);
					notifyAllUser('SERVER_TO_CLIENT_CLEAR_DATABASE', JSON.stringify({'status': result }));
			}
			catch(error) {
				notifyAllUser('SERVER_TO_CLIENT_COLLECTION_ERROR', JSON.stringify({ errorType: error.name, errorMsg: error.message }));
			}
		});
	});

	//////////////////////////////////////// MONGODB CONNECTION SETUP //////////////////////////////////////////////////
	// 1. Mongo: Local database
	// const database = 'mongodb://localhost:27017/';
	// 2. Mongo: Atlas database
	// Connection URI <username>, <password>, and <your-cluster-url>.
	const databaseURI = 'mongodb+srv://sridharkritha:2244@cluster0.02kdt.mongodb.net/';
	const MONGO_DATABASE_NAME = 'mongodbplayground';
	const MONGO_COLLECTION_NAME = 'mycollection';       // collection to store all chats
	let g_collection = null;
	let g_mongoClient = null;
	//////////////////////////// SERVER IS LISTENING ////////////////////////////////////////////////////////////
	// Server listen at the given port number
	httpServer.listen(PORT, async () => {
		console.log("ChallengeBets P2P Betting Server is running on the port : " + httpServer.address().port);

		// The Mongo Client you will use to interact with your database
		g_mongoClient = new MongoClient(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true });

		try {
				await g_mongoClient.connect();
				console.log("Cluster connection                                      : Success");

				const DB = g_mongoClient.db(MONGO_DATABASE_NAME);
				if(!DB) {
					console.log(`Database - ${MONGO_DATABASE_NAME} - connection error`);
					return console.error(DB);
				}
				console.log(`Database(${MONGO_DATABASE_NAME}) connection        : Success`);

				g_collection = DB.collection(MONGO_COLLECTION_NAME);
				if(!g_collection) {
					console.log(`Collection - ${MONGO_COLLECTION_NAME} - connection error`);
					return console.error(g_collection);
				}
				console.log(`Collection(${MONGO_COLLECTION_NAME}) connection          : Success`);
		} catch(e) {
			console.error(e);
		}

	});