import React from 'react';
import { ReactiveList } from '@appbaseio/reactivesearch';
import ExpandCollapse from 'react-expand-collapse';
import { css } from 'emotion';
import { Spin, Row, Col, Divider, Popover, Tag, Icon, Tooltip } from 'antd';
import { flatObject } from '../../utils';

const listItem = css`
	position: relative;
	padding-bottom: 10px;
	.text-right {
		text-align: right;
	}

	.text-center {
		text-align: center;
	}

	.text-ellipsis {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ant-col {
		margin-bottom: 5px;
	}

	.react-expand-collapse__content {
		position: relative;
		overflow: hidden;
	}

	.react-expand-collapse__body {
		display: inline;
	}

	/* expand-collapse button */
	.react-expand-collapse__button {
		color: #22a7f0;
		position: absolute;
		bottom: 0;
		left: 0;
		background-color: #fff;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		width: 100%;
		background: linear-gradient(0, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.82));
	}

	.react-expand-collapse__button:before {
		content: '';
		position: absolute;
		top: 0;
		left: -20px;
		width: 20px;
		height: 100%;
		background: linear-gradient(to right, transparent 0, #fff 100%);
	}

	/* expanded state */
	.react-expand-collapse--expanded .react-expand-collapse__button {
		padding-left: 5px;
		position: relative;
		bottom: auto;
		right: auto;
	}

	.react-expand-collapse--expanded .react-expand-collapse__button:before {
		content: none;
	}
`;

const ListItemWrapper = ({ item }) => {
	const flattenObject = flatObject(item);
	return (
		<div className={listItem}>
			{item._promoted && (
				<Tooltip title="Item promoted using Query Rules">
					<Tag color="#faad14">
						<Icon type="star" />
					</Tag>
				</Tooltip>
			)}
			<ExpandCollapse previewHeight="200px" expandText="Show more">
				<Row className="row" gutter={8}>
					{Object.keys(item).map(key => (
						<React.Fragment key={key}>
							<Col md={10}>{key}</Col>
							<Col md={1} className="text-center">
								:
							</Col>
							<Col md={11} className="text-ellipsis">
								{typeof flattenObject[key] === 'object' ? (
									<Popover
										content={
											<pre>{JSON.stringify(flattenObject[key], null, 4)}</pre>
										}
									>
										{JSON.stringify(flattenObject[key])}
									</Popover>
								) : (
									flattenObject[key] || 'N/A'
								)}
							</Col>
						</React.Fragment>
					))}
				</Row>
			</ExpandCollapse>
			<Divider />
		</div>
	);
};

const ListItem = React.memo(ListItemWrapper);

const ListView = ({ result }) => (
	<React.Fragment>
		<ReactiveList
			{...result}
			style={{ margin: '12px 0' }}
			pagination
			componentId={result.id}
			render={({ data, loading }) => {
				if (loading) {
					return <Spin />;
				}
				return (
					<React.Fragment>
						{data.map(item => (
							<ListItem key={item._id} item={item} />
						))}
					</React.Fragment>
				);
			}}
		/>
	</React.Fragment>
);

export default ListView;
