import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Tag, Typography, Popover } from 'antd';
import { hasValuesChanged } from '../utils';

const subTitle = css`
	font-size: 14px;
	margin: 0;
	color: rgba(0, 0, 0, 0.75);
	font-weight: bold;
`;

const { Text } = Typography;

class ActionView extends React.Component {
	shouldComponentUpdate(nextProps) {
		return hasValuesChanged(nextProps, this.props, 'action');
	}

	render() {
		const { action } = this.props;
		const actionType = action.type;
		switch (actionType) {
			case 'replace_search_term':
				return action.data ? (
					<React.Fragment>
						<h4 className={subTitle}>Replace Search Term</h4>
						<Tag>{action.data}</Tag>
					</React.Fragment>
				) : null;
			case 'hide_result':
				return action.data ? (
					<React.Fragment>
						<h4 className={subTitle}>Hide Result</h4>
						{action.data.map((id) => (
							<Tag color="red" key={id}>
								{id}
							</Tag>
						))}
					</React.Fragment>
				) : null;

			case 'promote_result':
				return action.data ? (
					<React.Fragment>
						<h4 className={subTitle}>Promote Result</h4>
						{action.data.map((item) => (
							<Tag color="blue" key={item.doc.id}>
								{item.doc._id}
							</Tag>
						))}
					</React.Fragment>
				) : null;
			case 'add_filter':
				return action.data ? (
					<React.Fragment>
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
						<React.Fragment>
							<h4 className={subTitle}>Function</h4>
							<Tag color="purple">{action.data}</Tag>
						</React.Fragment>
					)
				);

			case 'custom_data':
				return (
					action.data && (
						<React.Fragment>
							<h4 className={subTitle}>Custom Data</h4>
							<Popover content={<pre>{JSON.stringify(action.data, null, 4)}</pre>}>
								<Tag color="green">{`{...}`}</Tag>
							</Popover>
						</React.Fragment>
					)
				);
			case 'remove_words':
				return action.data ? (
					<React.Fragment>
						<h4 className={subTitle}>Remove Search Words</h4>
						{action.data.map((word) => (
							<Tag>{word}</Tag>
						))}
					</React.Fragment>
				) : null;
			case 'replace_words':
				return action.data ? (
					<React.Fragment>
						<h4 className={subTitle}>Replace Search Words</h4>
						{Object.keys(action.data).map((word) => (
							<div key={word}>
								<Tag>
									<Text delete>{word}</Text>
								</Tag>
								with{' '}
								<Tag style={{ marginLeft: 5 }}>
									<Text>{action.data[word]}</Text>
								</Tag>
							</div>
						))}
					</React.Fragment>
				) : null;
			case 'search_settings':
				return (
					action.data && (
						<React.Fragment>
							<h4 className={subTitle}>Search Settings</h4>
							<Popover content={<pre>{JSON.stringify(action.data, null, 4)}</pre>}>
								<Tag color="gold">{`{...}`}</Tag>
							</Popover>
						</React.Fragment>
					)
				);
			default:
				return null;
		}
	}
}

ActionView.propTypes = {
	action: PropTypes.object,
};

ActionView.defaultProps = {
	action: {},
};

export default ActionView;
