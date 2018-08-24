let express = require('express');
const cors = require('cors');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

let app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
app.use('/static', express.static(__dirname + '/../dist'))
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

app.post('/api/uploadRecord', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let name = req.body.name;
	let file = req.files.file;
		let filePath = path.resolve(`${__dirname}/../../uploadedRecords/`);
		mkdirp(filePath, (err) => {
			if (err) {
				res.status(500).send(err);
			}
			fs.unlink(`${filePath}${path.sep}${name}.webm`, (err) => {
				if (err) {
					console.log(err);
				}
				file.mv(`${filePath}${path.sep}${name}.webm` , (err) => {
					if (err) {
						console.log(err)
					} else {
						console.log(`${name}.webm stored successfully.`);
						res.json({
							status: 'succeeded'
						})
					}
				})
			})
		});
});

let server = require('http').createServer(app);

let port = process.env.PORT || 3000;
let address = process.env.ADDRESS || '0.0.0.0';
server.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'))
})