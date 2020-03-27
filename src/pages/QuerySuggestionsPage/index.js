import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { notification, Alert, Card, Button } from 'antd';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import { css } from 'emotion';
import { displayErrors } from '../../utils/helper';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import {
	getSuggestionsPreferences,
	saveSuggestionsPreferences,
} from '../../batteries/modules/actions';
import PreferenceForm from './PreferenceForm';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { getURL } from '../../constants/config';
import { getAuthToken } from '../../batteries/components/analytics/utils';
import Flex from '../../batteries/components/shared/Flex';

const main = css`
	.actionBtn {
		position: absolute;
		right: 50px;
	}
`;

const bannerDetails = {
	title: 'Query Suggestions',
	description: 'GUI to manage preferences for query suggestions.',
	buttonText: 'Read more',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/analytics/QuerySuggestions/',
};

const cardStyle = css`
	max-width: 800px;
	margin: auto;
	padding: 0 15px;
	.ant-card-body {
		padding: 24px 0;
	}
`;

class QuerySuggestions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			indices: [],
			total: undefined,
		};
		this.form = FormBuilder.group({
			blacklist: [[]],
			external_suggestions: null,
			min_count: [1, [Validators.required, Validators.min(0), Validators.max(1000)]],
			min_hits: [5, [Validators.required, Validators.min(0)]],
			number_of_days: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
			indices: [['*']],
		});
		if (isValidPlan(props.tier, props.featureSuggestions)) {
			props.getPreferences().then(action => {
				const payload = get(action, 'payload');
				if (payload) {
					this.form.patchValue({
						blacklist: payload.blacklist || [],
						external_suggestions: payload.external_suggestions,
						min_count: parseInt(payload.min_count, 10),
						min_hits: parseInt(payload.min_hits, 10),
						number_of_days: parseInt(payload.number_of_days, 10),
						indices: payload.indices || ['*'],
					});
				}
			});
			fetch(`${getURL()}/_alias`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${getAuthToken()}`,
				},
			})
				.then(res => res.json())
				.then(indices => {
					this.setState({
						indices: Object.keys(indices),
					});
				})
				.catch(err => console.error(err));
			fetch(`${getURL()}/.suggestions/_search`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${getAuthToken()}`,
				},
				body: JSON.stringify({
					size: 0,
					query: { match_all: {} },
				}),
			})
				.then(res => res.json())
				.then(res => {
					let total;
					if (typeof get(res, 'hits.total') === 'object') {
						total = get(res, 'hits.total.value');
					} else {
						total = get(res, 'hits.total');
					}

					this.setState({
						total,
					});
				})
				.catch(err => console.error(err));
		}
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	handleSaveTemplate = () => {
		try {
			const { savePreferences, getPreferences } = this.props;

			const payload = {
				...this.form.value,
				min_count: Number(this.form.value.min_count),
				min_hits: Number(this.form.value.min_hits),
				number_of_days: Number(this.form.value.number_of_days),
				external_suggestions:
					this.form.value.external_suggestions &&
					typeof this.form.value.external_suggestions === 'string'
						? JSON.parse(this.form.value.external_suggestions)
						: [],
			};
			savePreferences(payload).then(action => {
				if (get(action, 'payload')) {
					notification.success({
						message: 'Query Suggestions preferences saved successfully.',
					});
					getPreferences();
				}
			});
		} catch (e) {
			notification.error({
				message: e.message,
			});
		}
	};

	render() {
		const { isLoading, preferences, tier, featureSuggestions } = this.props;
		const { indices, total } = this.state;
		if (!isValidPlan(tier, featureSuggestions)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/c6P8eN8.png"
						alt="analytics"
					/>
				</React.Fragment>
			);
		}
		if (isLoading && !preferences) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<Container css={main}>
					{total !== undefined && get(preferences, 'index') && (
						<Card className={cardStyle}>
							<Flex justifyContent="space-between" style={{ alignItems: 'center' }}>
								<Flex>
									<Alert
										message={`Last synced ${total} query suggestions at ${moment(
											preferences.last_synced_time * 1000,
										).format('MMM DD, YYYY hh:mm A')}.`}
										type="info"
										showIcon
									/>
								</Flex>
								<Flex>
									<Button
										type="primary"
										href={`/app/${preferences.index}/browse`}
									>
										Browse Data
									</Button>
								</Flex>
							</Flex>
						</Card>
					)}
					<PreferenceForm
						indices={indices}
						handleSaveTemplate={this.handleSaveTemplate}
						control={this.form}
					/>
				</Container>
			</React.Fragment>
		);
	}
}

QuerySuggestions.defaultProps = {
	preferences: {},
};

QuerySuggestions.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	preferences: PropTypes.object,
	errors: PropTypes.array.isRequired,
	getPreferences: PropTypes.func.isRequired,
	savePreferences: PropTypes.func.isRequired,
	tier: PropTypes.string.isRequired,
	featureSuggestions: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
	preferences: get(state, '$getSuggestionsPreferences.results', {}),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSuggestions: get(state, '$getAppPlan.results.feature_suggestions', false),
	isLoading: get(state, '$getSuggestionsPreferences.isFetching', false),
	errors: [
		get(state, '$getSuggestionsPreferences.error'),
		get(state, '$saveSuggestionsPreferences.error'),
	],
});

const mapDispatchToProps = dispatch => ({
	getPreferences: () => dispatch(getSuggestionsPreferences()),
	savePreferences: payload => dispatch(saveSuggestionsPreferences(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(QuerySuggestions);
