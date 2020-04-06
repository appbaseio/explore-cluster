import React, { Component } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { notification, Tag } from 'antd';
import { getURL } from '../../../../../constants/config';
import GlobalSearch from '../../../../../components/GlobalSearch';

class HideResults extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hiddenResults: props.value,
		};
		this.globalSearchRef = React.createRef();
	}

	updateResults = () => {
		const { onChange } = this.props;
		if (onChange) {
			const { hiddenResults: hiddenResultsNew } = this.state;
			onChange(hiddenResultsNew);
		}
	};

	onHide = (...value) => {
		if (!value[2]) return;
		const { hiddenResults } = this.state;
		const currentId = value[2]._id;
		if (!currentId) return;
		if (hiddenResults.includes(currentId)) {
			notification.info({
				message: 'Hide Result',
				description: `${currentId} is already hidden.`,
			});
			this.clearSearch();
			return;
		}
		this.setState({ hiddenResults: [...hiddenResults, currentId] }, this.updateResults);
		this.clearSearch();
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

	clearSearch() {
		if (this.globalSearchRef) {
			this.globalSearchRef.current.handleSearchValueChange('');
		}
	}

	render() {
		const { indexes, dataFields } = this.props;
		const { hiddenResults } = this.state;
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
						onValueSelected={this.onHide}
						dataFields={(dataFields || []).map(field => field.replace(/.keyword/g, ''))}
						ref={this.globalSearchRef}
						// onKeyDown={this.handleAdd}
					/>
				</ReactiveBase>
				<div>
					{hiddenResults.map(id => (
						<Tag key={id} closable onClose={e => this.onClose(e, id)}>
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
