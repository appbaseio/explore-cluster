import React from 'react';
import { get } from 'lodash';
import { List } from 'antd';
import { css } from 'emotion';
import { LabelTag } from '../LabelTag';
import { IndexSwitcher } from '../IndexSwitcher';
import { WithRedirectTooltip } from '../../pages/AppWrapper/AppWrapper';

const listStyle = css`
	.ant-list-item {
		padding-left: 24px;
		padding-right: 24px;
		cursor: pointer;
		border-bottom-color: #002140;
		transition: all ease 0.2s;
	}
	.ant-list-item:hover {
		background: #1890ff;
	}
	.ant-list-item-meta-title {
		color: white;
		margin: 0;
	}
	.ant-list-item-meta-description {
		color: #e8e8e8;
		font-size: 13px;
	}
	.flex {
		display: flex;
		align-items: center;
	}

	.space-between {
		justify-content: space-between;
	}
`;


const SidebarAutocomplete = ({ routes, value, filteredApps, history, resetAutoComplete }) => {
	const filteredMenus = routes.filter(
		menu =>
			get(menu, 'title', '')
				.toLowerCase()
				.includes(value.toLowerCase()) ||
			get(menu, 'label', '')
				.toLowerCase()
				.includes(value.toLowerCase()),
	);

	const handleListClick = item => {
		if (!item.openIndexMenu) {
			resetAutoComplete();
			history.push(item.link);
		}
	};

	return (
		<List
			itemLayout="horizontal"
			dataSource={filteredMenus}
			className={listStyle}
			renderItem={item => (
				<WithRedirectTooltip showTooltip={item.hasExactPath}>
					<List.Item onClick={() => handleListClick(item)} key={item.label}>
						<List.Item.Meta
							title={
								item.openIndexMenu ? (
									<IndexSwitcher
										filteredApps={filteredApps}
										history={history}
										item={item}
									/>
								) : (
									item.label || item.title
								)
							}
							description={
								item.openIndexMenu ? null : (
									<LabelTag
										className="flex space-between"
										item={{
											label: item.label ? item.title : '',
											tag: item.tag,
										}}
									/>
								)
							}
						/>
					</List.Item>
				</WithRedirectTooltip>
			)}
		/>
	);
};

export default React.memo(SidebarAutocomplete);
