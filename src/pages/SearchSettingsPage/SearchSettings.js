import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { css } from 'emotion';
import { Card, Select, Affix, Row, Button, Col, Icon, InputNumber, Switch } from 'antd';

import { getAppMappings } from '../../batteries/modules/actions';
import { getURL } from '../../constants/config';
import Mappings from '../../batteries/components/Mappings/Mappings';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { getAggsMappings } from '../../batteries/utils/mappings';

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

	.ant-switch {
		margin-bottom: 15px;
	}
`;

class SearchSettingsPage extends React.Component {
	state = {
		aggsMappings: [],
		searchWeights: {},
		dataField: {},
		hasSearchOperators: undefined,
		hasTypoTolerance: false,
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
			const aggsMappings = this.getAggsMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				aggsMappings,
			});
		}
	}

	getAggsMappings = mappings => {
		const parsedMappings = getAggsMappings(mappings, true);
		const aggsMappings = parsedMappings
			.filter(mapping => mapping.usecase === 'aggs' || mapping.usecase === 'none')
			.map(mapping => ({
				_address: `${mapping.type}.${mapping.address.split('.').join('.properties.')}`,
				address: mapping.address,
			}));

		return aggsMappings;
	};

	handleMappingChange = mappings => {
		const aggsMappings = this.getAggsMappings(mappings);

		this.setState({
			aggsMappings,
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

	handleSearchWeight = (address, value) => {
		const parsedAddress = address.split('.').reduce((agg, key, index) => {
			if (index % 2 !== 0) {
				return agg ? `${agg}.${key}` : key;
			}
			return agg;
		}, '');
		this.setState(prevState => ({
			searchWeights: { ...prevState.searchWeights, [address]: value },
			dataField: { ...prevState.dataField, [parsedAddress]: value },
		}));
	};

	handleChange = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	render() {
		const {
			aggsMappings,
			searchWeights,
			hasSearchOperators,
			hasTypoTolerance,
			typoTolerance,
		} = this.state;
		const toleranceOptions = ['AUTO', 1, 2];
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
						hideAggsType
						hideNoType
						hideDelete
						hideDataType
						onChange={this.handleMappingChange}
						column={{
							title: 'Field Weight',
							render: ({ address }) => {
								return (
									<InputNumber
										min={0}
										style={{ minWidth: 150, marginLeft: 12 }}
										value={searchWeights[address]}
										onChange={value => this.handleSearchWeight(address, value)}
										placeholder="Enter field weight"
									/>
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
										{aggsMappings.length ? (
											<Select
												key={aggsMappings.length}
												showSearch
												placeholder="Add new search field"
												optionFilterProp="children"
												style={{ minWidth: 200 }}
												onChange={this.handleAddField}
												filterOption={(input, option) =>
													option.props.children
														.toLowerCase()
														.indexOf(input.toLowerCase()) >= 0
												}
											>
												{aggsMappings.map(mapping => (
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
						Search Operators <Icon type="info-circle" />
					</label>
					<Switch
						checked={hasSearchOperators}
						onChange={value => this.handleChange('hasSearchOperators', value)}
					/>

					<label>
						Enable Typo Tolerance <Icon type="info-circle" />
					</label>
					<Switch
						checked={hasTypoTolerance}
						onChange={value => this.handleChange('hasTypoTolerance', value)}
					/>

					{hasTypoTolerance && (
						<React.Fragment>
							<label>
								Typo Tolerance <Icon type="info-circle" />
							</label>
							<Select
								placeholder="Select typo tolerance"
								value={typoTolerance}
								optionFilterProp="children"
								style={{ minWidth: 200, marginBottom: '15px' }}
								onChange={value => this.handleChange('typoTolerance', value)}
								filterOption={(input, option) =>
									option.props.children
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								{toleranceOptions.map(option => (
									<Option key={option} value={option}>
										{option}
									</Option>
								))}
							</Select>
						</React.Fragment>
					)}
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchSettingsPage);
