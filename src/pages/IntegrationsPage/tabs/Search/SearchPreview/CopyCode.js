import React from 'react';
import get from 'lodash/get';
import { CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Tabs, Tooltip, message } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { func, object, string } from 'prop-types';
import { getURL } from '../../../../../constants/config';
import { BACKENDS } from '../../../../../batteries/utils';

const CopyCode = ({
	getSearchConfig,
	pipeline,
	getPreferencesPayload,
	backend,
	form,
	indexSettings,
}) => {
	const searchConfig = form && form.value ? getSearchConfig() : {};

	const copyToClipboard = () => {
		message.success('Copied to clipboard', 5);
	};

	const contentWithPreferences = () => {
		const preferences = getPreferencesPayload();
		const mainFusionSettings = form.get('fusionSettings')?.value;
		const pageFusionSettings = get(
			indexSettings,
			'fusionSettings',
			form.get('fusionSettings')?.value,
		);
		const fusionSettings = {
			...mainFusionSettings,
			...pageFusionSettings,
		};
		return `
import { ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";

export default Search = () => {
  const preferences = ${JSON.stringify(preferences)};

  return (
	<ReactiveBase
	  enableAppbase
	  preferences={preferences}
	  app="${pipeline}"
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
		componentId="search"
		preferencesPath="pageSettings.pages.${
			preferences?.pageSettings?.currentPage || 'home'
		}.componentSettings.search"
	  />
	</ReactiveBase>
  )
}`;
	};

	const propsBasedOnComponent = () => {
		let str = '';
		Object.keys(searchConfig).forEach((key) => {
			const searchConfigValue = searchConfig[key];
			str += `\t${key}=`;
			if (
				typeof searchConfigValue === 'boolean' ||
				// eslint-disable-next-line
				(typeof searchConfigValue === 'number' && isFinite(searchConfigValue))
			)
				str += `{${searchConfigValue}}\n`;
			else if (typeof searchConfigValue === 'object')
				str += `{${JSON.stringify(searchConfigValue)}}\n`;
			else str += `"${searchConfigValue}"\n`;
		});
		return str;
	};

	const contentWithoutPreferences = () => {
		return `
import { SearchBox } from "@appbaseio/reactivesearch";

<SearchBox
	componentId="search"
${propsBasedOnComponent()}
/>`;
	};

	return (
		<div>
			<h3 className="section-header">Copy Code For This Component</h3>
			<Tabs>
				<Tabs.TabPane
					tab={
						<>
							Complete Code
							<Tooltip title="Using preferences is ideal so that the component renders with the latest version of saved preferences.">
								<InfoCircleOutlined style={{ marginLeft: 5 }} />
							</Tooltip>
						</>
					}
					key="1"
				>
					<div>
						<CopyToClipboard text={contentWithPreferences()} onCopy={copyToClipboard}>
							<CopyOutlined className="icon-active copy-icon" />
						</CopyToClipboard>
						<pre>{contentWithPreferences()}</pre>
					</div>
				</Tabs.TabPane>
				<Tabs.TabPane
					tab={
						<>
							Component Code
							<Tooltip title="Using direct props is useful when you are exporting this component individually without using the preferences.">
								<InfoCircleOutlined style={{ marginLeft: 5 }} />
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
							<CopyOutlined className="icon-active copy-icon" />
						</CopyToClipboard>
						<pre>{contentWithoutPreferences()}</pre>
					</div>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

CopyCode.propTypes = {
	form: object,
	backend: string.isRequired,
	getSearchConfig: func,
	indexSettings: object,
	pipeline: string,
	getPreferencesPayload: func,
};

CopyCode.defaultProps = {
	form: {},
	getSearchConfig: () => {},
	indexSettings: {},
	pipeline: '',
	getPreferencesPayload: () => {},
};

export default CopyCode;
