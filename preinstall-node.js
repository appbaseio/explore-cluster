const https = require('https');
const fs = require('fs');
// const excludedArr = require('./utils/constants');

var options = {
	host: 'api.github.com',
	path: '/repos/appbaseio/reactivesearch-shopify-plugin/git/trees/master',
	method: 'GET',
	headers: { 'user-agent': 'node.js' },
};

function getData(path) {
	var options = {
		host: 'api.github.com',
		path,
		method: 'GET',
		headers: { 'user-agent': 'node.js' },
	};

	return new Promise((resolve, reject) => {
		const request = https.request(options, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				try {
					resolve(JSON.parse(data));
				} catch (err) {
					reject(err);
				}
			});
		});
		request.end();
	});
}

var path = require('path');
var walk = function (dir, done) {
	var results = [];
	fs.readdir(dir, function (err, list) {
		if (err) return done(err);
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file) return done(null, results);
			file = path.resolve(dir, file);
			fs.stat(file, function (err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function (err, res) {
						results = results.concat(res);
						next();
					});
				} else {
					results.push(file);
					next();
				}
			});
		})();
	});
};

var data = {};
const testFolder = './constants/';

fs.readdirSync(testFolder).forEach((file) => {
	if (file !== 'files.js' && file !== 'constants.js' && file !== 'search_index.json') {
		walk(`${testFolder}${file}`, function (err, results) {
			let filesObj = {};

			if (err) throw err;

			results.forEach((path) => {
				const fileName = path.split(`${file}`)[1];

				if (fileName.includes('.ico') || fileName.includes('.png')) {
					const data = fs.readFileSync(
						`./${path.split('arc-dashboard/')[1] || path.split('repo/')[1]}`,
						{
							encoding: 'base64',
						},
					);
					filesObj[fileName] = data; //content for files.js
				} else {
					if (!fileName.includes('build')) {
						const data = fs.readFileSync(
							`./${path.split('arc-dashboard/')[1] || path.split('repo/')[1]}`,
							{
								encoding: 'utf8',
							},
						);
						filesObj[fileName] = data; //content for files.js
					}
				}
			});

			fs.writeFile(
				'constants/files.js',
				` export default ${JSON.stringify(filesObj, null, 2)}`,
				(err) => {
					if (err) {
						console.error(err);
						return;
					}
				},
			);
		});
	}
});
