const express = require('express');
const app = express();
const datastore = require('nedb');
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(port, () => console.log(`running server at ${port}`));

const database = new datastore('database.db');
database.loadDatabase();

app.get('/', (req, res) => {
	res.json('HOME');
});

app.get('/check', (req, res) => {
	database.find(req.body, (err, data) => {
		if (err) {
			res.status(300).send(err);
			return;
		}
		if (data.length == 0) {
			res.status(200).json('USERNAME AVAILABLE');
		} else {
			res.status(300).json('USERNAME NOT AVAILABLE');
		}
	});
});
function createUser(username, cb) {
	database.find({}, (err, data) => {
		for (let ele of data) if (ele.username == username) return cb('user name exist');
		database.insert({ username: username });
		cb(null, 'USERNAME created');
	});
}
app.get('/signup', (req, res) => {
	if (!req.body.username) {
		res.status(300).json('wrong input format');
		return;
	}
	createUser(req.body.username, (err, data) => {
		if (err) {
			res.status(300).json('USERNAME EXIST');
			return;
		}
		res.json(data);
	});
});

function update(body, cb) {
	if (!body.sender || !body.receiver || !body.message)
		return cb({ error: 'sender or receiver or message spelled wrong' });
	var sender, receiver, message;

	sender = body.sender;
	receiver = body.receiver;
	message = body.message;
	var sender_id = null,
		receiver_id = null;
	database.find({}, (err, data) => {
		for (let ele of data) {
			if (ele.username == receiver) {
				receiver_id = ele._id;
				console.log(ele._id);
			}
			if (ele.username == sender) sender_id = ele._id;
		}
		if (!sender_id || !receiver_id) return cb('sender or reciever is missing from db');

		database.update(
			{ _id: sender_id },
			{ $push: { chats: { sender: sender, receiver: receiver, message: message } } },
			{},
			(err, data) => {
				console.log(data);
			}
		);
		database.update(
			{ _id: receiver_id },
			{ $push: { chats: { sender: sender, receiver: receiver, message: message } } },
			{},
			(err, data) => {
				console.log(data);
			}
		);
		cb(null, 'sent');
	});
}
app.get('/send', (req, res) => {
	update(req.body, (err, data) => {
		if (err) {
			res.json(err);
			return;
		}
		res.json(data);
	});
});
function getchats(body, cb) {
	if (!body.sender || !body.receiver) return cb({ error: 'sender or receiver spelled wrong' });
	var sender, receiver;

	sender = body.sender;
	receiver = body.receiver;
	database.find({ username: receiver }, (err, data) => {
		if (data.length <= 0) {
			return cb({ error: true }, null);
		}
		data = data[0].chats;
		var result = [];
		for (let ele of data) {
			if (ele.sender == sender || ele.receiver == sender) {
				result.push(ele);
			}
		}
		cb(null, result);
	});
}

app.get('/chats', (req, res) => {
	getchats(req.body, (err, data) => {
		if (err) {
			res.json(err);
			return;
		}
		res.json(data);
	});
});
