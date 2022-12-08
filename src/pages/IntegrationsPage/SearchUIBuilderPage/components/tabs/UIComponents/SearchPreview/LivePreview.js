import React from 'react';
import { ReactiveBase, SearchBox } from '@appbaseio/reactivesearch';
import get from 'lodash/get';
import { func, object, string } from 'prop-types';
import { getURL } from '../../../../../../../constants/config';
import { BACKENDS } from '../../../../../../../batteries/utils';

const LivePreview = ({ form, backend, getSearchConfig, pipeline, indexSettings }) => {
	const transformRequest =
		backend === BACKENDS.FUSION.name
			? (props) => {
					const mainFusionSettings = form.get('fusionSettings')?.value;
					const pageFusionSettings = get(
						indexSettings,
						'fusionSettings',
						form.get('fusionSettings')?.value,
					);
					const fusionSettings = Object.assign(
						{},
						mainFusionSettings,
						pageFusionSettings,
					);
					if (Object.keys(fusionSettings).length) {
						// eslint-disable-next-line
						const newBody = JSON.parse(props.body);
						newBody.metadata = {
							app: fusionSettings.app,
							profile: fusionSettings.profile,
							suggestion_profile: fusionSettings.searchProfile,
						};
						// eslint-disable-next-line
						props.body = JSON.stringify(newBody);
					}
					return props;
			  }
			: undefined;

	const searchConfig = form && form.value ? getSearchConfig() : {};

	return (
		<div>
			<h3 className="section-header">Live Preview</h3>
			<div className="preview-container">
				<ReactiveBase
					app={pipeline}
					url={getURL()}
					credentials={atob(localStorage.getItem('authToken'))}
					enableAppbase
					preferences={{
						search: { rsConfig: { ...searchConfig } },
					}}
					transformRequest={transformRequest}
				>
					<SearchBox componentId="search" {...searchConfig} />
				</ReactiveBase>
			</div>
		</div>
	);
};

LivePreview.propTypes = {
	form: object,
	backend: string.isRequired,
	getSearchConfig: func,
	indexSettings: object,
	pipeline: string,
};

LivePreview.defaultProps = {
	form: {},
	getSearchConfig: () => {},
	indexSettings: {},
	pipeline: '',
};

export default LivePreview;
