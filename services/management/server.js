'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const Promise = require('bluebird');
const fs = require('fs');
const readFile = Promise.promisify(fs.readFile);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const rulesCache = require('./rulesCache');
const repoValidator = require('./repoValidator');
const logger = require('./logger');

app.use(morgan('dev'));
app.set('port', (process.env.PORT || 3000));

app.post('/on-repo-change', upload.any(), (req, res) => {
	logger.info("on-repo-change called");
	var startTime = Date.now();

	readFile(req.files[0].path, 'binary')
		.then(data => repoValidator(data))
		.then(result => {
			logger.info('on-repo-change completed', { timeSinceStart: Date.now() - startTime, isSuccessful: result === true });
			if (result === true) {
				res.sendStatus(200)
			}
			else {
				res.status(400).send(result)
			}
		})
		.catch(err => {
			logger.error(err);
			err.response.text().then(x => res.status(500).send(x))
		});
});

app.get('', (req, res) => {
	res.sendStatus(200)
});

app.get('/ruleset/latest', (req, res) => {
	if (!rulesCache.getLatestRules()) {
		res.status(503).send('Git repository not ready yet');
		return;
	}

	res.header('X-Rules-Version', rulesCache.getLatestRulesVersion());
	res.json(rulesCache.getLatestRules());
});

app.get('/isalive', bodyParser.json(), (req, res) => res.send('alive'));

rulesCache.buildLocalCache();

app.listen(app.get('port'), () => logger.info('Server started: http://localhost:' + app.get('port') + '/'));