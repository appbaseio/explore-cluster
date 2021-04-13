import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { notification } from 'antd';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import { css } from 'emotion';
import { displayErrors } from '../../utils/helper';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { getCachePreferences, saveCachePreferences } from '../../batteries/modules/actions';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import PreferenceForm from './PreferenceForm';
import EvictCache from './EvictCache';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const main = css`
	.actionBtn {
		position: absolute;
		right: 50px;
	}
`;

const bannerDetails = {
	title: 'Build ⚡️ fast search for your end users with appbase.io cache',
	// TODO: Uodate description @siddharth
	description: "Tailor appbase.io's caching preferences based on your search use-case",
	buttonText: 'Read More',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/speed/cache-management/',
};

class CachePreferences extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.form = FormBuilder.group({
			enable_cache: false,
			// This property is in seconds. It should be in between 60s t0 3600s
			max_duration: [
				5 * 60,
				[Validators.required, Validators.min(60), Validators.max(60 * 60)],
			],
			// This property is in MB. It should be in between 128MB to 4GB
			max_size: [128, [Validators.required, Validators.min(128), Validators.max(4 * 1000)]],
			indices: [['*']],
		});
		if (isValidPlan(props.tier, props.featureCache)) {
			props.getPreferences().then((action) => {
				const payload = get(action, 'payload');
				if (payload) {
					this.form.patchValue({
						enable_cache: payload.enable_cache,
						max_duration: parseInt(payload.max_duration, 10),
						max_size: parseInt(payload.max_size, 10),
						indices: payload.indices || ['*'],
					});
				}
			});
		}
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Cache Preferences',
			category: 'Speed',
			label: 'visit',
			value: null,
		});
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Cache Preferences',
			label: 'cache-preferences-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	handleSaveTemplate = () => {
		try {
			const { savePreferences, getPreferences } = this.props;
			const payload = {
				...this.form.value,
				max_duration: Number(this.form.value.max_duration),
				max_size: Number(this.form.value.max_size),
			};
			savePreferences(payload).then((action) => {
				if (get(action, 'payload')) {
					notification.success({
						message: 'Caching preferences saved successfully.',
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
		const { isLoading, preferences, tier, featureCache } = this.props;
		if (!isValidPlan(tier, featureCache)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '90%',
						}}
						lockSectionStyle={{
							marginTop: '20%',
						}}
						src="https://i.imgur.com/NbaxVy0.png"
						alt="cache preferences"
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
					<ErrorToaster>
						<EvictCache />
					</ErrorToaster>
					<ErrorToaster>
						<PreferenceForm
							handleSaveTemplate={this.handleSaveTemplate}
							control={this.form}
						/>
					</ErrorToaster>
				</Container>
			</React.Fragment>
		);
	}
}

CachePreferences.defaultProps = {
	preferences: {},
};

CachePreferences.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	preferences: PropTypes.object,
	errors: PropTypes.array.isRequired,
	getPreferences: PropTypes.func.isRequired,
	savePreferences: PropTypes.func.isRequired,
	tier: PropTypes.string.isRequired,
	featureCache: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	preferences: get(state, '$getCachePreferences.results', {}),
	apps: get(state, 'apps.data', {}),
	tier: get(state, '$getAppPlan.results.tier'),
	featureCache: get(state, '$getAppPlan.results.feature_cache', false),
	isLoading: get(state, '$getCachePreferences.isFetching', false),
	errors: [get(state, '$getCachePreferences.error'), get(state, '$saveCachePreferences.error')],
});

const mapDispatchToProps = (dispatch) => ({
	getPreferences: () => dispatch(getCachePreferences()),
	savePreferences: (payload) => dispatch(saveCachePreferences(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CachePreferences);
