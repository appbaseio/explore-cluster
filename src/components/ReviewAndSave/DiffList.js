import React from 'react';
import { Empty, Collapse, List, Table, Tag } from 'antd';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import relevancyItemTitles, { relevancyTitles } from './helper';
import Flex from '../../batteries/components/shared/Flex';

const DiffList = ({ diff }) => {
	if (!diff || !Object.keys(diff || {}).length) {
		return (
			<Empty
				image={Empty.PRESENTED_IMAGE_SIMPLE}
				description={<span>No change in search relevancy configuration</span>}
			/>
		);
	}

	return (
		<div style={{ maxHeight: '72vh', overflow: 'auto' }}>
			<Collapse defaultActiveKey={Object.keys(diff)}>
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
												{item.title === 'dataField' ? (
													<>
														{setting === 'search' &&
															`Index field(s) to be searched against`}
														{setting === 'aggregations' &&
															`Index field(s) to be aggregated against`}
													</>
												) : (
													<>
														{get(
															relevancyItemTitles[item.title],
															'description',
														)}
													</>
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
																<Tag color="volcano">{ow}</Tag>
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
											{get(item, 'data', null) &&
												get(item, 'data.length', 0) === 2 &&
												item.title !== 'dataField' &&
												item.title !== 'fieldWeights' &&
												item.title !== 'ngramSettings' &&
												item.title !== 'autosuggestionSettings' &&
												item.title !== 'rankFeature' && (
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
														style={{
															height: 'max-content',
															marginBottom: '7px',
															overflow: 'auto',
														}}
														columns={[
															{
																title: 'Old Value',
																key: 'oldVal',
																dataIndex: 'oldVal',
																width: '50%',
																render: (ov) => (
																	<Tag
																		color="volcano"
																		style={{
																			textDecoration:
																				'line-through',
																		}}
																		data-cy={`old-value-${item.title}-status`}
																	>
																		{typeof ov === 'boolean'
																			? ov.toString()
																			: ov}
																	</Tag>
																),
															},
															{
																title: 'New Value',
																key: 'newVal',
																width: '50%',
																dataIndex: 'newVal',
																render: (nv) => (
																	<Tag
																		color="green"
																		data-cy={`new-value-${item.title}-status`}
																	>
																		{typeof nv === 'boolean'
																			? nv.toString()
																			: nv}
																	</Tag>
																),
															},
														]}
													/>
												)}
											{item.title === 'rankFeature' &&
												setting === 'search' && (
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
																		{get(
																			fieldData,
																			'isDeleted',
																		) ? (
																			<span>
																				{field}&nbsp;
																				<Tag color="red">
																					removed
																				</Tag>
																			</span>
																		) : (
																			<span>
																				{field}&nbsp;
																				{fieldData.oldValue ===
																					'N/A' && (
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
																title: 'Old Function',
																key: 'oldValue',
																dataIndex: 'oldValue',
																render: (ov) => (
																	<Tag color="volcano">
																		{ov.toString()}
																	</Tag>
																),
															},
															{
																title: 'New Function',
																key: 'newValue',
																dataIndex: 'newValue',
																render: (nv) => (
																	<Tag color="green">
																		{nv.toString()}
																	</Tag>
																),
															},
														]}
													/>
												)}
											{(item.title === 'ngramSettings' ||
												item.title === 'autosuggestionSettings') &&
												setting === 'search' && (
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
																render: (field, fieldData) => {
																	return (
																		<>
																			{get(
																				fieldData,
																				'isDeleted',
																			) ? (
																				<span>
																					{field}&nbsp;
																					<Tag color="red">
																						removed
																					</Tag>
																				</span>
																			) : (
																				<span>
																					{field}&nbsp;
																					{fieldData.oldValue ===
																						'N/A' && (
																						<Tag color="green">
																							new
																						</Tag>
																					)}
																				</span>
																			)}
																		</>
																	);
																},
															},
															{
																title: 'Old Value',
																key: 'oldValue',
																dataIndex: 'oldValue',
																render: (ov) => (
																	<Tag color="volcano">
																		{ov.toString()}
																	</Tag>
																),
															},
															{
																title: 'New Value',
																key: 'newValue',
																dataIndex: 'newValue',
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
																		<span
																			data-cy={`search-field-${field}`}
																		>
																			{field}&nbsp;
																			<Tag
																				color="red"
																				data-cy={`search-field-${field}-status`}
																			>
																				removed
																			</Tag>
																		</span>
																	) : (
																		<span
																			data-cy={`search-field-${field}`}
																		>
																			{field}&nbsp;
																			{fieldData.newWeight !==
																				'NA' && (
																				<Tag
																					color="green"
																					data-cy={`search-field-${field}-status`}
																				>
																					new
																				</Tag>
																			)}
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
																	data-cy="old-weight"
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
																<Tag
																	color="green"
																	data-cy="new-weight"
																>
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
																			<span
																				data-cy={`aggregation-field-${field}`}
																			>
																				{field}&nbsp;
																				<Tag
																					color="red"
																					data-cy={`aggregation-field-${field}-status`}
																				>
																					removed
																				</Tag>
																			</span>
																		) : (
																			<span
																				data-cy={`aggregation-field-${field}`}
																			>
																				{field}&nbsp;
																				{fieldData.oldAgg ===
																					'NA' && (
																					<Tag
																						color="green"
																						data-cy={`aggregation-field-${field}-status`}
																					>
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
																	<Tag color="volcano">
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
