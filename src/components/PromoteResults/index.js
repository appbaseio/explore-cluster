import React, { Component } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { Button } from 'antd';
import { css } from 'emotion';
import { getURL } from '../../constants/config';
import GlobalSearch from '../GlobalSearch';
import {
	PromoteActions,
	PromoteDataTable,
	PromoteJSONView,
	PromotePosition,
} from './components/PromoteDataTable';

const flex = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
`;

class PromoteResults extends Component {
	constructor(props) {
		super(props);
		this.state = { selectedSuggestion: null, dataSource: props.dataSource || [] };
	}

	handleAdd = () => {
		const { dataSource, selectedSuggestion } = this.state;
		if (!selectedSuggestion) return;
		const newData = [...dataSource, { position: 1, doc: { id: selectedSuggestion } }];
		this.setState({ dataSource: newData });
	};

	handleItemChange = (value, index, field) => {
		const { dataSource } = this.state;
		this.setState({
			dataSource: [
				...dataSource.slice(0, index),
				{
					...dataSource[index],
					[field]: value,
				},
				...dataSource.slice(index + 1),
			],
		});
	};

	handleDelete = index => {
		const { dataSource } = this.state;
		this.setState({
			dataSource: [...dataSource.slice(0, index), ...dataSource.slice(index + 1)],
		});
	};

	render() {
		const { indexes } = this.props;
		const { dataSource } = this.state;
		return (
			<div style={{ padding: 12 }}>
				<ReactiveBase
					app={indexes.join(',')}
					url={getURL()}
					credentials={atob(sessionStorage.getItem('authToken'))}
					className={flex}
				>
					<div style={{ width: '91%' }}>
						<GlobalSearch
							indexes={indexes}
							onSuggestionSelect={selectedSuggestion => {
								this.setState({ selectedSuggestion });
							}}
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
