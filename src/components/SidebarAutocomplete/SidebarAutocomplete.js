import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { List, Breadcrumb, Tag, Empty } from 'antd';
import { css } from 'emotion';
import IndexSwitcher from '../IndexSwitcher';
import WithRedirectTooltip from '../WithRedirectTooltip';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

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
	}
	.ant-list-item-meta-description {
		color: #e8e8e8;
		font-size: 13px;
	}
	.ant-breadcrumb {
		font-size: 13px;
		color: #d9d9d9;
	}
	.ant-breadcrumb-separator {
		color: #bfbfbf;
	}
	.ant-breadcrumb > span:last-child {
		color: white;
	}
	.flex {
		display: flex;
		align-items: center;
	}

	.space-between {
		justify-content: space-between;
	}
`;

const emptyStyle = css`
	.ant-empty-description {
		color: #fafafa;
	}
`;

const SearchItem = ({ item }) => {
	return (
		<Breadcrumb separator=">">
			{item.label && <Breadcrumb.Item>{get(item, 'title')}</Breadcrumb.Item>}
			<Breadcrumb.Item>{get(item, 'label') || get(item, 'title')}</Breadcrumb.Item>
		</Breadcrumb>
	);
};

SearchItem.propTypes = {
	item: PropTypes.object,
};

SearchItem.defaultProps = {
	item: {},
};

const SidebarAutocomplete = ({ routes, value, filteredApps, history, resetAutoComplete }) => {
	const filteredMenus = routes.filter(
		(menu) =>
			get(menu, 'title', '').toLowerCase().includes(value.toLowerCase()) ||
			get(menu, 'label', '').toLowerCase().includes(value.toLowerCase()),
	);

	const handleListClick = (item) => {
		if (!item.openIndexMenu) {
			resetAutoComplete();
			history.push(item.link);
		}
	};

	if (filteredMenus.length === 0) {
		return (
			<Empty
				className={emptyStyle}
				description="No menu item found"
				image={Empty.PRESENTED_IMAGE_SIMPLE}
			/>
		);
	}

	return (
		<ErrorToaster>
			<List
				itemLayout="horizontal"
				dataSource={filteredMenus}
				className={listStyle}
				renderItem={(item) => (
					<WithRedirectTooltip showTooltip={item.hasExactPath}>
						<List.Item onClick={() => handleListClick(item)} key={item.label}>
							<List.Item.Meta
								title={
									item.openIndexMenu ? (
										<IndexSwitcher
											filteredApps={filteredApps}
											history={history}
											renderItem={(popConfirmProps) => {
												return (
													<div {...popConfirmProps}>
														<SearchItem item={item} />
														{item.tag ? (
															<Tag
																style={{
																	fontSize: 10,
																}}
																color="#002140"
															>
																{item.tag}
															</Tag>
														) : null}
													</div>
												);
											}}
											item={item}
										/>
									) : (
										<SearchItem item={item} />
									)
								}
								description={
									!item.openIndexMenu && item.tag ? (
										<Tag
											style={{
												fontSize: 10,
											}}
											color="#002140"
										>
											{item.tag}
										</Tag>
									) : null
								}
							/>
						</List.Item>
					</WithRedirectTooltip>
				)}
			/>
		</ErrorToaster>
	);
};

SidebarAutocomplete.propTypes = {
	routes: PropTypes.array,
	value: PropTypes.string,
	filteredApps: PropTypes.array,
	history: PropTypes.object.isRequired,
	resetAutoComplete: PropTypes.func.isRequired,
};

SidebarAutocomplete.defaultProps = {
	routes: [],
	value: '',
	filteredApps: [],
};

export default React.memo(SidebarAutocomplete);
