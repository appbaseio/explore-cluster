import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { css } from 'emotion';
import { Card } from 'antd';

import { getAppMappings } from '../../batteries/modules/actions';
import { getURL } from '../../constants/config';

const container = css`
	padding: 50px;
`;

class AggsPage extends React.Component {
	componentDidMount() {
		const { appName, credentials, fetchMappings } = this.props;
		const url = getURL();

		fetchMappings(appName, credentials, url);
	}

	render() {
		return (
			<div className={container}>
				<Card>
					<h1>Aggs page</h1>
				</Card>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = dispatch => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AggsPage);
