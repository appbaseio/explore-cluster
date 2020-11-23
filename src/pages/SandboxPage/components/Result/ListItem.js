/* eslint-disable camelcase */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Row, Col, Divider, Popover, Tag, Icon } from 'antd';

import { listItem } from './styles';
import Grading from './Grading';
import Expand from './Expand';

const MAX_RENDERED_KEYS = 10;

const getObjKeys = ({ hasOverflow, collapsed, data }) => {
	const keys = Object.keys(data);
	const slice = hasOverflow && collapsed ? keys.slice(0, MAX_RENDERED_KEYS) : keys;
	return slice;
};

class ListItem extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { item } = this.props;
		return JSON.stringify(item) !== JSON.stringify(nextProps.item);
	}

	render() {
		const { item } = this.props;
		const { _promoted, _click_id, _index, highlight, _type, index, ...rest } = item;

		return (
			<div className={listItem}>
				{_promoted && (
					<Tooltip title="Item promoted using Query Rules">
						<Tag color="#faad14">
							<Icon type="star" />
						</Tag>
					</Tooltip>
				)}
				<Expand>
					{({ hasOverflow, collapsed }) => (
						<>
							{getObjKeys({ hasOverflow, collapsed, data: rest }).map((key) => (
								<Row className="row" gutter={8} key={`${rest._id}_${key}`}>
									<Col md={10}>{key}</Col>
									<Col md={1} className="text-center">
										:
									</Col>
									<Col md={11} className="text-ellipsis">
										<Popover
											content={
												typeof rest[key] === 'object' ? (
													<pre
														dangerouslySetInnerHTML={{
															__html:
																JSON.stringify(rest[key]) || 'N/A',
														}}
													/>
												) : (
													<span
														dangerouslySetInnerHTML={{
															__html:
																JSON.stringify(rest[key]) || 'N/A',
														}}
													/>
												)
											}
										>
											{typeof rest[key] === 'object' ? (
												JSON.stringify(rest[key])
											) : (
												<span
													dangerouslySetInnerHTML={{
														__html: JSON.stringify(rest[key]) || 'N/A',
													}}
												/>
											)}
										</Popover>
									</Col>
								</Row>
							))}
						</>
					)}
				</Expand>

				<Grading id={item._id} />
				<Divider />
			</div>
		);
	}
}

ListItem.propTypes = {
	item: PropTypes.object,
};

ListItem.defaultProps = {
	item: {},
};

export default ListItem;
