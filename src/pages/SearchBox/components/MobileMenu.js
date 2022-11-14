import React from 'react';
import PropTypes from 'prop-types';
import { DeleteOutlined, DownloadOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, message, notification, Typography } from 'antd';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import CloneSearchBox from './CloneSearchBox';

const menuStyle = css`
	font-size: 14px;
	i {
		font-size: 14px !important;
	}
`;

const MobileMenu = (props) => {
	const { searchBoxItem, removeSearchBox, showEdit, onExportCode } = props;

	return (
		<Dropdown
			placement="bottomRight"
			overlay={
				<Menu className={menuStyle}>
					<Menu.Item key="1">
						<span onClick={onExportCode}>
							<DownloadOutlined /> <Typography.Text>Export Code</Typography.Text>
						</span>
					</Menu.Item>
					{showEdit && (
						<Menu.Item key="0">
							<Link to={`/cluster/searchboxes/${searchBoxItem.id}`}>
								<EditOutlined /> <Typography.Text>Edit</Typography.Text>
							</Link>
						</Menu.Item>
					)}
					<Menu.Item key="2">
						<CloneSearchBox searchBox={searchBoxItem} isMobile />
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item
						onClick={() => {
							removeSearchBox(searchBoxItem.id)
								.then((res) => {
									if (res?.error) {
										notification.error({
											message: 'Error',
											description: res.error?.actual
												? res.error?.actual?.message
												: res.error?.message,
										});
									} else if (res.payload) {
										message.success('Searchbox successfully deleted');
									}
								})
								.catch((e) => {
									console.log('Error deleting searchbox', e);
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
	searchBoxItem: PropTypes.object,
	removeSearchBox: PropTypes.func.isRequired,
	showEdit: PropTypes.bool,
	onExportCode: PropTypes.func.isRequired,
};

MobileMenu.defaultProps = {
	searchBoxItem: {},
	showEdit: true,
};

export default MobileMenu;
