import React, { useState } from 'react';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import { Affix, Button } from 'antd';
import { connect } from 'react-redux';
import { func, object, string } from 'prop-types';
import {
	getSearchPreferencesN,
	saveSearchPreferenceN,
} from '../../../../../batteries/modules/actions';
import { commitCode, generateInlineSandboxURL } from '../../../utils/sandpack-generator';
import { transformPreferences, getTemplate } from '../../../utils/index';
import files from '../../../../../../templates/files';
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

	const getDefaultPreferences = (preferences) => {
		let fileName = '';
		const newPrefs = { ...JSON.parse(JSON.stringify(preferences)) };
		const themeType = get(preferences, 'themeSettings.type', '');
		const template = getTemplate(themeType);
		if (Object.keys(template).length) {
			if (template.version) {
				fileName = `${template.repository}@${template.version}`;
			} else if (template.commit) {
				fileName = `${template.repository}@${template.commit}`;
			} else if (template.branch) {
				fileName = `${template.repository}@${template.branch}`;
			} else {
				fileName = `${template.repository}@master`;
			}
		}
		const templateFiles = { ...files[fileName] };
		const defaultPrefs = JSON.parse(
			templateFiles['/src/utils/reactivesearchPreferences.json'] || '{}',
		);
		if (defaultPrefs && defaultPrefs.pageSettings && defaultPrefs.pageSettings.pages) {
			Object.keys(defaultPrefs.pageSettings.pages).forEach((page) => {
				if (newPrefs.pageSettings.pages[page]) {
					const { componentSettings } = defaultPrefs.pageSettings.pages[page];
					const newComponentSettings = {
						...JSON.parse(JSON.stringify(componentSettings)),
					};
					const newObj = {};
					Object.keys(newComponentSettings).forEach((component) => {
						if (component !== 'result' && component !== 'search') {
							newObj[component] = newComponentSettings[component];
							newObj[component].enabled = false;
						}
					});
					newPrefs.pageSettings.pages[page] = {
						...newPrefs.pageSettings.pages[page],
						componentSettings: {
							...newPrefs.pageSettings.pages[page].componentSettings,
							...newObj,
						},
					};
				}
			});
		}

		return newPrefs;
	};

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
		const prefenecesWithDefaultFacets = getDefaultPreferences(newPreferences);
		commitCode(preferenceId, body)
			.then(() => {
				updateSearchPreferences(prefenecesWithDefaultFacets).then((action) => {
					if (!(action && action.error)) {
						getSearchPreferences();
						setIsLoading(false);
						history.push(`/cluster/search-builder/${preferenceId}`);
					}
				});
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
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
						<Button
							type="primary"
							disabled={!tabsValidated.tab3}
							onClick={handleSave}
							loading={isLoading}
						>
							Finish ▶
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
