import { Button, Dropdown, Icon, Menu, Popconfirm, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import React from 'react';
import { css } from 'emotion';
import { dropdown } from '../../batteries/components/Mappings/styles';
import { LabelTag } from '../LabelTag';

const popOverClass = css`
	.ant-popover-buttons {
		display: none;
	}
	.ant-popover-inner-content {
		padding: 12px;
	}
`;

// eslint-disable-next-line import/prefer-default-export
export function IndexSwitcher({ item, filteredApps = [] }) {
	if (filteredApps.length === 1)
		return (
			<Link to={`/app/${filteredApps[0]}/${item.link}`}>
				<LabelTag item={item} />
			</Link>
		);

	const menu = (
		<Menu>
			{filteredApps.map(app => (
				<Menu.Item key={app}>
					<Link replace to={`/app/${app}/${item.link}`}>
						{app}
					</Link>
				</Menu.Item>
			))}
		</Menu>
	);

	function getTitle() {
		if (filteredApps.length === 0)
			return <div style={{ margin: 4 }}>Please create an index to get started.</div>;
		return (
			<Dropdown overlay={menu}>
				<Button className={dropdown} style={{ minWidth: 200 }}>
					Select Index
					<Icon type="down" />
				</Button>
			</Dropdown>
		);
	}

	return (
		<Popconfirm
			overlayClassName={popOverClass}
			placement="right"
			icon={
				<Tooltip title="Select an index to navigate to.">
					<Icon
						style={{
							fontSize: 17,
							marginTop: 2,
							color: '#1890ff',
						}}
						type="info-circle"
					/>
				</Tooltip>
			}
			title={getTitle()}
		>
			<LabelTag item={item} />
		</Popconfirm>
	);
}
