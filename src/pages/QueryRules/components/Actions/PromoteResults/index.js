import React, { Component } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { Button } from 'antd';
import { css } from 'emotion';
import { getURL } from '../../../../../constants/config';
import GlobalSearch from '../../../../../components/GlobalSearch';
import {
	PromoteActions,
	PromoteDataTable,
	PromoteJSONView,
	PromotePosition,
} from './PromoteDataTable';

const flex = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
`;

class PromoteResults extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedSuggestion: null,
			dataSource: props.value || [],
			suggestionSource: null,
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

	handleAdd = () => {
		const { dataSource, selectedSuggestion, suggestionSource } = this.state;
		if (!selectedSuggestion) return;
		const newData = [...dataSource, { position: 1, doc: suggestionSource }];
		this.setState({ dataSource: newData, selectedSuggestion: null }, this.updateResults);
		if (this.globalSearchRef) {
			this.globalSearchRef.current.handleSearchValueChange('');
		}
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

	handleDelete = index => {
		const { dataSource } = this.state;
		this.setState(
			{
				dataSource: [...dataSource.slice(0, index), ...dataSource.slice(index + 1)],
			},
			this.updateResults,
		);
	};

	render() {
		const { indexes, dataFields } = this.props;
		const { dataSource } = this.state;
		return (
			<div>
				<ReactiveBase
					app={indexes.join(',')}
					url={getURL()}
					credentials={atob(sessionStorage.getItem('authToken'))}
					className={flex}
				>
					<div style={{ width: '79%' }}>
						<GlobalSearch
							indexes={indexes}
							onSuggestionSelect={(selectedSuggestion, cause, source) => {
								this.setState({ selectedSuggestion, suggestionSource: source });
							}}
							dataFields={dataFields}
							ref={this.globalSearchRef}
						/>
					</div>
					<Button type="primary" onClick={this.handleAdd}>
						Promote
					</Button>
				</ReactiveBase>
				<PromoteDataTable
					positionRender={(text, record, index) => (
						<PromotePosition
							value={text}
							onChange={value => {
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

export default PromoteResults;
