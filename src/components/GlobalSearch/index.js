import React, { PureComponent } from 'react';
import { DataSearch } from '@appbaseio/reactivesearch';
import { css } from 'react-emotion';
import { Icon } from 'antd';

import './index.css';

class GlobalSearch extends PureComponent {
	render() {
		const { onSuggestionSelect, className, dataFields } = this.props;
		return (
			<div className="input-box" css={{ position: 'relative' }}>
				<DataSearch
					componentId="GlobalSearch"
					dataField={dataFields}
					innerClass={{
						input: `ant-input ${css`
							padding-left: 35px !important;
							background: #fff !important;
							margin-bottom: 0 !important;
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
