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
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import {
	getIndexSuggestionsPreferences,
	saveIndexSuggestionsPreferences,
} from '../../../batteries/modules/actions';
import PreferenceForm from './PreferenceForm';
import { isValidPlan } from '../../../batteries/utils';
import { getURL } from '../../../constants/config';
import { getAuthToken } from '../../../batteries/components/analytics/utils';
import Flex from '../../../batteries/components/shared/Flex';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';
import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';
export const PreferenceFormContext = React.createContext();


const main = css`
	.actionBtn {
		position: absolute;
		right: 50px;
	}
`;

const bannerDetails = {
	title: 'Index Suggestions',
	description:
		'GUI to manage preferences for index suggestions. Index suggestions are stored in the .suggestions index by appbase.io based on the analytics data of what end users are searching for.',
	buttonText: 'Read more',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/analytics/index-suggestions/',
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
		this.startTime = moment();
		this.state = {
			indices: props.apps
				? Object.keys(props.apps)
						.sort()
						.filter((i) => !i.startsWith('.'))
				: [],
			total: undefined,
			initialData: {},
		};
		this.form = FormBuilder.group({
			applyStopwords: false,
			customStopwords: [],
			maxPredictedWords: [1, [Validators.required, Validators.min(1)]],
			customQuery: '',
			includeFields: [['*']],
			excludeFields: [[]],
			urlField: '',
			categoryField: '',
			showDistinctSuggestions: false,
			enablePredictiveSuggestions: false,
			enableSynonyms: false,
			size: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
			indices: [['*']],
		});
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Index Suggestions',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});

		const { tier, featureSuggestions } = this.props;

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
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Search Relevancy',
			label: 'index-suggestions-time',
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
					applyStopwords: payload.applyStopwords || false,
					customStopwords: payload.customStopwords || [],
					maxPredictedWords: parseInt(payload.maxPredictedWords, 10) || 0,
					customQuery: payload.customQuery,
					includeFields: payload.includeFields || ['*'],
					excludeFields: payload.excludeFields || [],
					categoryField: payload.categoryField ,
					urlField: payload.urlField ,
					showDistinctSuggestions: payload.showDistinctSuggestions || false,
					enablePredictiveSuggestions: payload.enablePredictiveSuggestions || false,
					enableSynonyms: payload.enableSynonyms || false,
					size: parseInt(payload.size, 10) || 1,
					indices: payload.indices || ['*'],
				});
				this.setState({
					initialData: {
						applyStopwords: payload.applyStopwords || false,
						customStopwords: payload.customStopwords || [],
						maxPredictedWords: parseInt(payload.maxPredictedWords, 10) || 0,
						customQuery: payload.customQuery ,
						includeFields: payload.includeFields || ['*'],
						excludeFields: payload.excludeFields || [],
						categoryField: payload.categoryField ,
						urlField: payload.urlField ,
						showDistinctSuggestions: payload.showDistinctSuggestions || false,
						enablePredictiveSuggestions:
							payload.enablePredictiveSuggestions || false,
						enableSynonyms: payload.enableSynonyms || false,
						size: parseInt(payload.size, 10) || 1,
						indices: payload.indices || ['*'],
					},
				});
			} else {
				this.setState({
					initialData: {
						applyStopwords: false,
						customStopwords: [],
						maxPredictedWords: 0,
						customQuery: '',
						includeFields: ['*'],
						excludeFields: [],
						categoryField: '',
						urlField: '',
						showDistinctSuggestions: false,
						enablePredictiveSuggestions: false,
						enableSynonyms: false,
						size: 1,
						indices: ['*'],
					},
				});
			}
		});
	}

	handleSaveTemplate = (obj = '') => {
		try {
			const { savePreferences } = this.props;
			let payload;
			if(obj) {
				payload = {};
			} else {
				payload = {
					...this.form.value,
					maxPredictedWords: Number(this.form.value.maxPredictedWords),
					size: Number(this.form.value.size),
				};
			}
			savePreferences(payload).then((action) => {
				if (get(action, 'payload')) {
					notification.success({
						message: 'Index Suggestions preferences saved successfully.',
					});
					this.fetchPreferences();
				}
			});
		} catch (e) {
			notification.error({
				message: e.message,
			});
		}
	};

	render() {
		const { isLoading, preferences, hide } = this.props;
		const { indices, total, initialData } = this.state;

		if (isLoading && !preferences) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				<PreferenceFormContext.Provider
					value={{
						value: "index",
						saveTemplate: this.handleSaveTemplate,
					}}
				>
					<Container css={main}>
						{total !== undefined && get(preferences, 'index') && !hide && (
							<>
								<Banner {...bannerDetails} />
								<Card className={cardStyle}>
									<Flex
										justifyContent="space-between"
										style={{ alignItems: 'center' }}
									>
										<Flex>
											<Alert
												message={`Last synced ${total} index suggestions at ${moment(
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
							</>
						)}
						<ErrorToaster>
							{Object.keys(initialData).length > 0 && (
								<PreferenceForm
									indices={indices}
									control={this.form}
									initialData={initialData}
									// handleSaveTemplate={handleSaveTemplate}
								/>
							)}
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
	hide: false,
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
	hide: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	preferences: get(state, '$getIndexSuggestionsPreferences.results', {}),
	apps: get(state, 'apps.data', {}),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSuggestions: get(state, '$getAppPlan.results.feature_suggestions', false),
	isLoading: get(state, '$getIndexSuggestionsPreferences.isFetching', false),
	errors: [
		get(state, '$getIndexSuggestionsPreferences.error'),
		get(state, '$saveIndexSuggestionsPreferences.error'),
	],
});

const mapDispatchToProps = (dispatch) => ({
	getPreferences: () => dispatch(getIndexSuggestionsPreferences()),
	savePreferences: (payload) => dispatch(saveIndexSuggestionsPreferences(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(QuerySuggestions);
