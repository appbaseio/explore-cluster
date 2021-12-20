import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Tag, Typography, Popover } from 'antd';
import { hasValuesChanged } from '../utils';
import JsonView from '../../../components/JsonView';

const subTitle = css`
	font-size: 14px;
	margin: 0;
	color: rgba(0, 0, 0, 0.75);
	font-weight: bold;
`;

const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const { Text } = Typography;

let promotedData = [];
class ActionView extends React.Component {
	shouldComponentUpdate(nextProps) {
		return hasValuesChanged(nextProps, this.props, 'action');
	}

	render() {
		const { action, ruleId, searchState } = this.props;
		const actionType = action.type;

		if (searchState && searchState.promotedData && ruleId === searchState.rule?.id) {
			promotedData = [...searchState.promotedData];
		} else {
			promotedData = action?.data || [];
		}

		switch (actionType) {
			case 'replace_search_term':
				return action.data ? (
					<React.Fragment key={ruleId}>
						<h4 className={subTitle}>Replace Search Term</h4>
						<Tag key={`${ruleId}-tag`}>{action.data}</Tag>
					</React.Fragment>
				) : null;
			case 'hide_result':
				return action.data ? (
					<React.Fragment key={ruleId}>
						<h4 className={subTitle}>Hide Result</h4>
						{action.data.map((id) => (
							<Tag color="red" key={`${ruleId}-${id}`}>
								{id}
							</Tag>
						))}
					</React.Fragment>
				) : null;

			case 'promote_result':
				return action.data ? (
					<React.Fragment key={ruleId}>
						<h4 className={subTitle}>Promote Result</h4>
						{promotedData?.length &&
							promotedData.map((item) => (
								<Tag color="blue" key={`${ruleId}-${item.doc._id}`}>
									{/* promotedData */}
									<Popover
										content={
											<div css={popoverContent}>
												<JsonView json={item.doc} />
											</div>
										}
										trigger="click"
									>
										<div
											css={{
												cursor: 'pointer',
												margin: '0 7px',
												maxWidth: '95%',
												...overflow,
											}}
										>
											{` {...} `}
											{item.doc._suggestion_display_value?.slice(0, 3) ||
												item.doc._id?.slice(0, 3)}
										</div>
									</Popover>
								</Tag>
							))}
					</React.Fragment>
				) : null;
			case 'add_filter':
				return action.data ? (
					<React.Fragment key={ruleId}>
						<h4 className={subTitle}>Add Filter</h4>
						{Object.keys(action.data).map((filter) => (
							<Typography.Text
								key={filter}
								style={{ display: 'block', margin: '2px 0' }}
							>
								<strong>{filter}: </strong> {action.data[filter].toString()}
								<br />
							</Typography.Text>
						))}
					</React.Fragment>
				) : null;
			case 'function':
				return (
					action.data && (
						<React.Fragment key={ruleId}>
							<h4 className={subTitle}>Function</h4>
							<Tag key={`${ruleId}-tag`} color="purple">
								{action.data}
							</Tag>
						</React.Fragment>
					)
				);

			case 'custom_data':
				return (
					action.data && (
						<React.Fragment key={ruleId}>
							<h4 className={subTitle}>Custom Data</h4>
							<Popover content={<pre>{JSON.stringify(action.data, null, 4)}</pre>}>
								<Tag key={`${ruleId}-tag`} color="green">{`{...}`}</Tag>
							</Popover>
						</React.Fragment>
					)
				);
			case 'remove_words':
				return action.data ? (
					<React.Fragment key={ruleId}>
						<h4 className={subTitle}>Remove Search Words</h4>
						{action.data.map((word) => (
							<Tag key={`${ruleId}-${word}`}>{word}</Tag>
						))}
					</React.Fragment>
				) : null;
			case 'replace_words':
				return action.data ? (
					<React.Fragment key={ruleId}>
						<h4 className={subTitle}>Replace Search Words</h4>
						{Object.keys(action.data).map((word) => (
							<div key={word}>
								<Tag key={`${ruleId}-tag-delete-${word}`}>
									<Text delete>{word}</Text>
								</Tag>
								with{' '}
								<Tag key={`${ruleId}-tag-${word}`} style={{ marginLeft: 5 }}>
									<Text>{action.data[word]}</Text>
								</Tag>
							</div>
						))}
					</React.Fragment>
				) : null;
			case 'search_settings':
				return (
					action.data && (
						<React.Fragment key={ruleId}>
							<h4 className={subTitle}>Search Settings</h4>
							<Popover content={<pre>{JSON.stringify(action.data, null, 4)}</pre>}>
								<Tag key={`${ruleId}-tag`} color="gold">{`{...}`}</Tag>
							</Popover>
						</React.Fragment>
					)
				);
			case 'replace_search_query':
				return action.data ? (
					<React.Fragment key={ruleId}>
						<h4 className={subTitle}>Replace Search Query</h4>
						<Tag key={`${ruleId}-tag`} color="geekblue">
							{action.data}
						</Tag>
					</React.Fragment>
				) : null;
			default:
				return null;
		}
	}
}

ActionView.propTypes = {
	action: PropTypes.object,
	ruleId: PropTypes.string,
	searchState: PropTypes.object,
};

ActionView.defaultProps = {
	action: {},
	ruleId: undefined,
	searchState: null,
};

const mapStateToProps = (state) => {
	return {
		searchState: get(state, '$getSearchState.searchState', null),
	};
};

export default connect(mapStateToProps, null)(ActionView);
