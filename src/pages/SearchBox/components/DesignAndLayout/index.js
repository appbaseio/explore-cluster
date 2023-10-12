import { ReactiveBase, SearchBox } from '@appbaseio/reactivesearch';
import { Modal, notification, Spin } from 'antd';
import DOMPurify from 'dompurify';
import { css } from 'emotion';
import { uniqueId } from 'lodash';
import { any, bool, func, object, oneOfType, string } from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import Flex from '../../../../batteries/components/shared/Flex';
import {
	removeSearchBox as removeSearchBoxAction,
	saveSearchBox as saveSearchBoxAction,
} from '../../../../batteries/modules/actions/searchboxes';
import { getURL } from '../../../../constants/config';
import { FormContext } from '../../../IntegrationsPage/utils/utils';
import { parseJSON } from '../../utils';
import DesignPanel from './DesignPanel';

const container = css`
	flex-wrap: wrap;
	gap: 1.5rem;
	height: 100%;
	overflow: auto;

	& > div {
		height: 100%;
		&:first-of-type {
			min-width: max(35%, 300px);
			border-right: 1px solid white;
			height: max-content;
			margin-bottom: 40px;
			flex-grow: 11;
		}
	}
`;

const DesignAndLayout = ({ saveSearchBox, deleteSearchBox, triggerLivePreview }) => {
	const mainForm = useContext(FormContext);
	const form = mainForm.get('designAndLayout');
	const customizeSearchBoxForm = form.get('customizeSearchBox');
	const [showLivePreview, setShowLivePreview] = useState(false);
	const [previewLoading, setPreviewLoading] = useState(false);
	const featuredSuggestionsId = useRef('');

	const handleLivePreview = useCallback(async () => {
		try {
			if (form.value && form.value.searchbox) {
				setPreviewLoading(true);
				setShowLivePreview(true);
				const { endpoint = {}, popular = {}, recent = {} } = mainForm.value;
				const payload = JSON.parse(
					JSON.stringify({
						hidden: true,
						searchbox: {
							featured: {
								layout: {
									...form.value.searchbox,
								},
							},
							endpoint: {
								...(endpoint?.endpoint?.url && endpoint?.endpoint?.method
									? {
											endpoint: {
												url: endpoint?.endpoint?.url,
												headers:
													parseJSON(endpoint?.endpoint?.headers) ||
													undefined,
												body:
													parseJSON(endpoint?.endpoint?.body) ||
													undefined,
												method: endpoint?.endpoint?.method,
											},
									  }
									: {}),
								applyStopwords: endpoint.applyStopwords,
								customStopwords: endpoint.customStopwords || [],
								enableSynonyms: endpoint.enableSynonyms,
								excludeFields: endpoint.excludeFields,
								includeFields: endpoint.includeFields,
								maxPredictedWords: endpoint.maxPredictedWords,
								showDistinctSuggestions: endpoint.showDistinctSuggestions,
								...(endpoint.transformResponse
									? { transformResponse: endpoint.transformResponse }
									: {}),
								...(endpoint.urlField ? { urlField: endpoint.urlField } : {}),
							},
							popular: {
								size: popular.size,
								index: popular.indices?.join(','),
								minCount: popular.minCount,
								minChars: popular.minChars,
							},
							recent: {
								size: recent.size,
								index: recent.indices?.join(','),
								minHits: recent.minHits,
								minChars: recent.minChars,
							},
						},
					}),
				);
				const tempSearchBoxId = uniqueId(
					`temp_featured_suggestions${new Date().getTime()}`,
				);
				const response = await saveSearchBox(tempSearchBoxId, payload, false);

				featuredSuggestionsId.current = response.payload.id;
			}
			setTimeout(() => {
				setPreviewLoading(false);
			}, 500);
		} catch (e) {
			setShowLivePreview(false);
			setPreviewLoading(false);
			notification.error({
				description: e,
				message: 'Error processing live preview.',
			});
		}
	}, [setShowLivePreview]);

	useEffect(() => {
		if (triggerLivePreview && !previewLoading) {
			handleLivePreview();
		}
	}, [triggerLivePreview]);
	const CLUSTER_URL = getURL();

	return (
		<>
			<Flex className={container}>
				<div style={{ position: 'relative', paddingBottom: '60px' }}>
					<DesignPanel />
				</div>
			</Flex>

			<Modal
				title={
					<div>
						<h3>Live Preview</h3>
					</div>
				}
				open={showLivePreview}
				onCancel={() => {
					setShowLivePreview(false);

					deleteSearchBox(featuredSuggestionsId.current, false);
					featuredSuggestionsId.current = '';
				}}
				style={{
					top: '4rem',
					maxWidth: 'min(652px, 95vw)',
				}}
				width="max(652px, 75vw) !important"
				footer={null}
			>
				<Spin style={{ margin: 'auto', width: '100%' }} spinning={previewLoading}>
					{previewLoading ? null : (
						<ReactiveBase
							// Older searchbox didn't have a index field. So, they had "featured_suggestions" passed as the index.
							app={mainForm.value.index || 'featured_suggestions'}
							credentials={mainForm.value.credentials}
							endpoint={
								mainForm.value.pipeline?.id
									? {
											url: `${CLUSTER_URL}${mainForm.value.pipeline.url}`,
											headers: {
												Authorization: `Basic ${btoa(
													mainForm.value.credentials,
												)}`,
											},
											method: mainForm.value.pipeline?.method,
									  }
									: undefined
							}
							url={getURL()}
							themePreset={form.value.theme}
							theme={{
								colors: {
									primaryColor: form.value.primaryColor,
									textColor: form.value.textColor,
								},
							}}
							style={{
								height: 'calc(100vh - 200px)',
							}}
						>
							<SearchBox
								enableRecentSuggestions={form.value.enableRecentSuggestions}
								enablePopularSuggestions={form.value.enablePopularSuggestions}
								enableFAQSuggestions={form.value.enableFAQSuggestions}
								enableAI={form.value.enableAI}
								enableFeaturedSuggestions={form.value.enableFeaturedSuggestions}
								// Below is temporarily disabled due to an issue with the backend, which is returning empty hits
								// enableEndpointSuggestions={form.value.enableEndpointSuggestions}
								enableIndexSuggestions={!!mainForm.value.index}
								showVoiceSearch={form.value.enableVoiceSearch}
								showImageSearch={form.value.enableImageSearch}
								highlight={form.value.highlight}
								iconURL={customizeSearchBoxForm.value.iconURL}
								iconPosition={customizeSearchBoxForm.value.iconPosition}
								focusShortcuts={customizeSearchBoxForm.value.focusShortcuts}
								placeholder={customizeSearchBoxForm.value.placeholder}
								addonBefore={
									customizeSearchBoxForm.value.addonBefore ? (
										<div
											dangerouslySetInnerHTML={{
												__html: DOMPurify.sanitize(
													customizeSearchBoxForm.value.addonBefore,
												),
											}}
										/>
									) : null
								}
								addonAfter={
									customizeSearchBoxForm.value.addonAfter ? (
										<div
											dangerouslySetInnerHTML={{
												__html: DOMPurify.sanitize(
													customizeSearchBoxForm.value.addonAfter,
												),
											}}
										/>
									) : null
								}
								componentId="search_box"
								size={10}
								{...(featuredSuggestionsId.current && {
									searchboxId: featuredSuggestionsId.current,
									featuredSuggestionsConfig: {
										sectionsOrder: form.value?.searchbox?.sectionsOrder,
									},
								})}
							/>
						</ReactiveBase>
					)}
				</Spin>
			</Modal>
		</>
	);
};

DesignAndLayout.propTypes = {
	saveSearchBox: func.isRequired,
	deleteSearchBox: func.isRequired,
	editPageId: oneOfType([string, any]).isRequired,
	triggerLivePreview: bool.isRequired,
	form: object.isRequired,
	searchBoxData: object,
};
DesignAndLayout.defaultProps = {
	searchBoxData: null,
};

const mapDispatchToProps = (dispatch) => ({
	saveSearchBox: (id, payload, shouldFetchSearchboxes) =>
		dispatch(saveSearchBoxAction(id, payload, shouldFetchSearchboxes)),
	deleteSearchBox: (id, shouldRefetchSearchboxes) =>
		dispatch(removeSearchBoxAction(id, shouldRefetchSearchboxes)),
});

export default connect(null, mapDispatchToProps)(DesignAndLayout);
