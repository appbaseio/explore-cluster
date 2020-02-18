import React, { PureComponent } from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import { css } from 'react-emotion';
import { Icon } from 'antd';

const inputBox = css`
	&:hover,
	&:focus {
		.search-icon {
			color: rgba(0, 0, 0, 0.85);
		}
	}
`;

class GlobalSearch extends PureComponent {
	state = {
		searchValue: '',
	};

	handleSearchValueChange = searchValue => {
		this.setState({
			searchValue,
		});
	};

	render() {
		const { onSuggestionSelect, className, dataFields } = this.props;
		const { searchValue } = this.state;
		return (
			<div className={inputBox} css={{ position: 'relative' }}>
				<DataSearch
					componentId="GlobalSearch"
					dataField={dataFields}
					innerClass={{
						input: `ant-input ${css`
							padding-left: 35px !important;
							background: #fff !important;
							margin-bottom: 0 !important;
							height: 34px !important;
						`} ${className}`,
						list: css`
							top: 34px !important;
							font-size: 0.8rem !important;
							border-radius: 5px !important;
						`,
					}}
					debounce={5}
					showIcon={false}
					onValueSelected={(value, cause, source) => {
						if (onSuggestionSelect) {
							onSuggestionSelect(value, cause, source);
						}
					}}
					showDistinctSuggestions
					onChange={this.handleSearchValueChange}
					value={searchValue}
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
