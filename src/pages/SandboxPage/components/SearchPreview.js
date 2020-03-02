import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Icon, Switch, Affix } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { ReactiveBase } from '@appbaseio/reactivesearch';

import Filter from './Filter';

import { getSettings } from '../../../batteries/modules/actions';
import Search from './Search';
import Result from './Result/index';

const container = css`
	padding: 16px;

	.my-16 {
		margin-bottom: 16px;
	}
`;

class SearchPreview extends React.Component {
	componentDidMount() {
		const { app, fetchSearchSettings } = this.props;
		fetchSearchSettings(app);
	}

	render() {
		const { settings, app, credentials, url } = this.props;

		if (!settings) {
			return null;
		}

		if (settings.isFetching) {
			return null;
		}

		return (
			<Row className={container} gutter={16}>
				<Col xs={24}>
					<Row className="my-16" type="flex" align="middle" justify="space-between">
						<div>
							<label htmlFor="analytics">
								Record analytics
								<Switch defaultChecked id="analytics" />
							</label>
						</div>
						{/* <Button size="large" type="primary">
							<Icon type="code-sandbox" />
							Open in Codesandbox
						</Button> */}
					</Row>
				</Col>
				<ReactiveBase app={app} enableAppbase credentials={credentials} url={url}>
					<Col md={6}>
						<Filter app={app} aggs={settings.aggregations} />
					</Col>
					<Col md={18}>
						<Affix offsetTop={60}>
							<Search app={app} search={settings.search} />
						</Affix>
						<Result
							result={settings.results}
							search={settings.search}
							filters={settings.aggregations}
							app={app}
							url={url}
							credentials={credentials}
						/>
					</Col>
				</ReactiveBase>
			</Row>
		);
	}
}

const mapStateToProps = (state, props) => ({
	settings: get(state.$getAppSettings, `settings.${props.app}`),
});

const mapDispatchToProps = dispatch => ({
	fetchSearchSettings: appName => dispatch(getSettings(appName)),
});

SearchPreview.propTypes = {
	app: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPreview);
