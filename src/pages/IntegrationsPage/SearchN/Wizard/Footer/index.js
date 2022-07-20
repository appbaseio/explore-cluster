import React, { useState } from 'react';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import { Affix, Button, Icon } from 'antd';
import { connect } from 'react-redux';
import { func, object, string } from 'prop-types';
import {
	getSearchPreferencesN,
	saveSearchPreferenceN,
} from '../../../../../batteries/modules/actions';
import { commitCode, generateInlineSandboxURL } from '../../../utils/sandpack-generator';
import { transformPreferences } from '../../../utils/index';
import { footerStyles } from '../styles';

const Footer = ({
	history,
	activeKey,
	tabsValidated,
	setActiveKey,
	getSearchPreferences,
	updateSearchPreferences,
	getPreferencesPayload,
	preferenceId,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		setIsLoading(true);
		const preferences = { ...getPreferencesPayload() };
		let obj = {};
		if (get(preferences, 'themeSettings.type', 'classic') === 'geo') {
			obj = {
				...obj,
				mapLayout: 'map',
				mapComponent: 'googleMap',
				locationDataField: '',
				defaultZoom: 5,
				showSearchAsMove: true,
				showMarkerClusters: true,
				mapsAPIkey: '',
			};
		}
		const newPreferences = transformPreferences({
			...preferences,
			resultSettings: {
				...preferences.resultSettings,
				...obj,
			},
		});
		newPreferences.facetSettings.staticFacets = [];

		const response = await generateInlineSandboxURL(newPreferences);
		const newObj = {};
		Object.keys(response).forEach((path) => {
			if (path[0] === '/') {
				const newPath = path.slice(1);
				newObj[newPath] = response[path];
			} else {
				newObj[path] = response[path];
			}
		});
		const body = {
			metadata: {
				commit: 'system commit: auto save UI builder panel preferences',
			},
			content: newObj,
		};

		commitCode(preferenceId, body)
			.then(() => {
				// form.get('versionId').setValue(res.version_id);
				updateSearchPreferences(newPreferences).then((action) => {
					if (!(action && action.error)) {
						getSearchPreferences();
						setIsLoading(false);
						history.push(`/cluster/search-builder/${preferenceId}`);
					}
				});
			})
			.catch((err) => {
				console.error('Error to save preferences', err);
			});
	};

	return (
		<Affix offsetBottom={0}>
			<div css={footerStyles}>
				<div className="footer-container">
					<div>
						{activeKey !== '1' ? (
							<Button
								type="primary"
								onClick={() => setActiveKey(activeKey === '2' ? '1' : '2')}
							>
								◀ Back
							</Button>
						) : null}
					</div>
					{activeKey === '3' ? (
						<Button type="primary" disabled={!tabsValidated.tab3} onClick={handleSave}>
							<Icon type={isLoading ? 'loading' : ''} /> Finish ▶
						</Button>
					) : (
						<Button
							type="primary"
							disabled={!tabsValidated[`tab${activeKey}`]}
							onClick={() => setActiveKey(activeKey === '1' ? '2' : '3')}
						>
							Next ▶
						</Button>
					)}
				</div>
			</div>
		</Affix>
	);
};

Footer.defaultProps = {
	activeKey: '1',
	tabsValidated: {},
	setActiveKey: () => {},
	preferenceId: '',
};

Footer.propTypes = {
	activeKey: string,
	preferenceId: string,
	tabsValidated: object,
	setActiveKey: func,
	history: object.isRequired,
	updateSearchPreferences: func.isRequired,
	getSearchPreferences: func.isRequired,
	getPreferencesPayload: func.isRequired,
};

const mapDispatchToProps = (dispatch, props) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesN()),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreferenceN(props.preferenceId, payload)),
});

export default connect(null, mapDispatchToProps)(withRouter(Footer));
