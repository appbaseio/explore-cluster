import React, { Component } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { Button, Tag } from 'antd';
import { css } from 'emotion';
import { getURL } from '../../constants/config';
import GlobalSearch from '../GlobalSearch';

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
			hiddenResults: props.hiddenResults,
			currentId: null,
		};
	}

	onSuggestionSelect = (selectedSuggestion, cause, source) => {
		this.setState({
			currentId: source._id,
		});
	};

	onHide = () => {
		const { currentId, hiddenResults } = this.state;
		if (!currentId) return;
		this.setState({ hiddenResults: [...hiddenResults, currentId] });
	};

	onClose = (e, id) => {
		e.preventDefault();
		const { hiddenResults } = this.state;
		const index = hiddenResults.indexOf(id);
		if (index !== -1) {
			hiddenResults.splice(index, 1);
			this.setState({ hiddenResults });
		}
	};

	render() {
		const { indexes } = this.props;
		const { hiddenResults } = this.state;
		return (
			<div style={{ padding: 12, background: '#fff' }}>
				<ReactiveBase
					app={indexes.join(',')}
					url={getURL()}
					credentials={atob(sessionStorage.getItem('authToken'))}
					className={flex}
				>
					<div style={{ width: '92%' }}>
						<GlobalSearch
							indexes={indexes}
							onSuggestionSelect={this.onSuggestionSelect}
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

export default HideResults;
