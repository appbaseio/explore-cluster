const https = require('https');
const fs = require('fs');
const path = require('path');
const templatesConstants = require('./template-sources.json');
const ROOT_DIR = path.resolve(__dirname);

function readProjectFile(filePath, encoding) {
	return fs.readFileSync(path.join(ROOT_DIR, path.relative(ROOT_DIR, filePath)), {
		encoding,
	});
}

var walk = function (dir, done) {
	let results = [];
	fs.readdir(dir, function (err, list) {
		if (err) return done(err);
		let i = 0;
		(function next() {
			let file = list[i++];
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
			fileName = `${data.repository}@${data.version}`;
		} else if (data.commit) {
			fileName = `${data.repository}@${data.commit}`;
		} else if (data.branch) {
			fileName = `${data.repository}@${data.branch}`;
		} else {
			fileName = `${data.repository}@master`;
		}

		promises.push(
			new Promise((resolve, reject) => {
				const testFolder = `./templates/${fileName}/`;
				if (!fs.existsSync(testFolder)) {
					console.warn(`Skipping template source not available locally: ${fileName}`);
					resolve({});
					return;
				}
				fs.readdirSync(testFolder).forEach((file) => {
					walk(`${testFolder}${file}`, function (err, results) {
						const filesObj = {};
						let templateOutputObj = {};

						if (err) throw err;

						results.forEach((filePath) => {
							// Read file contents and store in files.js
							const relativeFileName = filePath.split(`${file}`)[1];
							if (relativeFileName.includes('.ico') || relativeFileName.includes('.png')) {
								const fileData = readProjectFile(filePath, 'base64');
								filesObj[relativeFileName] = fileData; //content for files.js
							} else {
								if (!relativeFileName.includes('build')) {
									const fileData = readProjectFile(filePath, 'utf8');
									filesObj[relativeFileName] = fileData; //content for files.js
								}
							}

							// Check if manifest file exists in the repo
							if (data.manifest_path === filePath.split(`${file}/`)[1]) {
								const templateData = readProjectFile(filePath, 'utf8');

								templateOutputObj = {
									...data,
									...JSON.parse(templateData),
								};
							}
						});

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
			}
		},
	);

	fs.writeFile(
		`templates/files.js`,
		` export default ${JSON.stringify(filesTemplatesObj, null, 2)}`,
		(err) => {
			if (err) {
				console.error(err);
			}
		},
	);
}

generateTemplatesOutput();
