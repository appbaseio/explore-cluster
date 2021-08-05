import React from 'react';
import Playground from '@appbaseio-confidential/reactivesearch-playground';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { getURL } from '../../constants/config';

const RSPlaygroundPage = (props) => {
	const { username, password, currentIndexName } = props;
	const rsHost = new URL(getURL()).host;
	const rsURL =
		username && password
			? `https://${username}:${password}@${rsHost}/${currentIndexName}/_reactivesearch.v3`
			: null;
	return (
		<section
			style={{
				backgroundColor: '#ffffff',
				height: `${window.innerHeight - 65}px`,
			}}
		>
			<Playground
				presets={{
					...(rsURL && { url: rsURL }),
					settingsPresets: { showUrl: false, theme: 'light' },
				}}
			/>
		</section>
	);
};

RSPlaygroundPage.propTypes = {
	username: PropTypes.string,
	password: PropTypes.string,
	currentIndexName: PropTypes.string,
};

RSPlaygroundPage.defaultProps = {
	username: '',
	password: '',
	currentIndexName: '',
};

const mapStateToProps = (state) => {
	return {
		username: get(state, 'user.data.username'),
		password: get(state, 'user.data.password'),
		currentIndexName: get(state, '$getCurrentApp.name'),
	};
};

export default connect(mapStateToProps)(RSPlaygroundPage);
