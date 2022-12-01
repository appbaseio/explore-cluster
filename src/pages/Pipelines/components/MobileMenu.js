import React from 'react';
import PropTypes from 'prop-types';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, message, notification, Typography } from 'antd';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import ClonePipeline from './ClonePipeline';

const menuStyle = css`
	font-size: 14px;
	i {
		font-size: 14px !important;
	}
`;

const MobileMenu = (props) => {
	const { pipeline, removePipeline, showEdit, history } = props;

	return (
		<Dropdown
			placement="bottomRight"
			overlay={
				<Menu className={menuStyle}>
					{showEdit && (
						<Menu.Item key="0">
							<Link to={`/cluster/pipelines/${pipeline.id}`}>
								<EditOutlined /> <Typography.Text>Edit</Typography.Text>
							</Link>
						</Menu.Item>
					)}
					<Menu.Item key="1">
						<ClonePipeline pipeline={pipeline} isMobile />
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item
						onClick={() => () => {
							removePipeline(pipeline.id).then((res) => {
								if (res?.error) {
									notification.error({
										message: 'Error',
										description: res.error?.actual
											? res.error?.actual?.message
											: res.error?.message,
									});
								} else if (res.payload) {
									message.success('successfully deleted pipeline');
									// means the current page is edit page
									if (!showEdit) {
										history.push('/cluster/pipelines');
									}
								}
							});
						}}
						key="3"
					>
						<DeleteOutlined style={{ color: '#f5222d' }} />{' '}
						<Typography.Text style={{ color: '#f5222d' }}>Delete</Typography.Text>
					</Menu.Item>
				</Menu>
			}
			trigger={['click']}
		>
			<Button shape="circle" icon={<MoreOutlined />} />
		</Dropdown>
	);
};

MobileMenu.propTypes = {
	pipeline: PropTypes.object,
	removePipeline: PropTypes.func.isRequired,
	history: PropTypes.any,
	showEdit: PropTypes.bool,
};

MobileMenu.defaultProps = {
	pipeline: {},
	history: {},
	showEdit: true,
};

export default MobileMenu;
