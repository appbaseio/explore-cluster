import React from 'react';
import { Icon, Tabs, Tooltip, message } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { func, object } from 'prop-types';
import { transformCharts } from '../../../utils';
import { getURL } from '../../../../../constants/config';

const CopyCode = ({ control, getPreferencesPayload }) => {
	const preferences = getPreferencesPayload();

	const contentWithPreferences = (prefs = '') => {
		return `
import { ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";

export default Chart = () => {
  const preferences = ${prefs};

  return (
	<ReactiveBase
	  enableAppbase
	  preferences={preferences}
	  app="${preferences.pipeline ? preferences.pipeline : ''}"
	  url="${getURL()}"
	  credentials="${preferences?.exportSettings?.credentials || ''}"
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

	const removeEmpty = (obj) => {
		// eslint-disable-next-line
		return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
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
			else if (typeof value === 'object') str += `${JSON.stringify(value)}\n`;
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
};

CopyCode.propTypes = {
	control: object,
	getPreferencesPayload: func.isRequired,
};

export default CopyCode;
