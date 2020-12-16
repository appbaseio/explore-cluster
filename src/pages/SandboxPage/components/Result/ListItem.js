/* eslint-disable camelcase */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Row, Col, Divider, Popover, Tag, Icon, Button } from 'antd';

import { listItem } from './styles';
import Grading from './Grading';
import Expand from './Expand';

const MAX_RENDERED_KEYS = 10;

const getObjKeys = ({ hasOverflow, collapsed, data }) => {
	const keys = Object.keys(data);
	const slice = hasOverflow && collapsed ? keys.slice(0, MAX_RENDERED_KEYS) : keys;
	return slice;
};

// eslint-disable-next-line react/prefer-stateless-function
class ListItem extends React.Component {
	render() {
		const { item, showFeaturedProducts, onChange, value, selectButtonLabel } = this.props;
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
				{showFeaturedProducts && (
					<Popover
						content={
							<h4>{`Click to ${
								value && value.includes(item._id) ? 'Remove' : 'Add'
							} item`}</h4>
						}
						trigger="hover"
					>
						<Button
							type="primary"
							ghost
							style={{ float: 'right', width: 125 }}
							onClick={() => {
								onChange(item);
							}}
						>
							{value && value.includes(item._id) ? (
								<>
									<Icon type="check" /> Featured
								</>
							) : (
								selectButtonLabel
							)}
						</Button>
					</Popover>
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
	showFeaturedProducts: PropTypes.bool,
	selectButtonLabel: PropTypes.string,
	value: PropTypes.array,
	onChange: PropTypes.func,
};

ListItem.defaultProps = {
	item: {},
	showFeaturedProducts: false,
	selectButtonLabel: 'Feature',
	value: [],
	onChange: () => {},
};

export default ListItem;
