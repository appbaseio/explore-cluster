const https = require('https');
const fs = require('fs');
var path = require('path');
const templatesConstants = require('./template-sources.json');

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

function deleteFileExists(filePath) {
	fs.exists(filePath, function (exists) {
		if (exists) {
			console.log('File exists. Deleting now ...');
			fs.unlinkSync(filePath);
		} else {
			console.log('File not found, so not deleting.');
		}
	});
}

async function generateTemplatesOutput() {
	const promises = [];
	let filesTemplatesObj = {};
	deleteFileExists('./template-sources-output.json');

	templatesConstants.forEach((data, idx) => {
		let fileName = '';

		if (data.version) {
			fileName = `reactivesearch-shopify-plugin@${data.version}`;
		} else if (data.commit) {
			fileName = `reactivesearch-shopify-plugin@${data.commit}`;
		} else if (data.branch) {
			fileName = `reactivesearch-shopify-plugin@${data.branch}`;
		} else {
			fileName = `reactivesearch-shopify-plugin@master`;
		}

		promises.push(
			new Promise((resolve, reject) => {
				const testFolder = `./templates/${fileName}/`;
				fs.readdirSync(testFolder).forEach((file) => {
					walk(`${testFolder}${file}`, function (err, results) {
						let filesObj = {};
						let templateOutputObj = {};

						if (err) throw err;

						results.forEach((path) => {
							// Read file contents and store in files.js
							const fileName = path.split(`${file}`)[1];
							if (fileName.includes('.ico') || fileName.includes('.png')) {
								const data = fs.readFileSync(
									`./${
										path.split('arc-dashboard/')[1] || path.split('repo/')[1]
									}`,
									{
										encoding: 'base64',
									},
								);
								filesObj[fileName] = data; //content for files.js
							} else {
								let excludeManifest = templatesConstants.filter((i) =>
									fileName.includes(i.manifest_path),
								);

								if (!fileName.includes('build') && !excludeManifest.length) {
									const data = fs.readFileSync(
										`./${
											path.split('arc-dashboard/')[1] ||
											path.split('repo/')[1]
										}`,
										{
											encoding: 'utf8',
										},
									);
									filesObj[fileName] = data; //content for files.js
								}
							}

							// Check if manifest file exists in the repo
							if (data.manifest_path === path.split(`${file}/`)[1]) {
								const templateData = fs.readFileSync(
									`./${
										path.split('arc-dashboard/')[1] || path.split('repo/')[1]
									}`,
									{
										encoding: 'utf8',
									},
								);

								templateOutputObj = {
									...data,
									...JSON.parse(templateData),
								};
								// return;
							}
						});
						// console.log(templateOutputObj.name);
						filesTemplatesObj = {
							...filesTemplatesObj,
							[fileName]: { ...filesObj },
						};

						resolve(templateOutputObj);
					});
				});
			}),
		);
	});

	const templatesOutput = await Promise.all(promises);
	fs.writeFile(
		'template-sources-output.json',
		`${JSON.stringify(
			templatesOutput.filter((i) => i.name),
			null,
			2,
		)}`,
		(err) => {
			if (err) {
				console.error(err);
				return;
			}
		},
	);

	fs.writeFile(
		`templates/files.js`,
		` export default ${JSON.stringify(filesTemplatesObj, null, 2)}`,
		(err) => {
			if (err) {
				console.error(err);
				return;
			}
		},
	);
}

generateTemplatesOutput();
