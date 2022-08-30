import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { notification } from 'antd';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import { css } from 'emotion';
import { displayErrors } from '../../../utils/helper';
import Loader from '../../../batteries/components/shared/Loader/Spinner';
import Container from '../../../components/Container';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import {
	getRecentSuggestionsPreferences,
	saveRecentSuggestionsPreferences,
} from '../../../batteries/modules/actions';
import PreferenceForm from './PreferenceForm';
import { isValidPlan } from '../../../batteries/utils';
import { getURL } from '../../../constants/config';
import { getAuthToken } from '../../../batteries/components/analytics/utils';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';
import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';
import { PreferenceFormContext } from '../IndexSuggestions';

const main = css`
	.actionBtn {
		position: absolute;
		right: 50px;
	}
`;

const bannerDetails = {
	title: 'Recent Suggestions',
	description:
		'GUI to manage preferences for recent suggestions. Recent suggestions are stored in the .suggestions index by reactivesearch.io based on the analytics data of what end users are searching for.',
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.appbase.io/docs/analytics/recent-suggestions/',
};

class RecentSuggestions extends React.Component {
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
			minHits: [0, [Validators.required, Validators.min(0)]],
			size: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
			minChars: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
			indices: [['*']],
		});
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Recent Suggestions',
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
			label: 'recent-suggestions-time',
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
					minHits: parseInt(payload.minHits, 10) || 0,
					size: parseInt(payload.size, 10) || 1,
					minChars: parseInt(payload.minChars, 10) || 0,
					indices: payload.indices || ['*'],
				});
				this.setState({
					initialData: {
						minHits: parseInt(payload.minHits, 10) || 0,
						size: parseInt(payload.size, 10) || 1,
						minChars: parseInt(payload.minChars, 10) || 0,
						indices: payload.indices || ['*'],
					},
				});
			} else {
				this.setState({
					initialData: {
						minHits: 0,
						size: 1,
						minChars: 0,
						indices: ['*'],
					},
				});
			}
		});
	};

	handleSaveTemplate = (obj = '') => {
		try {
			const { savePreferences } = this.props;
			let payload;
			if (obj) {
				payload = {};
			} else {
				payload = {
					...this.form.value,
					minHits: Number(this.form.value.minHits),
					size: Number(this.form.value.size),
					minChars: Number(this.form.value.minChars),
				};
			}
			savePreferences(payload).then((action) => {
				if (get(action, 'payload')) {
					notification.success({
						message: get(
							action,
							'payload.message',
							'Recent Suggestions preferences saved successfully.',
						),
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
						value: 'recent',
						saveTemplate: this.handleSaveTemplate,
					}}
				>
					<Container css={main}>
						{total !== undefined && get(preferences, 'index') && !hide && (
							<>
								<Banner {...bannerDetails} />
							</>
						)}
						<ErrorToaster>
							{Object.keys(initialData).length > 0 && (
								<PreferenceForm
									indices={indices}
									control={this.form}
									initialData={initialData}
								/>
							)}
						</ErrorToaster>
					</Container>
				</PreferenceFormContext.Provider>
			</React.Fragment>
		);
	}
}

RecentSuggestions.defaultProps = {
	preferences: {},
	apps: {},
	hide: false,
};

RecentSuggestions.propTypes = {
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
	preferences: get(state, '$getRecentSuggestionsPreferences.results', {}),
	apps: get(state, 'apps.data', {}),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSuggestions: get(state, '$getAppPlan.results.feature_suggestions', false),
	isLoading: get(state, '$getRecentSuggestionsPreferences.isFetching', false),
	errors: [
		get(state, '$getRecentSuggestionsPreferences.error'),
		get(state, '$saveRecentSuggestionsPreferences.error'),
	],
});

const mapDispatchToProps = (dispatch) => ({
	getPreferences: () => dispatch(getRecentSuggestionsPreferences()),
	savePreferences: (payload) => dispatch(saveRecentSuggestionsPreferences(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RecentSuggestions);
