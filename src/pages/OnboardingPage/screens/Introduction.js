/* eslint-disable jsx-a11y/no-autofocus,jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, notification } from 'antd';
import Footer from '../components/Footer';

import appbaseHelpers from '../utils/appbaseHelpers';
import { validateAppName, validationsList } from '../../../utils/helper';

export default class Introduction extends Component {
	constructor(props) {
		super(props);

		const appId = appbaseHelpers.getApp();

		this.state = {
			status: '',
			error: '',
			// eslint-disable-next-line react/no-unused-state
			appId,
		};
	}

	setError = (e) => {
		if (this.interval) clearInterval(this.interval);
		this.setState(
			{
				status: '',
				error: e,
			},
			() => {
				this.interval = setTimeout(() => {
					this.setState({ error: '' });
				}, 5000);
			},
		);
	};

	createApp = () => {
		const { value } = this.input;
		const isValidAppName = validateAppName(value);
		let app = {};

		this.setState({
			status: 'Creating your index... Please wait!',
			error: '',
		});

		if (!value || !value.trim()) {
			this.setError('Index name cannot be left empty.');
			this.input.focus();
		} else if (!isValidAppName) {
			this.setError('Invalid index name. Please follow the validations rules.');
			notification.error({
				message: 'Invalid Index name',
				description: (
					<List
						bordered={false}
						size="small"
						dataSource={validationsList}
						renderItem={(item) => <List.Item>{item}</List.Item>}
					/>
				),
				duration: 20,
			});
			this.input.focus();
		} else {
			appbaseHelpers
				.createApp(value)
				.then((res) => res.json())
				.then((res) => {
					if (res.index) {
						app = {
							appName: value,
							id: value,
						};
						appbaseHelpers.updateApp(app);
						const { nextScreen, setAppName } = this.props;
						setAppName(value);

						this.setState(
							{
								// eslint-disable-next-line react/no-unused-state
								appId: value,
							},
							nextScreen,
						);
					} else if (res.error) {
						const defaultMsg =
							'Your index name is not unique. Please try with a different index name.';
						this.setError(res.error.message || defaultMsg);
						this.input.focus();
					} else {
						this.setError(
							'Your index name is not unique. Please try with a different index name.',
						);
						this.input.focus();
					}
				})
				.catch(() => {
					this.setError(
						'Some error occurred. Please try again with a different index name.',
					);
				});
		}
	};

	renderAppInput = () => {
		const { error, status } = this.state;
		return (
			<div className="search-field-container small" style={{ marginLeft: 0 }}>
				<div>
					<h3>Pick a unique index name</h3>
					<p>Get started by creating a search index.</p>
				</div>
				<div className="input-wrapper">
					<input
						autoFocus
						data-cy="index-name"
						className="input"
						ref={(ref) => {
							this.input = ref;
						}}
						type="text"
					/>
					<a
						className={`button primary ${status ? 'disabled' : ''}`}
						onClick={this.createApp}
						data-cy="submit-index-name"
					>
						Submit
					</a>
				</div>
				{status && <p>{status}</p>}
				{error && <p style={{ color: 'tomato' }}>{error}</p>}
			</div>
		);
	};

	render() {
		const { nextScreen } = this.props;
		return (
			<div>
				<div className="wrapper">
					<div>
						<img src="/static/images/onboarding/Create.svg" alt="create app" />
					</div>
					<div className="content">
						<header>
							<h2>Creating your first index with ReactiveSearch</h2>
							<p>
								An index in ReactiveSearch is the same as an
								Elasticsearch/OpenSearch index—roughly like a table in SQL.
							</p>
						</header>
						{this.renderAppInput()}
						<div style={{ width: 600 }}>
							<img
								src="/static/images/onboarding/app-index.png"
								alt="App"
								style={{
									width: 300,
									margin: '40px auto 20px',
									display: 'block',
								}}
							/>
							<p>
								An index holds all the data as JSON documents that can be searched
								with rich queries and aggregations.
							</p>
						</div>
					</div>
				</div>
				<Footer nextScreen={nextScreen} disabled />
			</div>
		);
	}
}

Introduction.propTypes = {
	nextScreen: PropTypes.func,
	setAppName: PropTypes.func.isRequired,
};

Introduction.defaultProps = {
	nextScreen: null,
};
