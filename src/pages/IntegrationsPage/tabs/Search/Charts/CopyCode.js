import React from 'react';
import { Icon, Tabs, Tooltip, message } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { func, object, string } from 'prop-types';
import get from 'lodash/get';
import { transformCharts } from '../../../utils';
import { getURL } from '../../../../../constants/config';
import { removeEmpty } from '../../../utils/index';
import { BACKENDS } from '../../../../../batteries/utils';

const CopyCode = ({ control, getPreferencesPayload, backend }) => {
	const preferences = getPreferencesPayload();

	const contentWithPreferences = (prefs = '') => {
		const pipeline = get(preferences, 'pipeline', '');
		const secondaryPipeline = get(preferences, 'indexSettings.index', '');
		const mainFusionSettings = get(preferences, 'fusionSettings', {});
		const pageSettings = get(preferences, 'pageSettings', {});
		const pageFusionSettings = get(
			pageSettings,
			`pages.${pageSettings.currentPage}.indexSettings.fusionSettings`,
			mainFusionSettings,
		);
		const fusionSettings = Object.assign({}, mainFusionSettings, pageFusionSettings);

		return `
import { ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";

export default Chart = () => {
  const preferences = ${prefs};

  return (
	<ReactiveBase
	  enableAppbase
	  preferences={preferences}
	  app="${secondaryPipeline || pipeline}"
	  url="${getURL()}"
	  credentials="${preferences?.exportSettings?.credentials || ''}"
	  ${
			backend === BACKENDS.FUSION.name
				? `transformRequest={(props) => {
		const newBody = JSON.parse(props.body);
		newBody.metadata = {
			app: "${fusionSettings.app || ''}",
			profile: "${fusionSettings.profile || ''}",
			suggestion_profile: "${fusionSettings.searchProfile || ''}",
			sponsored_profile: "${fusionSettings.sponsoredProfile || ''}",
		};
		props.body = JSON.stringify(newBody);

		return props;
	}}`
				: ''
		}
	>
	  <ReactiveComponent
		componentId="${control.componentId ? control.componentId : 'chartComponent'}"
		preferencesPath="pageSettings.pages.${
			preferences?.pageSettings?.currentPage || 'home'
		}.componentSettings.${control.componentId || 'chartComponent'}"
	  />
	</ReactiveBase>
  )
}`;
	};

	const propsBasedOnComponent = () => {
		const newControl = removeEmpty(transformCharts(control));
		delete newControl.componentType;
		let str = '';
		if (!newControl.componentId) str = '\tcomponentId="chartComponent"\n';
		Object.entries(newControl).forEach(([key, value]) => {
			str += `\t${key}=`;
			// eslint-disable-next-line
			if (typeof value === 'boolean' || (typeof value === 'number' && isFinite(value)))
				str += `{${value}}\n`;
			else if (typeof value === 'object') str += `{${JSON.stringify(value)}}\n`;
			else str += `"${value}"\n`;
		});
		return str;
	};

	const contentWithoutPreferences = () => {
		return `
import { ReactiveChart } from "@appbaseio/reactivesearch";

<ReactiveChart
${propsBasedOnComponent()}/>
`;
	};

	const copyToClipboard = () => {
		message.success('Copied to clipboard', 5);
	};

	const updateFacets = () => {
		const newPreferences = { ...preferences };
		if (newPreferences.pageSettings.currentPage) {
			const newControl = transformCharts(control);
			const newObj = {
				[newControl.componentId || 'chartComponent']: {
					enabled: true,
					rsConfig: {
						...newControl,
					},
				},
			};

			newPreferences.pageSettings.pages[
				newPreferences.pageSettings.currentPage
			].componentSettings = {
				...newPreferences.pageSettings.pages[newPreferences.pageSettings.currentPage]
					.componentSettings,
				...newObj,
			};
		}

		return newPreferences;
	};

	const transformedPreferences = updateFacets();

	return (
		<div>
			<h3 className="section-header">Copy Code For This Component</h3>
			<Tabs>
				<Tabs.TabPane
					tab={
						<>
							Complete Code
							<Tooltip title="Using preferences is ideal so that the component renders with the latest version of saved preferences.">
								<Icon type="info-circle" style={{ marginLeft: 5 }} />
							</Tooltip>
						</>
					}
					key="1"
				>
					<div>
						<CopyToClipboard
							text={contentWithPreferences(
								JSON.stringify(transformedPreferences, null, 2),
							)}
							onCopy={copyToClipboard}
						>
							<Icon type="copy" theme="outlined" className="icon-active" />
						</CopyToClipboard>
						<pre>{contentWithPreferences(JSON.stringify(transformedPreferences))}</pre>
					</div>
				</Tabs.TabPane>
				<Tabs.TabPane
					tab={
						<>
							Component Code
							<Tooltip title="Using direct props is useful when you are exporting this component individually without using the preferences.">
								<Icon type="info-circle" style={{ marginLeft: 5 }} />
							</Tooltip>
						</>
					}
					key="2"
				>
					<div>
						<CopyToClipboard
							text={contentWithoutPreferences()}
							onCopy={copyToClipboard}
						>
							<Icon type="copy" theme="outlined" className="icon-active" />
						</CopyToClipboard>
						<pre>{contentWithoutPreferences()}</pre>
					</div>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

CopyCode.defaultProps = {
	control: {},
	backend: BACKENDS.ELASTICSEARCH.name,
};

CopyCode.propTypes = {
	control: object,
	getPreferencesPayload: func.isRequired,
	backend: string,
};

export default CopyCode;
