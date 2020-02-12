import React, { Component } from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import { css } from 'react-emotion';
import { Icon, Skeleton } from 'antd';
import { keys } from 'lodash';
import { fetchMappings } from '../../utils';

import './index.css';

class GlobalSearch extends Component {
	state = { loading: false, dataFields: [] };

	async componentDidMount() {
		this.setState({ loading: true });
		try {
			const { indexes } = this.props;
			const mappings = await fetchMappings();
			const dataFields = Object.keys(mappings)
				.filter(key => indexes.includes(key) && key[0] !== '.')
				.reduce((acc, key) => {
					const { properties } = mappings[key].mappings;
					const nestedDataFields = keys(properties).filter(property => {
						return (
							properties[property].type === 'string' ||
							properties[property].type === 'text'
						);
					});
					return [...acc, ...nestedDataFields];
				}, []);
			this.setState({ dataFields, loading: false });
		} catch (e) {
			console.error(e);
			this.setState({ loading: false });
		}
	}

	render() {
		const { dataFields, loading } = this.state;
		const { onSuggestionSelect, className } = this.props;
		if (loading) return <Skeleton />;
		return (
			<div className="input-box" css={{ position: 'relative' }}>
				<DataSearch
					componentId="GlobalSearch"
					dataField={dataFields}
					innerClass={{
						input: `ant-input ${css`
							padding-left: 35px !important;
							background: #fff !important;
						`} ${className}`,
					}}
					debounce={5}
					showIcon={false}
					onValueSelected={(value, cause, source) => {
						if (onSuggestionSelect) onSuggestionSelect(value, cause, source);
					}}
					showDistinctSuggestions
				/>
				<Icon
					className="search-icon"
					type="search"
					css={{
						position: 'absolute',
						top: '50%',
						transform: 'translateY(-50%)',
						left: '10px',
						color: 'rgba(0, 0, 0, 0.45)',
					}}
				/>
			</div>
		);
	}
}

export default GlobalSearch;
