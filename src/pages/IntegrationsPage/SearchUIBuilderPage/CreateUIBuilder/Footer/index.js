import React, { useState } from 'react';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import { Affix, Button, message } from 'antd';
import { connect } from 'react-redux';
import { func, object, string } from 'prop-types';
import {
	getSearchPreferences as getSearchPreferencesAction,
	saveSearchPreference,
} from '../../../../../batteries/modules/actions';
import { commitCode, generateInlineSandboxURL } from '../../../utils/sandpack-generator';
import {
	transformPreferences,
	getTemplate,
	transformResultsDefaultFields,
} from '../../../utils/index';
import files from '../../../../../../templates/files';
import { footerStyles } from '../styles';

import { BACKENDS } from '../../../../../batteries/utils';
import PreviewModal from '../../../shared/PreviewModal';

const Footer = ({
	form,
	history,
	activeKey,
	tabsValidated,
	setActiveKey,
	getSearchPreferences,
	updateSearchPreferences,
	getPreferencesPayload,
	preferenceId,
	pipeline,
	getPreferences,
	clientId,
	backend,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const getDefaultPreferences = (preferences) => {
		let fileName = '';
		const newPrefs = JSON.parse(JSON.stringify({ ...preferences }));
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
						} else if (component === 'result') {
							newObj[component] = {
								...newPrefs.pageSettings.pages[page].componentSettings.result,
								...newComponentSettings[component],
								fields: {
									...newPrefs.pageSettings.pages[page].componentSettings.result
										.fields,
								},
							};
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
		if (defaultPrefs.authenticationSettings) {
			newPrefs.authenticationSettings = defaultPrefs.authenticationSettings;
		}
		// Set the default UI builder name
		newPrefs.name = `Search ${newPrefs.pipeline || ''} + ${template.label || ''}`;
		// Set the templateVersionId to the latest template version Id
		if (newPrefs?.globalSettings?.meta?.templateSettings)
			newPrefs.globalSettings.meta.templateSettings.templateVersionId = template.version;
		else if (newPrefs?.globalSettings?.meta)
			newPrefs.globalSettings.meta = {
				...newPrefs.globalSettings.meta,
				templateSettings: { templateVersionId: template.version },
			};
		return newPrefs;
	};

	const setInitialHighlightConfig = (componentSettings) => {
		const newComponentSettings = { ...componentSettings };
		const resultFields = get(componentSettings, 'result.fields', {});
		const { title, description } = resultFields;
		newComponentSettings.result.fields = {
			...newComponentSettings.result.fields,
			title: `${title.split('~')[0]}~true`,
			description: `${description.split('~')[0]}~true`,
		};
		newComponentSettings.result.resultHighlight = true;
		newComponentSettings.search.fields = {
			...newComponentSettings.search.fields,
			title: `${title.split('~')[0]}~true`,
			description: `${description.split('~')[0]}~true`,
		};

		return newComponentSettings;
	};

	const setSecondaryData = (prefs) => {
		const preferences = { ...prefs };
		const { pipeline: mainPipeline, fusionSettings, pageSettings } = preferences;
		let endpointObj = {};
		const exportSettings = get(preferences, 'exportSettings', {});

		if (backend === BACKENDS.FUSION.name) {
			endpointObj = {
				url: `/_fusion/_reactivesearch`,
				method: 'POST',
				headers: `{"Authorization":"Basic ${btoa(exportSettings.credentials || '')}"}`,
			};
			preferences.fusionSettings.searchProfile = get(fusionSettings, 'profile', '');
		} else if (backend === BACKENDS.MONGODB.name) {
			endpointObj = {
				url: `/_mongodb/_reactivesearch`,
				method: 'POST',
				headers: `{"Authorization":"Basic ${btoa(exportSettings.credentials || '')}"}`,
			};
		} else {
			endpointObj = {
				url: `/${mainPipeline}/_reactivesearch`,
				method: 'POST',
				headers: `{"Authorization":"Basic ${btoa(exportSettings.credentials || '')}"}`,
			};
		}
		preferences.globalSettings.endpoint = endpointObj;

		if (pageSettings && pageSettings.pages) {
			Object.keys(pageSettings.pages).forEach((page) => {
				if (backend === BACKENDS.FUSION.name) {
					pageSettings.pages[page].indexSettings = {
						fusionSettings: {
							app: get(fusionSettings, 'app', ''),
							profile: get(fusionSettings, 'profile', ''),
							searchProfile: get(fusionSettings, 'profile', ''),
							meta: { sponsoredProfile: '' },
						},
						index: '_fusion',
						endpoint: endpointObj,
					};
				} else if (backend === BACKENDS.MONGODB.name) {
					const { globalSettings = {} } = preferences;
					const mongoDBSettings = get(globalSettings, 'meta.mongoDBSettings', {});
					pageSettings.pages[page].indexSettings = {
						mongoDBSettings,
						index: mainPipeline,
						endpoint: endpointObj,
					};
				} else {
					pageSettings.pages[page].indexSettings = {
						index: mainPipeline,
						endpoint: endpointObj,
					};
				}
				pageSettings.pages[page].componentSettings = {
					...setInitialHighlightConfig(pageSettings.pages[page].componentSettings),
				};
			});
		}

		return preferences;
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
				defaultZoom: 5,
				showSearchAsMove: true,
				showMarkerClusters: true,
				mapsAPIkey: '',
			};
		}
		const newPrefs = transformPreferences({
			...preferences,
			resultSettings: {
				...preferences.resultSettings,
				...obj,
			},
		});
		const newPreferences = transformResultsDefaultFields(newPrefs);
		const prefenecesWithDefaultFacets = getDefaultPreferences(
			JSON.parse(JSON.stringify({ ...newPreferences })),
		);
		const prefenecesWithSecondaryPipeline = setSecondaryData(prefenecesWithDefaultFacets);
		const response = await generateInlineSandboxURL(prefenecesWithSecondaryPipeline);
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
		// inject auth0 clientId in authentication settings
		if (prefenecesWithSecondaryPipeline.authenticationSettings && clientId) {
			prefenecesWithSecondaryPipeline.authenticationSettings.clientId = clientId;
		}

		commitCode(preferenceId, body)
			.then(() => {
				updateSearchPreferences(prefenecesWithSecondaryPipeline).then((action) => {
					if (!(action && action.error)) {
						getSearchPreferences();
						history.push(`/cluster/search-builder/${preferenceId}`);
					} else if (action.error.message) message.error(action.error.message);
					setIsLoading(false);
				});
			})
			.catch((err) => {
				setIsLoading(false);
				// eslint-disable-next-line no-console
				console.error('Error to save preferences', err);
			});
	};

	return (
		<Affix offsetBottom={0}>
			<div className={footerStyles}>
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
						<div>
							<PreviewModal
								pipeline={pipeline}
								preferences={getPreferences}
								preferenceId={preferenceId}
								form={form}
								getPreferencesPayload={getPreferencesPayload}
								buttonProps={{
									size: 'default',
									style: { marginRight: 10 },
								}}
							/>
							<Button
								type="primary"
								disabled={!tabsValidated.tab3}
								onClick={handleSave}
								loading={isLoading}
							>
								Finish ▶
							</Button>
						</div>
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
	pipeline: '',
	clientId: '',
	backend: BACKENDS.ELASTICSEARCH.name,
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
	form: object.isRequired,
	pipeline: string,
	getPreferences: func.isRequired,
	clientId: string,
	backend: string,
};

const mapStateToProps = (state) => ({
	clientId: get(state, '$getAuth0Preferences.results')?.['_client_id'],
	backend: get(state, '$getAppPlan.results.backend'),
});

const mapDispatchToProps = (dispatch, props) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesAction()),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreference(props.preferenceId, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Footer));
