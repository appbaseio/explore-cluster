import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { notification, Alert, Card, Button } from 'antd';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import { css } from 'emotion';
import { displayErrors } from '../../../utils/helper';
import Loader from '../../../batteries/components/shared/Loader/Spinner';
import Container from '../../../components/Container';
import {
	getPopularSuggestionsPreferences,
	savePopularSuggestionsPreferences,
} from '../../../batteries/modules/actions';
import PreferenceForm from './PreferenceForm';
import { isValidPlan } from '../../../batteries/utils';
import { getURL } from '../../../constants/config';
import { getAuthToken } from '../../../batteries/components/analytics/utils';
import Flex from '../../../batteries/components/shared/Flex';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';
import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';
import { PreferenceFormContext  } from '../IndexSuggestions';

const main = css`
	.actionBtn {
		position: absolute;
		right: 50px;
	}
`;

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
		this.startTime = moment();
		this.state = {
			indices: props.apps
				? Object.keys(props.apps)
						.sort()
						.filter((i) => !i.startsWith('.') && !i.startsWith('metricbeat')
						)
				: [],
			total: undefined,
			initialData: {},
		};
		this.form = FormBuilder.group({
			blacklist: [[]],
			externalSuggestions: null,
			minCount: [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
			minHits: [0, [Validators.required, Validators.min(0)]],
			numberOfDays: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
			minChars: [0, [Validators.required, Validators.min(0)]],
			size: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
			transformDiacritics: false,
			indices: [['*']],
		});
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Popular Suggestions',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});

		const {tier, featureSuggestions} = this.props;

		if (isValidPlan(tier, featureSuggestions)) {
			this.fetchPreferences();
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
				.then((res) => res.json())
				.then((res) => {
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
				.catch((err) => console.error(err));
		}

	}

	componentDidUpdate(prevProps) {
		const { errors, apps } = this.props;
		displayErrors(errors, prevProps.errors, true);
		if(prevProps.apps !== apps) {
			this.setState({
				indices: Object.keys(apps)
						.sort()
						.filter((i) => !i.startsWith('.') && !i.startsWith('metricbeat'))
			})
		}
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Search Relevancy',
			label: 'popular-suggestions-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	fetchPreferences = () => {
		const { getPreferences } = this.props;
		getPreferences().then((action) => {
			// prefilling
			const payload = get(action, 'payload');
			if (payload) {
				this.form.patchValue({
					blacklist: payload.blacklist || [],
					externalSuggestions: payload.externalSuggestions || [],
					minCount: parseInt(payload.minCount, 10),
					minHits: parseInt(payload.minHits, 10),
					numberOfDays: payload.numberOfDays || 30,
					minChars: parseInt(payload.minChars, 10),
					size: parseInt(payload.size, 10),
					indices: payload.indices || ['*'],
					transformDiacritics: payload.transformDiacritics,
				});

				this.setState({
					initialData: {
						blacklist: payload.blacklist || [],
						externalSuggestions: payload.externalSuggestions || [],
						minCount: parseInt(payload.minCount, 10),
						minHits: parseInt(payload.minHits, 10),
						numberOfDays: payload.numberOfDays || 30,
						minChars: parseInt(payload.minChars, 10),
						size: parseInt(payload.size, 10),
						indices: payload.indices || ['*'],
						transformDiacritics: payload.transformDiacritics,
					}
				});
			} else {
				this.setState({
					initialData: {
						blacklist: [],
						externalSuggestions: [],
						minCount: 0,
						minHits: 0,
						numberOfDays: 30,
						minChars: 0,
						size: 0,
						indices: ['*'],
						transformDiacritics: false,
					}
				});
			}
		});
	}

	handleSaveTemplate = (obj = '') => {
		try {
			const { savePreferences } = this.props;
			let payload;
			if(obj) {
				payload = {
					numberOfDays: 30,
				};
			} else {
				payload = {
					...this.form.value,
					minCount: Number(this.form.value.minCount),
					minHits: Number(this.form.value.minHits),
					numberOfDays: Number(this.form.value.numberOfDays),
					minChars: Number(this.form.value.minChars),
					size: Number(this.form.value.size),
					externalSuggestions:
						this.form.value.externalSuggestions &&
						typeof this.form.value.externalSuggestions === 'string'
							? JSON.parse(this.form.value.externalSuggestions)
							: [],
				};
			}
			savePreferences(payload).then((action) => {
				if (get(action, 'payload')) {
					notification.success({
						message: 'Popular Suggestions preferences saved successfully.',
					});
					this.fetchPreferences();
				}
			});
		} catch (e) {
			console.log(e);
			notification.error({
				message: e.message,
			});
		}
	};

	render() {
		const { isLoading, preferences } = this.props;
		const { indices, total, initialData } = this.state;
		if (isLoading && !preferences) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				<PreferenceFormContext.Provider
					value={{
						value: "popular",
						saveTemplate: this.handleSaveTemplate,
					}}
				>
					<Container css={main}>
						{total !== undefined && (
							<>
								<Card className={cardStyle}>
									<Flex
										justifyContent="space-between"
										style={{ alignItems: 'center' }}
									>
										<Flex>
											<Alert
												message={`Last synced ${total} popular suggestions at ${moment(
													preferences?.lastSyncedTime * 1000,
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
							</>
						)}
						<ErrorToaster>
							{
								Object.keys(initialData).length > 0 && (
									<PreferenceForm
										indices={indices}
										control={this.form}
										initialData={initialData}
										// handleSaveTemplate={handleSaveTemplate}
									/>
								)
							}

						</ErrorToaster>
					</Container>
				</PreferenceFormContext.Provider>
			</React.Fragment>
		);
	}
}

QuerySuggestions.defaultProps = {
	preferences: {},
	apps: {},
};

QuerySuggestions.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	preferences: PropTypes.object,
	errors: PropTypes.array.isRequired,
	getPreferences: PropTypes.func.isRequired,
	savePreferences: PropTypes.func.isRequired,
	tier: PropTypes.string.isRequired,
	featureSuggestions: PropTypes.bool.isRequired,
	apps: PropTypes.object,
};

const mapStateToProps = (state) => ({
	preferences: get(state, '$getPopularSuggestionsPreferences.results', {}),
	apps: get(state, 'apps.data', {}),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSuggestions: get(state, '$getAppPlan.results.feature_suggestions', false),
	isLoading: get(state, '$getPopularSuggestionsPreferences.isFetching', false),
	errors: [
		get(state, '$getPopularSuggestionsPreferences.error'),
		get(state, '$savePopularSuggestionsPreferences.error'),
	],
});

const mapDispatchToProps = (dispatch) => {
	return {
		getPreferences: () => dispatch(getPopularSuggestionsPreferences()),
		savePreferences: (payload) => dispatch(savePopularSuggestionsPreferences(payload)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(QuerySuggestions);
