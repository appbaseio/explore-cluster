import Appbase from 'appbase-js';
import parser from 'url-parser-lite';

import settings from './settings';
import mappingObj from './moviesMapping';
import moviesData from './data';
import { getURL } from '../../../constants/config';

const streamingData = {
	genres: 'Action',
	original_language: 'English',
	original_title: 'Star Wars: The Last Jedi',
	overview:
		'Rey develops her newly discovered abilities with the guidance of Luke Skywalker, who is unsettled by the strength of her powers. Meanwhile, the Resistance prepares to do battle with the First Order.',
	poster_path: '/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg',
	release_year: 2017,
	tagline: 'Episode VIII - The Last Jedi',
};

const getAuthToken = () => {
	let token = null;
	try {
		token = sessionStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

const getCredentials = () => {
	let username = null;
	let password = null;
	try {
		username = sessionStorage.getItem('username');
		password = sessionStorage.getItem('password');
	} catch (e) {
		console.error(e);
	}
	return { username, password };
};

class AppbaseUtils {
	constructor() {
		this.user = null;
		this.app = null;
		const ACC_API = getURL();
		this.accountAddress = ACC_API;
		this.address = ACC_API;
		this.authToken = getAuthToken();
	}

	getApp = () => (this.app ? this.app.id : '');

	getUser() {
		return fetch(`${this.accountAddress}/user`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				Authorization: `Basic ${this.authToken}`,
			},
		});
	}

	logout() {
		return fetch(`${this.accountAddress}/logout?next=`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				Authorization: `Basic ${this.authToken}`,
			},
		});
	}

	getWritePermissions() {
		const appId = this.getApp();
		return new Promise((resolve, reject) => {
			fetch(`${this.accountAddress}/app/${appId}/permissions`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					Authorization: `Basic ${this.authToken}`,
				},
			})
				.then(res => res.json())
				.then((data) => {
					const permissions = data.body.filter(
						permission => permission.read && permission.write,
					);
					resolve(permissions[0]);
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

	createApp(appname) {
		return fetch(`${this.accountAddress}/${appname}`, {
			method: 'PUT',
			headers: {
				'content-type': 'application/json',
				Authorization: `Basic ${this.authToken}`,
			},
			// body: JSON.stringify({
			// 	es_version: '5',
			// }),
		});
	}

	applyAnalyzers = () => {
		const { appName } = this.app;

		return new Promise((resolve, reject) => {
			fetch(`${this.address}/${appName}/_close`, {
				method: 'POST',
				headers: {
					Authorization: `Basic ${this.authToken}`,
					'content-type': 'application/json',
				},
			})
				.then(() => {
					fetch(`${this.address}/${appName}/_settings`, {
						method: 'PUT',
						headers: {
							Authorization: `Basic ${this.authToken}`,
							'content-type': 'application/json',
						},
						body: JSON.stringify(settings),
					}).then(() => {
						fetch(`${this.address}/${appName}/_open`, {
							method: 'POST',
							headers: {
								Authorization: `Basic ${this.authToken}`,
								'content-type': 'application/json',
							},
						}).then(() => {
							resolve();
						});
					});
				})
				.catch((e) => {
					reject(e);
				});
		});
	};

	updateUser = (user) => {
		this.user = user;
	};

	updateApp = (app) => {
		this.app = app;
	};

	updateMapping = () => {
		const type = 'movies';
		this.app.type = type;

		return fetch(`${this.address}/${this.app.appName}/_mapping/${type}?update_all_types=true`, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${this.authToken}`,
				'content-type': 'application/json',
			},
			body: JSON.stringify(mappingObj),
		});
	};

	indexData = () => {
		const finalData = [];
		const indexObj = {
			index: {},
		};
		moviesData.forEach((record) => {
			finalData.push(indexObj);
			finalData.push(record);
		});
		const { username, password } = getCredentials();
		this.appbaseRef = Appbase({
			url: this.address,
			app: this.app.appName,
			username,
			password,
		});
		return new Promise((resolve, reject) => {
			this.appbaseRef
				.bulk({
					type: this.app.type,
					body: finalData,
				})
				.then(() => {
					resolve();
				})
				.catch((e) => {
					reject(e);
				});
		});
	};

	indexNewData = () => new Promise((resolve, reject) => {
			this.appbaseRef
				.index({
					type: this.app.type,
					body: streamingData,
				})
				.then(() => {
					resolve();
				})
				.catch((e) => {
					reject(e);
				});
		});

	appConfig = () => {
		const { username, password } = getCredentials();
		return {
			app: this.app.appName,
			credentials: `${username}:${password}`,
			type: this.app.type,
		};
	};

	createURL(cb) {
		const { username, password } = getCredentials();
		const ACC_API = getURL();
		const { protocol, host } = parser(ACC_API);
		const obj = {
			appname: this.app.appName,
			url: `${protocol}://${username}:${password}@${host}`,
			selectedType: this.app.type ? [this.app.type] : [],
		};

		const URL = JSON.stringify(obj);
		cb(URL);
	}
}

const appbaseHelpers = new AppbaseUtils();
export default appbaseHelpers;
