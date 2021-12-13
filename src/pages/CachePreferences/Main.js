import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { notification } from 'antd';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import PreferenceForm from './PreferenceForm';
import { displayErrors } from '../../utils/helper';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import EvictCache from './EvictCache';
import { isValidPlan } from '../../batteries/utils';
import { versionCompare } from '../../batteries/utils/helpers';
import { getCachePreferences, saveCachePreferences } from '../../batteries/modules/actions';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

class Main extends React.Component {
	constructor(props) {
		super(props);
		let maxDuration = 60 * 60;
		if (versionCompare(props.appbaseVersion, '7.43.1') !== -1) {
			maxDuration = 24 * 60 * 60;
		}
		this.form = FormBuilder.group({
			enable_cache: false,
			// This property is in seconds. It should be in between 60s to 86400s (24h)
			max_duration: [
				5 * 60,
				[Validators.required, Validators.min(60), Validators.max(maxDuration)],
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

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
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
						message: get(
							action,
							'payload.message',
							'Caching preferences saved successfully.',
						),
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
		const { isLoading, preferences } = this.props;
		if (isLoading && !preferences) {
			return <Loader />;
		}
		return (
			<>
				<ErrorToaster>
					<EvictCache />
				</ErrorToaster>
				<ErrorToaster>
					<PreferenceForm
						handleSaveTemplate={this.handleSaveTemplate}
						control={this.form}
					/>
				</ErrorToaster>
			</>
		);
	}
}

Main.defaultProps = {
	preferences: {},
};

Main.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	preferences: PropTypes.object,
	errors: PropTypes.array.isRequired,
	getPreferences: PropTypes.func.isRequired,
	savePreferences: PropTypes.func.isRequired,
	tier: PropTypes.string.isRequired,
	featureCache: PropTypes.bool.isRequired,
	appbaseVersion: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	preferences: get(state, '$getCachePreferences.results', {}),
	appbaseVersion: get(state, '$getAppPlan.results.version'),
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

export default connect(mapStateToProps, mapDispatchToProps)(Main);
