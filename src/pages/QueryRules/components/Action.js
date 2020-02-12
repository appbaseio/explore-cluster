import React from 'react';
import { css } from 'emotion';
import { Tag, Typography, Popover } from 'antd';

const subTitle = css`
	font-size: 14px;
	margin: 0;
	color: rgba(0, 0, 0, 0.75);
	font-weight: bold;
`;

const Action = ({ action }) => {
	const actionType = Object.keys(action)[0];

	switch (actionType) {
		case 'replace_search_term':
			return action.replace_search_term ? (
				<React.Fragment>
					<h4 className={subTitle}>Replace Search Term</h4>
					<Tag>{action.replace_search_term}</Tag>
				</React.Fragment>
			) : null;
		case 'hide_result':
			return action.hide_result ? (
				<React.Fragment>
					<h4 className={subTitle}>Hide Result</h4>
					{action.hide_result.map(id => (
						<Tag color="red" key={id}>
							{id}
						</Tag>
					))}
				</React.Fragment>
			) : null;

		case 'promote_result':
			return action.promote_result ? (
				<React.Fragment>
					<h4 className={subTitle}>Promote Result</h4>
					{action.promote_result.map(item => (
						<Tag color="blue" key={item.doc.id}>
							{item.doc.id}
						</Tag>
					))}
				</React.Fragment>
			) : null;
		case 'add_filter':
			return action.add_filter ? (
				<React.Fragment>
					<h4 className={subTitle}>Add Filter</h4>
					{Object.keys(action.add_filter).map(filter => (
						<Typography.Text key={filter} style={{ display: 'block', margin: '2px 0' }}>
							<strong>{filter}: </strong> {action.add_filter[filter]}
							<br />
						</Typography.Text>
					))}
				</React.Fragment>
			) : null;
		case 'function':
			return (
				action.function && (
					<React.Fragment>
						<h4 className={subTitle}>Function</h4>
						<Tag color="purple">{action.function}</Tag>
					</React.Fragment>
				)
			);

		case 'custom_data':
			return (
				action.custom_data && (
					<React.Fragment>
						<h4 className={subTitle}>Custom Data</h4>
						<Popover content={<pre>{JSON.stringify(action.custom_data, null, 4)}</pre>}>
							<Tag color="green">{`{...}`}</Tag>
						</Popover>
					</React.Fragment>
				)
			);

		default:
			return null;
	}
};

export default Action;
