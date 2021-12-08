
window.addEventListener('load', function() {

	//////////// SOCKET.IO /////////////////////////////////////////////////////// 

	const socket = io(); // NOTE: you MUST run by http://localhost:3000/index.html

	// [Client => Server] Send the data from client to server 
	function notifyToServer(event, data) {
		socket.emit(event, data);
	}

	// notifyToServer('CLIENT_TO_SERVER_EVENT', JSON.stringify({ name:'sridhar', age: 40}));


	// [Client <= Server] Receive data from server to client
	socket.on("SERVER_TO_CLIENT_EVENT", async (data) => {
		const obj = JSON.parse(data);
		console.log(obj);
	});

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
// pretty print


	{"name":"jay","age":7}



	db.inventory.insertMany([
		{ item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
		{ item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
		{ item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
	 ]);


	 '\n\t\t\tdb.inventory.insertMany([\n\t\t{ item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },\n\t\t{ item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },\n\t\t{ item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }\n\t ]);\t'

*/


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const collTxtAreaRef = document.querySelector('#collectionId');
	const queryRef = document.querySelector('#queryId');
	const resultRef = document.querySelector('#resultId');

	const runBtnRef = document.querySelector('#runBtnId');
	runBtnRef.addEventListener('click', onRunBtnClicked);
	const fillTestDataBtnRef = document.querySelector('#fillTestDataBtnId');
	fillTestDataBtnRef.addEventListener('click', onfillTestDataBtnClicked);

	function onfillTestDataBtnClicked(e) {
		// console.log(e.key);       // d
		// console.log(this.value);  // srid

		collTxtAreaRef.value = '{"name":"jay","age":7}';
		queryRef.value = 'find()';
	}

	

	function onRunBtnClicked(e) {
		// console.log(e.key);       // d
		// console.log(this.value);  // srid

		// Collection
		console.log(collTxtAreaRef.value); // "\t\t\t\t\t{ name:'Jay', \n\n\nage: 7 }\t\t"
		console.log(JSON.stringify(eval("(" + collTxtAreaRef.value + ")"))); // '{"name":"jay","age":7}'
		let collection = eval("(" + collTxtAreaRef.value + ")");

		// Query
		console.log(queryRef.value);
		var queryWithoutWhiteSpace = queryRef.value.replace(/(\t|\r\n|\n|\r)/g,"");
		console.log(queryWithoutWhiteSpace);

		// data package to server
		let data = {};
		data.collection = collection;
		data.query = queryWithoutWhiteSpace;

		notifyToServer('CLIENT_TO_SERVER_EVENT', JSON.stringify(data));
	}

	const collectionErrorRef = document.querySelector('#collectionErrorId');

	// [Client <= Server] Receive data from server to client
	socket.on("SERVER_TO_CLIENT_COLLECTION_ERROR", async (data) => {
		console.log(data);
		collectionErrorRef.textContent = "Collection Error: " + data;
	});

	socket.on("SERVER_TO_CLIENT_OUTPUT", async (data) => {
		console.log(data);
		resultRef.textContent = data;
	});


	











	function myFunction() 
	{ 
		var name, age; 
		name = document.getElementById("inputName").value;
		age  = parseInt(document.getElementById("inputAge").value);
		document.getElementById("displayElement").innerHTML = name +" " + age; 
	}
}); // window.addEventListener('load', function() {
