import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	Card,
	Spin,
	Select,
	Table,
	Icon,
	Typography,
	Empty,
	notification,
	Button,
	Tooltip,
	message,
	Pagination,
} from 'antd';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAppGradeMetrics, setSearchState } from '../../batteries/modules/actions';
import { isValidPlan } from '../../batteries/utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Container from '../../components/Container';
import HighLighter from '../../components/HighLighter';
import Loader from '../../components/Loader';
import Overlay from '../../components/Overlay';

const { Option } = Select;

// TODO: need to update the content
const bannerMessages = {
	free: {
		title: 'Evaluate your search relevance strategies',
		description:
			'Get a production or enterprise plan to grade and evaluate your search relevance strategies.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	growth: {
		title: 'Evaluate your search relevance strategies',
		description:
			'See our docs on how to get started with creating different search relevance strategies and grading them.',
		buttonText: 'Read Docs',
		href: '#',
	},
};

const tableStyle = css`
	.table-column {
		display: flex;
		align-items: center;
		justify-content: space-between;

		a {
			margin-left: 5px;
			transform: scale(0);
			transition: all ease 0.2s;
		}
	}
	.replay-button {
		margin-left: 5px;
		transform: scale(0);
		transition: all ease 0.2s;
	}

	th:hover {
		.table-column > a {
			transform: scale(1);
		}
	}

	td:hover {
		.replay-button {
			transform: scale(1);
		}
	}
`;

class GradeEvaluation extends React.Component {
	state = {
		selectedIndices: [],
		hasUserIndices: false,
		currentPage: 1,
	};

	componentDidMount() {
		this.fetchMetrics();
	}

	componentDidUpdate(prevProps) {
		const { error, isFetching } = this.props;

		if (!isFetching && error && JSON.stringify(error) !== JSON.stringify(prevProps.error)) {
			notification.error({
				message: 'Failed to fetch metrics',
				description: error.message,
			});
		}
	}

	static getDerivedStateFromProps(props, state) {
		const { apps, isFetchingApps } = props;

		if (isFetchingApps) {
			return state;
		}

		const userIndices = apps ? Object.keys(apps).filter((app) => !app.startsWith('.')) : [];

		return {
			...state,
			hasUserIndices: !!userIndices.length,
		};
	}

	fetchMetrics = () => {
		const { getMetrics, tier, featureGrade } = this.props;
		const { selectedIndices, currentPage } = this.state;

		if (
			selectedIndices.length !== 0 &&
			selectedIndices.length <= 5 &&
			isValidPlan(tier, featureGrade)
		) {
			getMetrics(selectedIndices, currentPage);
		}
	};

	onSelectedIndices = (indices) => {
		if (indices.length > 5) {
			message.warning('Cannot compare more than 5 indices!');
			return;
		}
		this.setState(
			{
				selectedIndices: indices,
				currentPage: 1,
			},
			this.fetchMetrics,
		);
	};

	onPageChange = (page) => {
		this.setState(
			{
				currentPage: page,
			},
			this.fetchMetrics,
		);
	};

	renderIndexDropdown = () => {
		const { apps, isFetchingApps } = this.props;
		const { selectedIndices } = this.state;
		const userIndices = apps && Object.keys(apps).filter((app) => !app.startsWith('.'));

		if (!isFetchingApps && apps) {
			return (
				<div style={{ position: 'relative', marginBottom: 20 }}>
					<Typography.Text strong>
						Select Index
						<Tooltip title="Select index to add in comparison table">
							<Icon style={{ marginLeft: 5 }} type="info-circle" />
						</Tooltip>
					</Typography.Text>
					<Select
						showSearch
						mode="multiple"
						style={{ width: '100%' }}
						placeholder="Select a Index for comparison"
						optionFilterProp="children"
						onChange={this.onSelectedIndices}
						value={selectedIndices}
						filterOption={(input, option) =>
							option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
					>
						{userIndices.map((index) => (
							<Option key={index}>{index}</Option>
						))}
					</Select>
					{selectedIndices.length === 0 ? (
						<HighLighter title="Add index for Comparison" />
					) : null}
				</div>
			);
		}

		return null;
	};

	handleSearchPreview = (query, index) => {
		const { history, saveState } = this.props;

		localStorage.setItem('enableGrading', 'true');

		saveState({
			query: [
				{
					id: 'search',
					value: query,
					dataField: [],
				},
			],
		});

		history.push(`/app/${index}/search-preview`);
	};

	render() {
		const {
			isFetchingPlan,
			plan,
			isFetching,
			isFetchingApps,
			metrics,
			isPaidUser,
			tier,
			featureGrade,
			totalMetrics,
		} = this.props;
		const { hasUserIndices, currentPage } = this.state;

		if (isFetchingPlan) {
			return <Loader />;
		}

		if (!isPaidUser || !isValidPlan(tier, featureGrade)) {
			return (
				<React.Fragment>
					<Banner {...bannerMessages.free} />
					<Overlay src="/static/images/analytics/NoResults.png" alt="Grade Evaluation" />
				</React.Fragment>
			);
		}

		if (!isFetchingApps && !hasUserIndices) {
			return (
				<React.Fragment>
					{bannerMessages[plan] && <Banner {...bannerMessages[plan]} />}
					<Container>
						<Card title="Grade Metrics">
							<Empty description="No apps present. Create an app to get started" />
						</Card>
					</Container>
				</React.Fragment>
			);
		}

		const { selectedIndices } = this.state;
		const searchTerms = metrics ? Object.keys(metrics) : [];
		const indicesColumns = selectedIndices.map((index) => ({
			title: (
				<div className="table-column">
					{index}
					<Link to={`/app/${index}/search`}>
						<Icon type="edit" />
					</Link>
				</div>
			),
			key: index,
			render: (query) => (
				<React.Fragment>
					{get(metrics, `${query}.${index}`, 0)}
					<Tooltip title="Test with search preview">
						<Button
							size="small"
							shape="circle-outline"
							icon="redo"
							className="replay-button"
							onClick={() => this.handleSearchPreview(query, index)}
						/>
					</Tooltip>
				</React.Fragment>
			),
		}));

		const tableColumns = [
			{
				title: 'Term',
				key: 'term',
				render: (query) => query || '<empty_query>',
				fixed: 'left',
				width: 150,
			},
			...indicesColumns,
		];

		return (
			<React.Fragment>
				{bannerMessages[plan] && <Banner {...bannerMessages[plan]} />}
				<Container>
					<Spin spinning={isFetchingApps}>
						<Card title="Grade Metrics">
							{this.renderIndexDropdown()}
							<Table
								rowKey={(query) => query}
								scroll={{ x: 1200 }}
								className={tableStyle}
								columns={tableColumns}
								pagination={false}
								loading={isFetching}
								dataSource={searchTerms}
								locale={{
									emptyText: <Empty description="No metrics data available" />,
								}}
							/>
							{totalMetrics ? (
								<Pagination
									style={{ marginTop: 10 }}
									current={currentPage}
									total={totalMetrics}
									onChange={this.onPageChange}
								/>
							) : null}
						</Card>
					</Spin>
				</Container>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		// Plan details
		tier: get(state, '$getAppPlan.results.tier'),
		isFetchingPlan: get(state, '$getAppPlan.isFetching', false),
		featureGrade: get(state, '$getAppPlan.results.feature_search_grader'),
		isPaidUser: get(state, '$getAppPlan.results.isPaid'),
		plan: get(state, '$getAppPlan.results.plan'),
		// Apps Details
		isFetchingApps: get(state, 'apps.isFetching', false),
		apps: get(state, 'apps.data', null),
		// Metrics Details
		metrics: get(state, '$getAppGradeMetrics.results.metrics', null),
		totalMetrics: get(state, '$getAppGradeMetrics.results.total', 0),
		isFetching: get(state, '$getAppGradeMetrics.isFetching', null),
		error: get(state, '$getAppGradeMetrics.error', null),
	};
};

const mapDispatchToProps = (dispatch) => ({
	getMetrics: (indices, page) => dispatch(getAppGradeMetrics(indices, page)),
	saveState: (state) => dispatch(setSearchState(state)),
});

GradeEvaluation.defaultProps = {
	apps: {},
	metrics: {},
	error: null,
	totalMetrics: 0,
};

GradeEvaluation.propTypes = {
	tier: PropTypes.string.isRequired,
	isFetchingPlan: PropTypes.bool.isRequired,
	featureGrade: PropTypes.bool.isRequired,
	isPaidUser: PropTypes.bool.isRequired,
	plan: PropTypes.string.isRequired,
	isFetchingApps: PropTypes.bool.isRequired,
	apps: PropTypes.object,
	metrics: PropTypes.object,
	totalMetrics: PropTypes.number,
	isFetching: PropTypes.bool.isRequired,
	error: PropTypes.object,
	getMetrics: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	saveState: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(GradeEvaluation);
