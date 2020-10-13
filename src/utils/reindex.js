import get from 'lodash/get';
import { getURL } from '../constants/config';

const checkReIndexing = async (indexName) => {
	const url = getURL();
	const username = sessionStorage.getItem('username');
	const password = sessionStorage.getItem('password');
	const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

	try {
		// get new index name
		const indicesRes = await fetch(`${url}/_cat/indices/${indexName}*?format=json`, {
			headers: {
				Authorization: authHeader,
			},
		});
		const indicesJSON = await indicesRes.json();

		const filteredData = indicesJSON.filter(
			(i) => i.index === indexName || i.index.includes(`${indexName}_reindexed_`),
		);

		if (filteredData.length > 1) {
			// sort array
			filteredData.sort((a, b) => {
				if (a.index < b.index) {
					return -1;
				}
				if (a.index > b.index) {
					return 1;
				}
				return 0;
			});

			return {
				originalDocCount: get(filteredData[0], 'docs.count'),
				currentDocCount: get(filteredData[1], 'docs.count'),
			};
		}

		return null;
	} catch (err) {
		return null;
	}
};

export default checkReIndexing;
