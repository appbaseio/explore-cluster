import React, { useEffect, useState } from 'react';
import { Icon, Tabs, Tooltip, message } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { componentTypes } from '@appbaseio/reactivesearch';
import { func, object } from 'prop-types';
import { transformFacets } from '../../../utils';
import { getURL } from '../../../../../constants/config';

const CopyCode = ({ control, getPreferencesPayload }) => {
	const [component, setComponent] = useState('MultiList');

	const preferences = getPreferencesPayload();

	useEffect(() => {
		if (control.filterType === 'list') {
			setComponent(
				capitalizeFirstLetter(getKeyByValue(control.componentType) || 'MultiList'),
			);
		} else if (control.filterType === 'range' && control.startValue && control.endValue) {
			setComponent('RangeInput');
		} else {
			setComponent('DynamicRangeSlider');
		}
	}, [control]);

	const contentWithPreferences = (prefs = '') => {
		return `
import { ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";

export default Filter = () => {
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
		componentId="${control.componentId ? control.componentId : 'facet'}"
		preferencesPath="pageSettings.pages.${
			preferences?.pageSettings?.currentPage || 'home'
		}.componentSettings.${control.componentId || 'facet'}"
	  />
	</ReactiveBase>
  )
}`;
	};

	const removeEmpty = (obj) => {
		return Object.fromEntries(
			Object.entries(obj)
				// eslint-disable-next-line
				.filter(([_, v]) => v != null)
				.map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v]),
		);
	};

	const propsBasedOnComponent = () => {
		const newControl = removeEmpty(transformFacets(control));
		delete newControl.componentType;
		let str = '';
		if (!newControl.componentId) str = '\tcomponentId="facet"\n';
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
import { ${component} } from "@appbaseio/reactivesearch";

<${component}
${propsBasedOnComponent()}/>
`;
	};

	const copyToClipboard = () => {
		message.success('Copied to clipboard', 5);
	};

	const getKeyByValue = (value) => {
		return Object.keys(componentTypes).find((key) => componentTypes[key] === value);
	};
	const capitalizeFirstLetter = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	const updateFacets = () => {
		const newPreferences = { ...preferences };
		if (newPreferences.pageSettings.currentPage) {
			const newControl = transformFacets(control);
			const newObj = {
				[newControl.componentId || 'facet']: {
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
