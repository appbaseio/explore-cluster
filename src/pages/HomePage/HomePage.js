import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { css } from 'react-emotion';
import {
 Row, Col, Icon, Button, Layout,
} from 'antd';
import get from 'lodash/get';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Header from '../../components/Header';
import CreateAppModal from './CreateAppModal';
import Loader from '../../components/Loader';

import { loadApps } from '../../actions';
import { mediaKey } from '../../utils/media';
import AppDataWrapper from '../../components/AppDataWrapper';

const link = css`
	font-size: 16px;
	margin-right: 30px;

	i {
		margin-right: 4px;
	}

	${mediaKey.small} {
		display: block;
		line-height: 48px;
	}
`;

class HomePage extends Component {
	constructor(props) {
		super(props);

		this.sortOptions = [{ label: 'Name', key: 'name' }, { label: 'Most Recent', key: 'time' }];
		this.state = {
			showModal: false, // modal for create new app
		};
	}

	componentDidMount() {
		const {
			// prettier-ignore
			apps,
			fetchApps,
		} = this.props;

		if (!apps.isFetching) {
			fetchApps();
		}
	}

	handleChange = () => {
		this.setState(state => ({
			showModal: !state.showModal,
		}));
	};

	renderApps = () => {
		const { apps } = this.props;
		if (apps.isFetching) return <Loader />;

		const sortedApps = apps.data ? Object.keys(apps.data) : [];
		return (
			<Row css={{ padding: 30 }} gutter={20}>
				{sortedApps.length ? null : (
					<section
						css={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							paddingTop: '80px',
						}}
					>
						<Icon
							type="exclamation-circle"
							theme="outlined"
							style={{ fontSize: 34, marginBottom: 10 }}
						/>
						<h2>No indices found</h2>
						<p>
							Create an index or try out the{' '}
							<Link to="/tutorial">interactive tutorial</Link> to get started
						</p>
					</section>
				)}

				<AppDataWrapper apps={apps} onCreateModalChange={this.handleChange} />
			</Row>
		);
	};

	render() {
		const { showModal } = this.state;
		const { history } = this.props;

		return (
			<Fragment>
				<Layout
					css={{
						minHeight: 'calc(100vh - 60px)',
					}}
				>
					<Header>
						<Row type="flex" justify="space-between" gutter={16}>
							<Col lg={18}>
								<h2>Howdy, welcome to your dashboard!</h2>

								<Row>
									<Col lg={18}>
										<p>
											This is your cluster manager view. Here, you can create
											a new index and manage your existing indices.
										</p>
									</Col>
								</Row>

								<Link to="/tutorial" className={link}>
									Interactive Tutorial <Icon type="book" />
								</Link>
								<a
									href="https://docs.appbase.io/docs/data/Import/"
									className={link}
									target="_blank"
									rel="noopener noreferrer"
								>
									Importing Data <Icon type="link" />
								</a>
								<a
									href="https://docs.appbase.io/integrations"
									className={link}
									target="_blank"
									rel="noopener noreferrer"
								>
									APIs and Integrations{' '}
									<Icon type="link" />
								</a>
							</Col>
							<Col
								lg={6}
								css={{
									display: 'flex',
									flexDirection: 'column-reverse',
									paddingBottom: 20,

									[mediaKey.small]: {
										paddingTop: 20,
									},
								}}
							>
								<Button
									size="large"
									type="primary"
									block
									onClick={this.handleChange}
								>
									<Icon type="plus" /> Create a new index
								</Button>
							</Col>
						</Row>
					</Header>
					{this.renderApps()}
				</Layout>
				<CreateAppModal
					history={history}
					handleModal={this.handleChange}
					showModal={showModal}
				/>
			</Fragment>
		);
	}
}

HomePage.propTypes = {
	apps: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	fetchApps: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
	user: get(state, 'user.data.username'),
	apps: get(state, 'apps'),
});

const mapDispatchToProps = dispatch => ({
	fetchApps: () => dispatch(loadApps()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(HomePage);
