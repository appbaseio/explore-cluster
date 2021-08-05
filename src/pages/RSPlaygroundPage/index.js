import React from 'react';
import Playground from '@appbaseio-confidential/reactivesearch-playground';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { getURL } from '../../constants/config';

const RSPlaygroundPage = (props) => {
	const { username, password } = props;
	const rsURL = username && password ? `https:${username}:${password}@${getURL()}` : null;
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
};

RSPlaygroundPage.defaultProps = {
	username: '',
	password: '',
};

const mapStateToProps = (state) => {
	return {
		username: get(state, 'user.data.username'),
		password: get(state, 'user.data.password'),
	};
};

export default connect(mapStateToProps)(RSPlaygroundPage);
