import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { notification } from 'antd';
import { getURL } from '../../../../../constants/config';
import GlobalSearch from '../../../../../components/GlobalSearch';
import {
	PromoteActions,
	PromoteDataTable,
	PromoteJSONView,
	PromotePosition,
} from './PromoteDataTable';

class PromoteResults extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: props.value || [],
		};
		this.globalSearchRef = React.createRef();
	}

	updateResults = () => {
		const { onChange } = this.props;
		if (onChange) {
			const { dataSource: dataSourceNew } = this.state;
			onChange(dataSourceNew);
		}
	};

	handleAdd = (...value) => {
		if (!value[2]) return;
		const { dataSource } = this.state;
		// eslint-disable-next-line no-unused-vars
		const [selectedSuggestion, _, suggestionSource] = value;
		if (!selectedSuggestion) return;
		if (dataSource.findIndex((item) => item.doc._id === suggestionSource._id) > -1) {
			notification.info({
				message: 'Promote Result',
				description: `${selectedSuggestion} is already promoted.`,
			});
			this.clearSearch();
			return;
		}
		const newData = [...dataSource, { position: 1, doc: suggestionSource }];
		this.setState({ dataSource: newData }, this.updateResults);
		this.clearSearch();
	};

	handleItemChange = (value, index, field) => {
		const { dataSource } = this.state;
		this.setState(
			{
				dataSource: [
					...dataSource.slice(0, index),
					{
						...dataSource[index],
						[field]: value,
					},
					...dataSource.slice(index + 1),
				],
			},
			this.updateResults,
		);
	};

	handleDelete = (index) => {
		const { dataSource } = this.state;
		this.setState(
			{
				dataSource: [...dataSource.slice(0, index), ...dataSource.slice(index + 1)],
			},
			this.updateResults,
		);
	};

	clearSearch() {
		if (this.globalSearchRef) {
			this.globalSearchRef.current.handleSearchValueChange('');
		}
	}

	render() {
		const { indexes, dataFields } = this.props;
		const { dataSource } = this.state;
		return (
			<div>
				<ReactiveBase
					app={indexes.join(',') || '*'}
					url={getURL()}
					credentials={atob(sessionStorage.getItem('authToken'))}
					style={{ marginBottom: 12 }}
				>
					<GlobalSearch
						indexes={indexes}
						onValueSelected={this.handleAdd}
						dataFields={(dataFields || []).map((field) =>
							field.replace(/.keyword/g, ''),
						)}
						ref={this.globalSearchRef}
						// onKeyDown={this.handleAdd}
					/>
				</ReactiveBase>
				<PromoteDataTable
					positionRender={(text, record, index) => (
						<PromotePosition
							value={text}
							onChange={(value) => {
								this.handleItemChange(value, index, 'position');
							}}
						/>
					)}
					dataRender={(text, record) => <PromoteJSONView record={record} />}
					actionRender={(text, record, index) => (
						<PromoteActions onClick={() => this.handleDelete(index)} />
					)}
					dataSource={dataSource}
				/>
			</div>
		);
	}
}

PromoteResults.propTypes = {
	indexes: PropTypes.array,
	dataFields: PropTypes.array,
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
};

PromoteResults.defaultProps = {
	indexes: [],
	dataFields: [],
	value: [],
};

export default PromoteResults;
