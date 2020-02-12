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
							onSuggestionSelect={(selectedSuggestion, cause, source) => {
								this.setState({
									currentId: source._id,
								});
							}}
						/>
					</div>
					<Button
						type="primary"
						onClick={() => {
							const { currentId } = this.state;
							if (!currentId) return;
							this.setState({ hiddenResults: [...hiddenResults, currentId] });
						}}
					>
						Hide
					</Button>
				</ReactiveBase>
				<div>
					{hiddenResults.map(id => (
						<Tag
							closable
							onClose={e => {
								e.preventDefault();
								const index = hiddenResults.indexOf(id);
								if (index !== -1) {
									hiddenResults.splice(index, 1);
									this.setState({ hiddenResults });
								}
							}}
						>
							{id}
						</Tag>
					))}
				</div>
			</div>
		);
	}
}

export default HideResults;
