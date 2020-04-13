import { Icon, Popconfirm, Select, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import React from 'react';
import { css } from 'emotion';
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
export function IndexSwitcher({ item = {}, filteredApps = [], history, onSelect }) {
	if (filteredApps.length === 1)
		return (
			<Link to={`/app/${filteredApps[0]}/${item.link}`}>
				<LabelTag item={item} />
			</Link>
		);

	const sortedApps = filteredApps.sort((a, b) => {
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	});

	function getTitle() {
		if (filteredApps.length === 0)
			return <div style={{ margin: 4 }}>Please create an index to get started.</div>;
		return (
			<Select
				placeholder="Search for an index."
				style={{ minWidth: 180 }}
				onSelect={value => {
					if (onSelect) onSelect(value);
					else history.replace(`/app/${value}/${item.link}`);
				}}
				showSearch
			>
				{sortedApps.map(app => (
					<Select.Option key={app} value={app}>
						{app}
					</Select.Option>
				))}
			</Select>
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
