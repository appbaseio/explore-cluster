import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Card, notification } from 'antd';
import { FormBuilder, Validators } from 'react-reactive-form';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import PreferenceForm from './PreferenceForm';
import { isValidPlan } from '../../batteries/utils';
import {
	getSyncPreferences,
	saveSyncPreferences,
} from '../../batteries/modules/actions/syncPreferences';

const bannerDetails = {
	title: 'Node Sync Preferences',
	description:
		'Manage node sync preferences for reactivesearch.io when using it in a multi-node setup',
	buttonText: 'Read Docs',
	href: 'https://docs.reactivesearch.io/docs/security/node-sync-preferences/',
};

class SyncPreferences extends React.Component {
	constructor(props) {
		super(props);
		this.form = FormBuilder.group({
			// This property is in seconds. It should be in between 10s to 3600s
			syncInterval: [60, [Validators.required, Validators.min(10), Validators.max(3600)]],
		});
	}

	componentDidMount() {
		const { tier, featureSuggestions, getPreferences } = this.props;
		if (isValidPlan(tier, featureSuggestions)) {
			getPreferences().then((action) => {
				const payload = get(action, 'payload');
				if (payload) {
					this.form.patchValue({
						syncInterval: payload.interval || 60,
					});
				} else {
					this.form.patchValue({
						syncInterval: 60,
					});
				}
			});
		}
	}

	handleSaveTemplate = () => {
		try {
			const { savePreferences, getPreferences } = this.props;
			const payload = {
				interval: Number(this.form.value.syncInterval),
			};
			savePreferences(payload).then((action) => {
				if (get(action, 'payload')) {
					notification.success({
						message: get(
							action,
							'payload.message',
							'Node sync preferences saved successfully.',
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
		const { tier, featureSuggestions, billingType, machinesCount } = this.props;

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

		return (
			<div>
				<Banner {...bannerDetails} />
				<Container style={{ maxWidth: 800 }}>
					<Card style={{ padding: 40 }}>
						{billingType === 'arc' || machinesCount > 1 ? (
							<div>
								<PreferenceForm
									control={this.form}
									handleSaveTemplate={this.handleSaveTemplate}
								/>
							</div>
						) : (
							<div>
								{' '}
								{/* eslint-disable-next-line */}
								You're running reactivesearch.io in a single-node setup. Sync
								Preferences are only applicable when running in a multi-node setup.
							</div>
						)}
					</Card>
				</Container>
			</div>
		);
	}
}

SyncPreferences.propTypes = {
	tier: PropTypes.string,
	featureSuggestions: PropTypes.bool,
	billingType: PropTypes.string.isRequired,
	machinesCount: PropTypes.number.isRequired,
	getPreferences: PropTypes.func.isRequired,
	savePreferences: PropTypes.func.isRequired,
};

SyncPreferences.defaultProps = {
	tier: undefined,
	featureSuggestions: false,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureSuggestions: get(state, '$getAppPlan.results.feature_suggestions', false),
	billingType: get(state, '$getAppPlan.results.billing_type', ''),
	machinesCount: get(state, '$getAppPlan.results.number_of_machines', 0),
});

const mapDispatchToProps = (dispatch) => {
	return {
		getPreferences: () => dispatch(getSyncPreferences()),
		savePreferences: (payload) => dispatch(saveSyncPreferences(payload)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(SyncPreferences);
