import React from 'react';
import { Empty, Collapse, List } from 'antd';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import relevancyItemTitles, { relevancyTitles } from './helper';
import Flex from '../../batteries/components/shared/Flex';

const DiffList = ({ diff }) => {
	if (!diff) {
		return (
			<Empty
				image={Empty.PRESENTED_IMAGE_SIMPLE}
				description={<span>No change in search relevancy configuration</span>}
			/>
		);
	}
	console.log('diff', diff);

	return (
		<div style={{ maxHeight: '72vh', overflow: 'auto' }}>
			<Collapse defaultActiveKey={[Object.keys(diff)[0]]}>
				{Object.keys(diff).map((setting) => (
					<Collapse.Panel
						key={setting}
						header={<b style={{ fontSize: 16 }}>{relevancyTitles[setting]}</b>}
					>
						<List
							dataSource={Object.keys(diff[setting]).map((i) => ({
								title: i,
								data: diff[setting][i],
							}))}
							renderItem={(item) => (
								<List.Item>
									<Flex justifyContent="space-between" style={{ width: '100%' }}>
										<div style={{ flex: 1 }}>
											<h3>{get(relevancyItemTitles[item.title], 'title')}</h3>
											<p>
												{get(
													relevancyItemTitles[item.title],
													'description',
												)}
											</p>
										</div>
										<div style={{ flex: 1 }}>{JSON.stringify(item.data)}</div>
									</Flex>
								</List.Item>
							)}
						/>
					</Collapse.Panel>
				))}
			</Collapse>
		</div>
	);
};

DiffList.propTypes = {
	// eslint-disable-next-line
	diff: PropTypes.object,
};

export default DiffList;
