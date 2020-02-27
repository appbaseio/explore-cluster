import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { css } from 'emotion';
import {
	Card,
	Select,
	Affix,
	Row,
	Button,
	Col,
	Dropdown,
	Icon,
	Menu,
	InputNumber,
	Switch,
} from 'antd';

import { getAppMappings } from '../../batteries/modules/actions';
import { getURL } from '../../constants/config';
import Mappings from '../../batteries/components/Mappings/Mappings';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { getAggsMappings } from '../../batteries/utils/mappings';
import { dropdown } from '../../batteries/components/Mappings/styles';

const { Option } = Select;

const container = css`
	padding: 50px;
`;

const cardStyle = css`
	label {
		display: block;
		font-weight: 500;
		margin-bottom: 5px;
		color: rgba(0, 0, 0, 0.85);
	}

	.input {
		margin-bottom: 15px;
		min-width: 200px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.input.no-bottom {
		margin-bottom: 0;
	}
`;

class AggsPage extends React.Component {
	state = {
		searchableMappings: [],
		aggTypes: {},
		dataField: {},
		count: '',
		sort: undefined,
		includeNullValue: false,
	};

	mappingsRef = React.createRef(null);

	async componentDidMount() {
		const { appName, credentials, fetchMappings } = this.props;
		const url = getURL();

		fetchMappings(appName, credentials, url);
	}

	componentDidUpdate(prevProps) {
		const { mappings } = this.props;
		if (mappings && JSON.stringify(prevProps.mappings) !== JSON.stringify(mappings)) {
			const searchableMappings = this.getSearchableMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				searchableMappings,
			});
		}
	}

	getSearchableMappings = mappings => {
		const parsedMappings = getAggsMappings(mappings, true);
		const searchableMappings = parsedMappings
			.filter(mapping => mapping.usecase === 'search')
			.map(mapping => ({
				_address: `${mapping.type}.${mapping.address.split('.').join('.properties.')}`,
				address: mapping.address,
			}));

		return searchableMappings;
	};

	handleMappingChange = mappings => {
		const searchableMappings = this.getSearchableMappings(mappings);

		this.setState({
			searchableMappings,
		});
	};

	handleAddField = value => {
		if (get(this.mappingsRef, 'current.wrappedInstance', null)) {
			const esVersion = get(this.mappingsRef, 'current.wrappedInstance.state.esVersion');
			const setMapping = get(this.mappingsRef, 'current.wrappedInstance.setMapping');

			if (esVersion && setMapping) {
				const address = +esVersion > 6 ? `properties.${value}` : value;

				setMapping(address, 'text', 'searchaggs');
			}
		}
	};

	handleAggType = (address, value) => {
		const parsedAddress = address.split('.').reduce((agg, key, index) => {
			if (index % 2 !== 0) {
				return agg ? `${agg}.${key}` : key;
			}
			return agg;
		}, '');
		this.setState(prevState => ({
			aggTypes: { ...prevState.aggTypes, [address]: value },
			dataField: { ...prevState.dataField, [parsedAddress]: value },
		}));
	};

	handleChange = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	render() {
		const { searchableMappings, aggTypes, sort, count, includeNullValue } = this.state;
		const sortOptions = ['Count', 'Ascending', 'Descending'];
		return (
			<div className={container}>
				<Card>
					<Mappings
						showSynonyms={false}
						showShards={false}
						ref={this.mappingsRef}
						showReplicas={false}
						showMappingInfo={false}
						showCardWrapper={false}
						hideSearchType
						hideDelete
						hideDataType
						onChange={this.handleMappingChange}
						column={{
							title: 'Aggregation Type',
							render: ({ fields, field, address }) => {
								const hasKeyword = !!get(fields, `${field}.fields.keyword`, false);
								let options = ['term', 'range'];
								if (hasKeyword) {
									options = ['term'];
								}
								const menu = (
									<Menu onClick={e => this.handleAggType(address, e.key)}>
										{options.map(option => (
											<Menu.Item key={option}>{option}</Menu.Item>
										))}
									</Menu>
								);
								return (
									<Dropdown overlay={menu}>
										<Button className={dropdown}>
											{aggTypes[address] || 'Select Type'}
											<Icon type="down" />
										</Button>
									</Dropdown>
								);
							},
						}}
						renderFooter={({ cancelChanges, confirmChanges, isDirty }) => (
							<Affix offsetBottom={73}>
								<Row
									style={{
										padding: 10,
										border: '1px solid #e8e8e8',
										background: 'white',
										width: '100%',
									}}
									type="flex"
									justify="space-between"
								>
									<Col>
										{searchableMappings.length ? (
											<Select
												key={searchableMappings.length}
												showSearch
												placeholder="Add new aggregation field"
												optionFilterProp="children"
												style={{ minWidth: 200 }}
												onChange={this.handleAddField}
												filterOption={(input, option) =>
													option.props.children
														.toLowerCase()
														.indexOf(input.toLowerCase()) >= 0
												}
											>
												{searchableMappings.map(mapping => (
													<Option
														key={mapping._address}
														value={mapping._address}
													>
														{mapping.address}
													</Option>
												))}
											</Select>
										) : null}
									</Col>
									<Col>
										{isDirty && (
											<React.Fragment>
												<Button
													type="primary"
													style={{ margin: '0 10px' }}
													onClick={confirmChanges}
												>
													Confirm Mapping Changes
												</Button>
												<Button onClick={cancelChanges}>Cancel</Button>
											</React.Fragment>
										)}
									</Col>
								</Row>
							</Affix>
						)}
					/>
				</Card>
				<Card className={cardStyle}>
					<label>
						Default Size For Aggregations <Icon type="info-circle" />
					</label>
					<InputNumber
						onChange={value => this.handleChange('count', value)}
						value={count}
						min={10}
						placeholder="Enter default aggs size"
						className="input"
					/>
					<label>
						Default Sort <Icon type="info-circle" />
					</label>
					<Select
						placeholder="Select default Sort"
						value={sort}
						optionFilterProp="children"
						style={{ minWidth: 200, marginBottom: '15px' }}
						onChange={value => this.handleChange('sort', value)}
						filterOption={(input, option) =>
							option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
					>
						{sortOptions.map(sortOption => (
							<Option key={sortOption} value={sortOption.toLowerCase()}>
								{sortOption}
							</Option>
						))}
					</Select>
					<label>
						Include Null Values <Icon type="info-circle" />
					</label>
					<Switch
						checked={includeNullValue}
						onChange={value => this.handleChange('includeNullValue', value)}
					/>
				</Card>
				<Affix offsetBottom={0}>
					<div
						style={{
							padding: 20,
							background: 'white',
							boxShadow: 'rgba(0, 0, 0, 0.1) 0px -4px 7px 0px',
						}}
					>
						<Button type="primary">
							<Icon type="save" />
							Save Settings
						</Button>
					</div>
				</Affix>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const mappings = getRawMappingsByAppName(state) || null;

	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
		mappings,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
	};
};

const mapDispatchToProps = dispatch => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AggsPage);
