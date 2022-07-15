const express = require('express');
const datastore = require('nedb');
const database = new datastore('database.db');
const app = express();
const port = 3000 || process.env.port;

//
database.loadDatabase();

app.use(express.json());

app.listen(port, () => console.log(`listing at port ${port}`));

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

app.get('/signup', (req, res) => {
	database.find(req.body, (err, data) => {
		if (err) {
			res.status(300).send(err);
			return;
		}
		if (data.length == 0) {
			database.insert(req.body);
			res.status(200).json('SUCCESSFULLY CREATED USERNAME');
		} else {
			res.status(300).json('CANNOT CREATE USERNAME');
		}
	});
});

function update(body, cb) {
	if (!body.sender || !body.receiver || !body.message)
		return cb({ error: 'sender or receiver or message spelled wrong' });
	var sender, receiver, message;

	sender = body.sender;
	receiver = body.receiver;
	message = body.message;

	database.find({}, (err, data) => {
		for (let ele of data) {
			if (ele.username == a) {
				const id = ele._id;
				database.update(
					{ _id: id },
					{ $push: { chats: { sender: a, receiver: b, message: message } } },
					{},
					(err, data) => {
						console.log(data);
					}
				);
				//db.update({ _id: 'id6' }, { $push: { fruits: { $each: ['banana'], $slice: 2 } } }, {}, function () {
			}
			if (ele.username == b) {
				const id = ele._id;
				database.update(
					{ _id: id },
					{ $push: { chats: { sender: a, receiver: b, message: message } } },
					{},
					(err, data) => {
						console.log(data);
					}
				);
			}
		}
	});
	cb(null, 'sent');
}
app.get('/send', (req, res) => {
	update(req.body, (err, data) => {
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
