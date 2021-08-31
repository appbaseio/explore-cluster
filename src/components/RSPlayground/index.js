import React from 'react';
import Playground from '@appbaseio-confidential/reactivesearch-playground';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { getURL } from '../../constants/config';

const RSPlayground = (props) => {
	const { username, password, currentIndexName, presets } = props;
	const fetchedURL = new URL(getURL());
	const rsHost = fetchedURL.host;
	const rsProtocol = fetchedURL.protocol;
	const rsURL =
		username && password
			? `${rsProtocol}//${username}:${password}@${rsHost}/${currentIndexName}/_reactivesearch.v3`
			: null;
	return (
		<Playground
			presets={{
				...presets,
				...(rsURL && { url: rsURL }),
			}}
		/>
	);
};

RSPlayground.propTypes = {
	username: PropTypes.string,
	password: PropTypes.string,
	currentIndexName: PropTypes.string,
	presets: PropTypes.shape({
		url: PropTypes.string,
		editorPresets: PropTypes.object,
		settingsPresets: PropTypes.object,
	}),
};

RSPlayground.defaultProps = {
	username: '',
	password: '',
	currentIndexName: '',
	presets: {
		url: '',
		editorPresets: {
			queryEditorValue: '',
			responseEditorValue: '',
		},
		settingsPresets: {
			showUrl: false,
			theme: 'light',
			showTabs: false,
			showHeaders: false,
			showSettings: false,
		},
	},
};

const mapStateToProps = (state) => {
	return {
		username: get(state, 'user.data.username'),
		password: get(state, 'user.data.password'),
		currentIndexName: get(state, '$getCurrentApp.name'),
	};
};

export default connect(mapStateToProps)(RSPlayground);
