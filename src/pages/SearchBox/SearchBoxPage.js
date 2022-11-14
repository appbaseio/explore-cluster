import React, { Fragment, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Layout, Result, Alert } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { orderBy } from 'lodash';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Loader from '../../components/Loader';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

import { fetchSearchBoxes } from '../../batteries/modules/actions';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';

import { allowedTiers } from '../../utils/prop-types';
import { compareVersion } from '../../utils';
import SearchBoxCard from './components/SearchBoxCard';
import { SearchBoxBannerDetails } from './utils';

const pipelinesContainer = css`
	padding: 50px;
	margin-bottom: 70px;
`;
const { Header } = Layout;
const SearchBoxPage = (props) => {
	const { isLoading, searchBoxes, getSearchBoxes, appVersion, history } = props;
	const bannerDetails = { ...SearchBoxBannerDetails };
	const renderSearchBoxCards = () => {
		return (
			orderBy(
				searchBoxes,
				(a) => {
					return a.updated_at || a.created_at || 0;
				},
				['desc'],
			).map((item) => (
				<SearchBoxCard searchBoxItem={item} key={item.id} history={history} showExport />
			)) ?? []
		);
	};

	useLayoutEffect(() => {
		getSearchBoxes();
	}, []);

	if (compareVersion(appVersion, '8.0.0') === -1)
		return (
			<React.Fragment>
				<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />

				<div
					style={{
						display: 'flex',
						height: '100%',
						width: '100%',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Alert
						type="warning"
						message="Upgrade appbase.io to v8.0.0 or above for using the ReactiveSearch Searchbox feature"
						showIcon
						style={{ marginBottom: 10, height: 'max-content' }}
					/>
				</div>
			</React.Fragment>
		);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<Fragment>
			<Header style={{ background: 'white', height: 'auto' }}>
				<div
					css={{
						padding: '25px 0px',
						margin: '0 auto',
					}}
				>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>ReactiveSearch Searchbox</h2>
							<Row>
								<Col lg={18}>
									<p>
										GUI to create and manage search bar UIs. Configure design,
										layout, and add featured, popular, recent and index
										suggestion.
									</p>
								</Col>
							</Row>
						</Col>
						<Col
							lg={6}
							css={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Link to="/cluster/searchboxes/new">
								<Button block type="primary" size="large" rel="noopener noreferrer">
									<PlusOutlined />
									Create Searchbox
								</Button>
							</Link>
							<Button
								style={{ marginTop: 10 }}
								type="primary"
								ghost
								size="large"
								rel="noopener noreferrer"
								onClick={() => window.open(bannerDetails.href)}
							>
								Read Docs
							</Button>
						</Col>
					</Row>
				</div>
			</Header>
			<div css={pipelinesContainer}>
				{' '}
				{searchBoxes && searchBoxes.length ? (
					<ErrorToaster>
						<div>{renderSearchBoxCards()}</div>
					</ErrorToaster>
				) : (
					<Result
						title="No Searchbox Present"
						subTitle="Create a new Searchbox to get started"
						extra={
							<Link to="/cluster/searchboxes/new">
								<Button type="primary">
									<PlusOutlined />
									Create Searchbox
								</Button>
							</Link>
						}
					/>
				)}
			</div>
		</Fragment>
	);
};

SearchBoxPage.propTypes = {
	isLoading: PropTypes.bool,
	searchBoxes: PropTypes.array,
	getSearchBoxes: PropTypes.func.isRequired,
	tier: allowedTiers,
	appVersion: PropTypes.string,
	history: PropTypes.object,
};

SearchBoxPage.defaultProps = {
	isLoading: false,
	searchBoxes: null,
	tier: undefined,
	appVersion: undefined,
	history: PropTypes.object,
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$getSearchBoxes.isFetching'),
	searchBoxes: get(state, '$getSearchBoxes.results'),
	tier: get(state, '$getAppPlan.results.tier'),
	appVersion: get(state, '$getAppPlan.results.version'),
});

const mapDispatchToProps = (dispatch) => ({
	getSearchBoxes: () => dispatch(fetchSearchBoxes()),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(SearchBoxPage));
