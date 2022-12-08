import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { bool, func, object, string } from 'prop-types';
import { traverseMapping } from '../../../../../../../batteries/utils/mappings';
import { getAppMappings } from '../../../../../../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../../../../../../batteries/modules/selectors';
import { BACKENDS } from '../../../../../../../batteries/utils';

const FiltersWrapper = ({
	children,
	form,
	loading,
	fetchMappings,
	appbaseCredentials,
	mappings,
	backend,
}) => {
	const [traversedMappings, setTraversedMappings] = useState([]);
	useEffect(() => {
		if (appbaseCredentials) {
			getMappings();
		}
	}, []);

	useEffect(() => {
		getTraversedMappings();
	}, [mappings]);

	const getMappings = () => {
		if (!loading && !mappings && appbaseCredentials) {
			const pipeline = form.get('pipeline') ? form.get('pipeline')?.value : '';
			const indexSettings = form.get('indexSettings') ? form.get('indexSettings').value : {};
			const secondaryPipeline = get(indexSettings, 'index', '');

			fetchMappings(secondaryPipeline || pipeline, appbaseCredentials, backend);
		}
	};

	const getTraversedMappings = () => {
		const traversedMappingsArr = traverseMapping(
			filterOutNestedTypes(mappings) || {},
			undefined,
			{
				isAggFields: true,
				includeMappings: false,
				includeTypes: false,
			},
		);

		if (Array.isArray(traversedMappingsArr)) setTraversedMappings(traversedMappingsArr);
	};

	const filterOutNestedTypes = (mappingsObj = { properties: {} }) => {
		const filteredMappings = { ...mappingsObj };
		// eslint-disable-next-line no-unused-expressions
		Object.keys(filteredMappings.properties ?? {})?.forEach((key) => {
			if (filteredMappings.properties[key].type === 'nested') {
				delete filteredMappings.properties[key];
			}
		});

		return filteredMappings;
	};

	return React.cloneElement(children, { traversedMappings });
	//
};

FiltersWrapper.defaultProps = {
	loading: false,
	mappings: null,
	backend: BACKENDS.ELASTICSEARCH.name,
};

FiltersWrapper.propTypes = {
	mappings: object,
	loading: bool,
	appbaseCredentials: string.isRequired,
	fetchMappings: func.isRequired,
	form: object.isRequired,
	backend: string,
};

const mapStateToProps = (state, props) => {
	const pipeline = props.form?.get('pipeline') ? props.form?.get('pipeline')?.value : '';
	const indexSettings = props.form?.get('indexSettings')
		? props.form?.get('indexSettings')?.value
		: {};
	const secondaryPipeline = get(indexSettings, 'index', '');
	const mappings = getRawMappingsByAppName(state, secondaryPipeline || pipeline);
	const { username, password } = get(state, 'user.data', {});
	return {
		mappings,
		loading: get(state, '$getAppMappings.isFetching'),
		appbaseCredentials: username ? `${username}:${password}` : null,
		backend: get(state, '$getAppPlan.results.backend'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, backend) =>
		dispatch(getAppMappings(appName, credentials, undefined, backend)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FiltersWrapper);
