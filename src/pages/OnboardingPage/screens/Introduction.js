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
			status: 'Creating your app... Please wait!',
			error: '',
		});

		if (!value || !value.trim()) {
			this.setError('App name cannot be left empty.');
			this.input.focus();
		} else if (!isValidAppName) {
			this.setError('Invalid App name. Please follow the validations rules.');
			notification.error({
				message: 'Invalid App name',
				description: (
					<List
						bordered={false}
						size="small"
						dataSource={validationsList}
						renderItem={(item) => <List.Item>{item}</List.Item>}
					/>
				),
				duration: 10,
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
					} else if (res.error && res.error.code === 402) {
						this.setError(
							res.error.message ?? 'Something went wrong while creating the index',
						);
						this.input.focus();
					} else {
						this.setError(
							'Your app name is not unique. Please try with a different app name.',
						);
						this.input.focus();
					}
				})
				.catch(() => {
					this.setError(
						'Some error occurred. Please try again with a different app name.',
					);
				});
		}
	};

	renderAppInput = () => {
		const { error, status } = this.state;
		return (
			<div className="search-field-container small" style={{ marginLeft: 0 }}>
				<div>
					<h3>Pick a unique app name</h3>
					<p>
						Get started by creating an app which will serve as your elasticsearch index.
					</p>
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
							<h2>Creating your first app with reactivesearch.io</h2>
							<p>
								An app in reactivesearch.io is equivalent to an index in
								Elasticsearch (or like a database in SQL).
							</p>
						</header>
						{this.renderAppInput()}
						<div style={{ width: 600 }}>
							<img
								src="/static/images/onboarding/app.png"
								srcSet="/static/images/onboarding/app.png 351w, /static/images/onboarding/app@2x.png 702w"
								alt="App"
								style={{
									width: 300,
									margin: '40px auto 20px',
									display: 'block',
								}}
							/>
							<p>
								An app holds all the data as JSON documents that can be searched
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
