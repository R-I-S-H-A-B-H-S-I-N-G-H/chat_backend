fetch('http://localhost:3000/')
	.then((e) => {
		console.log(e.status);
		return e.json();
	})
	.then((e) => {
		console.log(e);
	});
