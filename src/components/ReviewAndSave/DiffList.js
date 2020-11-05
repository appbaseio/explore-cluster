import React from 'react';
import { Empty, Collapse, List, Table, Tag } from 'antd';
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
										<div style={{ flex: 1 }}>
											{item.title === 'fieldWeights' && (
												<Table
													dataSource={item.data}
													bordered
													pagination={false}
													size="small"
													rowKey="field"
													columns={[
														{
															title: 'Field',
															dataIndex: 'field',
															key: 'field',
														},
														{
															title: 'Old Weight',
															dataIndex: 'oldWeight',
															key: 'oldWeight',
															render: (ow) => (
																<Tag
																	color="volcano"
																	style={{
																		textDecoration:
																			'line-through',
																	}}
																>
																	{ow}
																</Tag>
															),
														},
														{
															title: 'New Weight',
															dataIndex: 'newWeight',
															key: 'newWeight',
															render: (nw) => (
																<Tag color="green">{nw}</Tag>
															),
														},
													]}
												/>
											)}
											{item.data.length === 2 &&
												item.title !== 'dataField' &&
												item.title !== 'fieldWeights' && (
													<Table
														bordered
														key={item.title}
														pagination={false}
														size="small"
														rowKey="key"
														dataSource={[
															{
																key: Date.now(),
																oldVal: item.data[0],
																newVal: item.data[1],
															},
														]}
														columns={[
															{
																title: 'Old Value',
																key: 'oldVal',
																dataIndex: 'oldVal',
																render: (ov) => (
																	<Tag
																		color="volcano"
																		style={{
																			textDecoration:
																				'line-through',
																		}}
																	>
																		{ov.toString()}
																	</Tag>
																),
															},
															{
																title: 'New Value',
																key: 'newVal',
																dataIndex: 'newVal',
																render: (nv) => (
																	<Tag color="green">
																		{nv.toString()}
																	</Tag>
																),
															},
														]}
													/>
												)}
											{item.title === 'dataField' && setting === 'search' && (
												<Table
													bordered
													key={item.title}
													pagination={false}
													size="small"
													rowKey="field"
													dataSource={item.data}
													style={{
														height: 300,
														overflow: 'auto',
													}}
													columns={[
														{
															title: 'Field',
															key: 'field',
															dataIndex: 'field',
															render: (field, fieldData) => (
																<>
																	{get(fieldData, 'isDeleted') ? (
																		<span>
																			{field}&nbsp;
																			<Tag color="red">
																				deleted
																			</Tag>
																		</span>
																	) : (
																		<span>
																			{field}&nbsp;
																			<Tag color="green">
																				new
																			</Tag>
																		</span>
																	)}
																</>
															),
														},
														{
															title: 'Old Weight',
															key: 'oldWeight',
															dataIndex: 'oldWeight',
															render: (ov) => (
																<Tag
																	color="volcano"
																	style={{
																		textDecoration:
																			'line-through',
																	}}
																>
																	{ov.toString()}
																</Tag>
															),
														},
														{
															title: 'New Weight',
															key: 'newWeight',
															dataIndex: 'newWeight',
															render: (nv) => (
																<Tag color="green">
																	{nv.toString()}
																</Tag>
															),
														},
													]}
												/>
											)}

											{item.title === 'dataField' &&
												setting === 'aggregations' && (
													<Table
														bordered
														key={item.title}
														pagination={false}
														size="small"
														rowKey="field"
														dataSource={item.data}
														columns={[
															{
																title: 'Field',
																key: 'field',
																dataIndex: 'field',
																render: (field, fieldData) => (
																	<>
																		{get(
																			fieldData,
																			'isDeleted',
																		) ? (
																			<span>
																				{field}&nbsp;
																				<Tag color="red">
																					deleted
																				</Tag>
																			</span>
																		) : (
																			<span>
																				{field}&nbsp;
																				{fieldData.oldAgg ===
																					'NA' && (
																					<Tag color="green">
																						new
																					</Tag>
																				)}
																			</span>
																		)}
																	</>
																),
															},
															{
																title: 'Old Aggregation',
																key: 'oldAgg',
																dataIndex: 'oldAgg',
																render: (ov) => (
																	<Tag
																		color="volcano"
																		style={{
																			textDecoration:
																				'line-through',
																		}}
																	>
																		{ov.toString()}
																	</Tag>
																),
															},
															{
																title: 'New Aggregation',
																key: 'newAgg',
																dataIndex: 'newAgg',
																render: (nv) => (
																	<Tag color="green">
																		{nv.toString()}
																	</Tag>
																),
															},
														]}
													/>
												)}
										</div>
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
