import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Typography, Tabs } from 'antd';
import get from 'lodash/get';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import Loader from '../../components/Loader';
import { modalStyles } from '../../components/SearchPreviewModal/SearchPreviewModal';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import {
	getDefaultSettings,
	deleteSettings,
	getSettings as getSearchRelevancy,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import { getMappingsByPath, getMappingsInfo } from '../../utils/mappings';
import { getSubFields } from '../../utils';

const { Text } = Typography;
const { TabPane } = Tabs;

const SearchPreview = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "SearchPreviewComponent" */ '../SandboxPage/components/SearchPreview'
		),
	loading: Loader,
});

const handleTabChange = (key) => {
	console.log('Tab chnaged ==>> ', key);
};
class SearchPreviewWrapper extends React.Component {
	state = {
		visible: false,
	};

	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			settings,
			getDefaultSettingsAction,
			defaultSettings,
			localRelevancy,
		} = this.props;

		if (settings && !localRelevancy) {
			this.init({ ...settings });
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { settings, mappings, localRelevancy, isLoading, defaultSettings } = this.props;

		if (
			JSON.stringify(settings) !== JSON.stringify(prevProps.settings) ||
			JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)
		) {
			this.init({ ...(localRelevancy || settings) });
		}

		if (
			!settings &&
			!localRelevancy &&
			!isLoading &&
			JSON.stringify(defaultSettings) !== JSON.stringify(prevProps.defaultSettings)
		) {
			this.init({ ...defaultSettings });
		}
	}

	init = (settings) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;

		if (!localRelevancy) {
			updateLocalRelevancy(appName, {
				...settings,
			});
		}

		// initialFieldWeights for searchable fields initially if the no search fields are set!
		this.initialFieldWeights();
	};

	initialFieldWeights = () => {
		const {
			settings,
			isLoading,
			isFetchingMapping,
			appName,
			localRelevancy,
			updateLocalRelevancy,
			mappings,
		} = this.props;

		const synonymsSettings = get(settings, 'synonyms');
		const indexSettings = get(settings, 'indexSettings');
		const languageSettings = get(settings, 'language');
		const { flattenUsecase } = getMappingsInfo({
			mappings,
			enableNgram: indexSettings.enableNgram,
			enableSynonyms: synonymsSettings.enabled,
			language: languageSettings.language,
		});

		const { dataField, fieldWeights } = get(settings, `search`);
		const hasSearchFields = flattenUsecase
			? Object.values(flattenUsecase).some((i) => i === 'search' || 'searchaggs')
			: false;
		if (
			!fieldWeights.length &&
			!dataField.length &&
			!isFetchingMapping &&
			!isLoading &&
			hasSearchFields
		) {
			const { enableNgram } = get(localRelevancy || settings, `indexSettings`);
			const { language } = get(localRelevancy || settings, `language`);
			const { enabled: enableSynonyms } = get(localRelevancy || settings, `synonyms`);

			const fieldDataTuple = Object.keys(flattenUsecase).reduce(
				(agg, item) => {
					if (
						flattenUsecase[item] === 'search' ||
						flattenUsecase[item] === 'searchaggs'
					) {
						const fields = getSubFields({
							fields: get(
								getMappingsByPath({
									mappings,
									path: item,
								}),
								'fields',
							),
							weight: 1,
							address: item,
							skipSearch: enableNgram === false,
							skipLang: !language,
							skipSynonyms: enableSynonyms === false,
						});

						return [
							[...agg[0], ...Object.keys(fields)],
							[...agg[1], ...Object.values(fields)],
						];
					}

					return agg;
				},
				[[], []],
			);

			updateLocalRelevancy(appName, {
				...(localRelevancy || settings),
				search: {
					...get(localRelevancy || settings, `search`, {}),
					dataField: fieldDataTuple[0],
					fieldWeights: fieldDataTuple[1],
				},
			});
		}
	};

	toggleVisibility = () => {
		this.setState((prevState) => {
			return {
				...prevState,
				visible: !prevState.visible,
			};
		});
	};

	render() {
		const {
			appName,
			value,
			onChange,
			localRelevancy,
			label,
			buttonProps,
			selectButtonLabel,
			openWithModal,
		} = this.props;
		const { visible } = this.state;
		const component = () => (
			<Tabs defaultActiveKey="1" onChange={handleTabChange}>
				<TabPane tab="Browse Products" key="1">
					<SearchPreview
						app={appName}
						testSettings={{
							...localRelevancy,
							search: {
								...localRelevancy.search,
								fieldWeights: get(
									localRelevancy,
									'search.fieldWeights',
									[],
								).map((i) => Number(i)),
							},
						}}
						hasTestSettings
						handleModal={this.toggleVisibility}
						showFeaturedProducts
						selectButtonLabel={selectButtonLabel}
						value={value}
						onChange={onChange}
					/>
				</TabPane>
				<TabPane tab="Featured List" key="2">
					List is empty!!
				</TabPane>
			</Tabs>
		);
		if (!openWithModal) {
			if (!localRelevancy) {
				return <Loader />;
			}
			return component();
		}
		return (
			<Fragment>
				<Button onClick={this.toggleVisibility} style={{ width: 300 }} {...buttonProps}>
					{label}
				</Button>
				<br />
				{value.length > 0 && (
					<Text type="secondary">{`Featured Products :  ${value.length}`}</Text>
				)}
				{visible && (
					<Modal
						className={modalStyles}
						visible={visible}
						onCancel={this.toggleVisibility}
						footer={null}
						destroyOnClose
						width={1200}
					>
						{component()}
					</Modal>
				)}
			</Fragment>
		);
	}
}

SearchPreviewWrapper.propTypes = {
	appName: PropTypes.string.isRequired,
	defaultSettings: PropTypes.object,
	isLoading: PropTypes.bool,
	settings: PropTypes.object,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	updateLocalRelevancy: PropTypes.func.isRequired,
	localRelevancy: PropTypes.object,
	isFetchingMapping: PropTypes.bool.isRequired,
	mappings: PropTypes.object,
	buttonProps: PropTypes.object,
	value: PropTypes.array,
	onChange: PropTypes.func,
	label: PropTypes.string,
	selectButtonLabel: PropTypes.string,
	openWithModal: PropTypes.bool,
};

SearchPreviewWrapper.defaultProps = {
	label: 'Manage Products',
	settings: null,
	defaultSettings: null,
	buttonProps: null,
	isLoading: false,
	selectButtonLabel: undefined,
	localRelevancy: null,
	mappings: null,
	value: [],
	openWithModal: true,
	onChange: () => {},
};

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`, null);

	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		appName,
		isFetchingMapping: get(state, '$getAppMappings.isFetching', false),
		localRelevancy,
		mappings: getRawMappingsByAppName(state) || null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSearchRelevancy(name)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchPreviewWrapper);
