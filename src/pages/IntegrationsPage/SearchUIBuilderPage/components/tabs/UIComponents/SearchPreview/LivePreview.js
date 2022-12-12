import React from 'react';
import { ReactiveBase, SearchBox } from '@appbaseio/reactivesearch';
import get from 'lodash/get';
import { func, object, string } from 'prop-types';
import { getURL } from '../../../../../../../constants/config';
import { BACKENDS } from '../../../../../../../batteries/utils';

const LivePreview = ({ form, backend, getSearchConfig, pipeline, indexSettings }) => {
	const isTransformRequest =
		backend === BACKENDS.FUSION.name || backend === BACKENDS.MONGODB.name;
	const transformRequest = isTransformRequest
		? (props) => {
				// eslint-disable-next-line
				const newBody = JSON.parse(props.body);
				if (backend === BACKENDS.FUSION.name) {
					const mainFusionSettings = form.get('fusionSettings')?.value;
					const pageFusionSettings = get(
						indexSettings,
						'fusionSettings',
						form.get('fusionSettings')?.value,
					);
					const fusionSettings = { ...mainFusionSettings, ...pageFusionSettings };

					newBody.metadata = {
						app: fusionSettings.app,
						profile: fusionSettings.profile,
						suggestion_profile: fusionSettings.searchProfile,
						sponsored_profile: fusionSettings.sponsoredProfile,
					};
				} else {
					const pagemongoDBSettings = get(indexSettings, `mongoDBSettings`);
					newBody.metadata = {
						db: form.get('db').value,
						collection: form.get('collection').value,
						...pagemongoDBSettings,
					};
				}
				// eslint-disable-next-line no-param-reassign
				props.body = JSON.stringify(newBody);

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
