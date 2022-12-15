import React, { useEffect, useState } from 'react';
import { FieldControl } from 'react-reactive-form';
import { Select, Tooltip } from 'antd';
import get from 'lodash/get';
import { func, object } from 'prop-types';
import { connect } from 'react-redux';
import { defaultPageSettings, getTemplate, transformPreferences } from '../utils/index';
import { getLatestVersion, commitCode, preferencesInConstants } from '../utils/sandpack-generator';

import { saveSearchPreference } from '../../../batteries/modules/actions';
import { transformContent } from './ExportInline/Components/ModalHeader';

const PageRoutes = ({
	getPreferencesPayload,
	preferences: prefs,
	form,
	setIsEditorLoading,
	// updateSearchPreferences, // commented for a reason
}) => {
	const preferences = getPreferencesPayload();
	const themeType = get(preferences, 'themeSettings.type', '');
	const templateObj = getTemplate(themeType);
	const [manifestObj, setManifestObj] = useState(templateObj);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchLatestVersion();
	}, [preferences.id]);

	const fetchLatestVersion = () => {
		getLatestVersion(preferences.id)
			.then((res) => {
				if (res.content) {
					if (templateObj.manifest_path) {
						if (
							res.content[templateObj.manifest_path] ||
							res.content[`/${templateObj.manifest_path}`]
						) {
							const obj = JSON.parse(
								res.content[templateObj.manifest_path] ||
									res.content[`/${templateObj.manifest_path}`] ||
									'{}',
							);
							if (obj.pages) setManifestObj(obj);
							else
								setManifestObj({
									pages: {
										'No pages available': 'No pages available',
									},
								});
						} else setManifestObj(templateObj);
					}
				}
				setIsLoading(false);
			})
			.catch((err) => {
				console.error('Error to fetch latest version', err);
				setIsLoading(false);
			});
	};

	const handleCommitCode = (currentPage) => {
		const newPreferences = transformPreferences(getPreferencesPayload());
		const newPrefs = { ...prefs };
		newPreferences.pageSettings.currentPage = currentPage;
		newPrefs.pageSettings.currentPage = currentPage;
		if (
			newPrefs.pageSettings.pages &&
			!newPrefs.pageSettings.pages[currentPage] &&
			newPrefs.pageSettings.fields
		) {
			newPrefs.pageSettings.pages[currentPage] = {
				componentSettings: defaultPageSettings(newPrefs.pageSettings.fields),
			};
		}

		getLatestVersion(preferences.id)
			.then((resp) => {
				const content = transformContent(resp.content);
				const newContent = preferencesInConstants(content, newPrefs);

				const body = {
					metadata: {
						commit: 'system commit: auto save page changes',
						user: localStorage.getItem('username'),
					},
					content: newContent,
				};
				commitCode(preferences.id, body)
					.then((res) => {
						form.get('versionId').setValue(res.version_id);
						setIsEditorLoading(false);
					})
					.catch((err) => {
						console.error(err);
					});
			})
			.catch((err) => {
				console.error('Error to get latest version', err);
				return {};
			});
	};

	const getValue = (value) => {
		const pages = Object.keys(manifestObj?.pages || {});
		if (manifestObj.pages && pages.length) {
			if (value && manifestObj.pages[value]) {
				return `${value} (${manifestObj.pages[value]})`;
			}
			return `${pages[0]} (${manifestObj.pages[pages[0]]})`;
		}
		return undefined;
	};

	if (!templateObj || !templateObj.pages || !Object.keys(templateObj.pages).length) {
		return null;
	}

	return (
		<FieldControl name="currentPage" strict={false}>
			{({ value, onChange }) => {
				return (
					<Select
						placeholder="Select page"
						style={{ width: 220 }}
						value={getValue(value)}
						loading={isLoading}
						optionLabelProp="value"
						onSelect={(val) => {
							setIsEditorLoading(true);
							onChange(val);
							handleCommitCode(val);
						}}
					>
						{Object.entries(manifestObj.pages || []).map(([page, route]) => {
							return (
								<Select.Option
									key={`${page}-${route}`}
									value={page}
									disabled={page === 'No pages available'}
								>
									<Tooltip title={`${page} (${route})`}>
										{page} ({route})
									</Tooltip>
								</Select.Option>
							);
						})}
					</Select>
				);
			}}
		</FieldControl>
	);
};

PageRoutes.propTypes = {
	getPreferencesPayload: func.isRequired,
	// eslint-disable-next-line
	updateSearchPreferences: func.isRequired,
	preferences: object.isRequired,
	form: object.isRequired,
	setIsEditorLoading: func,
};

PageRoutes.defaultProps = {
	setIsEditorLoading: () => {},
};

const mapDispatchToProps = (dispatch, props) => ({
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreference(props.preferences.id, payload)),
});

export default connect(null, mapDispatchToProps)(PageRoutes);
