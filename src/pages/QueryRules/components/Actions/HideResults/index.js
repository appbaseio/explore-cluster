import React, { Component } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { Button, Tag } from 'antd';
import { css } from 'emotion';
import { getURL } from '../../../../../constants/config';
import GlobalSearch from '../../../../../components/GlobalSearch';

const flex = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
`;

class HideResults extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hiddenResults: props.value,
			currentId: null,
		};
	}

	updateResults = () => {
		const { onChange } = this.props;
		if (onChange) {
			const { hiddenResults: hiddenResultsNew } = this.state;
			onChange(hiddenResultsNew);
		}
	};

	onSuggestionSelect = (selectedSuggestion, cause, source) => {
		this.setState({
			currentId: source._id,
		});
	};

	onHide = () => {
		const { currentId, hiddenResults } = this.state;
		if (!currentId) return;
		this.setState({ hiddenResults: [...hiddenResults, currentId] }, this.updateResults);
	};

	onClose = (e, id) => {
		e.preventDefault();
		const { hiddenResults } = this.state;
		const index = hiddenResults.indexOf(id);
		if (index !== -1) {
			hiddenResults.splice(index, 1);
			this.setState({ hiddenResults }, this.updateResults);
		}
	};

	render() {
		const { indexes, dataFields } = this.props;
		const { hiddenResults } = this.state;
		return (
			<div style={{ padding: 12, background: '#fff' }}>
				<ReactiveBase
					app={indexes.join(',')}
					url={getURL()}
					credentials={atob(sessionStorage.getItem('authToken'))}
					className={flex}
				>
					<div style={{ width: '82%' }}>
						<GlobalSearch
							indexes={indexes}
							onSuggestionSelect={this.onSuggestionSelect}
							dataFields={dataFields}
						/>
					</div>
					<Button type="primary" onClick={this.onHide}>
						Hide
					</Button>
				</ReactiveBase>
				<div>
					{hiddenResults.map(id => (
						<Tag closable onClose={e => this.onClose(e, id)}>
							{id}
						</Tag>
					))}
				</div>
			</div>
		);
	}
}

HideResults.defaultProps = {
	hiddenResults: [],
};

export default HideResults;
