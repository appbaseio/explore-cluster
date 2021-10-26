import React from 'react';
import PropTypes from 'prop-types';
import { Card, Radio, Icon, Row, Button, Alert, Tooltip, Typography } from 'antd';
import { StateProvider } from '@appbaseio/reactivesearch';
import { Link } from 'react-router-dom';
import { css } from 'emotion';
import get from 'lodash/get';
import QueryView from './QueryView';
import ListView from './ListView';
import settingsMap from '../../../../components/ReviewAndSave/helper';
import { ruleStyle } from './styles';
import ActionView from '../../../QueryRules/components/ActionView';

const section = css`
	margin-bottom: 10px;
`;

class Result extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			view: 'list',
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { result, app, rules } = this.props;
		const { view } = this.state;
		if (
			JSON.stringify(result) === JSON.stringify(nextProps.result) &&
			app === nextProps.app &&
			view === nextState.view &&
			JSON.stringify(rules) === JSON.stringify(nextProps.rules)
		) {
			return false;
		}
		return true;
	}

	handleViewChange = (e) => {
		this.setState({
			view: e.target.value,
		});
	};

	titleCase = (str) => {
		let sentence = str. toLowerCase(). split("_");
		for (let i = 0; i < sentence. length; i++) {
		sentence[i] = sentence[i][0]. toUpperCase() + sentence[i]. slice(1);
		}
		return sentence. join(" ");
	}

	render() {
		const {
			result,
			app,
			rules,
			showFeaturedProducts,
			onChange,
			value,
			selectButtonLabel,
			page,
			withRule,
		} = this.props;
		const { view } = this.state;
		let ruleData;
		const id = window?.window.location.pathname.split('/')[3];
		if (id) {
			ruleData = rules.find((rule) => rule.id === id) || {};
		}
		return (
			<Card>
				<StateProvider
					includeKeys={['settings']}
					componentIds={['result']}
					render={({ searchState }) => {
						const rulesApplied = get(searchState, 'result.settings.queryRules', []);
						if(page === 'rules' && id && withRule) {
							return (
								<Alert
									type="info"
									icon="info"
									style={{ margin: '0px 0 16px' }}
									message={
										<React.Fragment>
											<div className={ruleStyle}>
												<div>
													<p className="name">{ruleData.name}</p>
													<p className="expression">
														{ruleData.trigger &&
															ruleData.trigger.expression}
													</p>
												</div>
												<div>
													{get(ruleData, 'actions', []).map((action) => (
														<div key={action.type} className={section}>
															<ActionView action={action} ruleId={ruleData.id} />
														</div>
													))}
												</div>
											</div>
										</React.Fragment>
									}
								/>
							)
						} else if(rulesApplied.length) {
							return (
								<Alert
									type="info"
									icon="info"
									style={{ margin: '0px 0 16px' }}
									message={
										<React.Fragment>
											<Typography.Text>
												Query{' '}
												{rulesApplied.length > 1 ? 'rules' : 'rule'}{' '}
												applied
											</Typography.Text>
											{rulesApplied.map((rule) => {
												const ruleInfo = (rules || []).find(
													(r) => r.id === rule,
												);

												return (
													<div className={ruleStyle}>
														<div>
															<p className="name">
																{ruleInfo.name}
															</p>
															<p className="expression">
																{ruleInfo &&
																	ruleInfo.trigger &&
																	ruleInfo.trigger
																		.expression}
															</p>
														</div>
														<div>
															<Link
																to={`/cluster/rules/${rule}`}
															>
																<Button size="small">
																	Edit Rule
																</Button>
															</Link>
														</div>
													</div>
												);
											})}
										</React.Fragment>
									}
								/>
							)
						}
						return null;
					}}
				/>
				<Row type="flex" justify="space-between" align="middle">
					{page !== 'rules' && (
						<Link to={`/app/${app}/results/`}>
							<Tooltip title={settingsMap.set_result.description}>
								<Button ghost type="primary">
									<Icon type="edit" />
									{settingsMap.set_result.title}
								</Button>
							</Tooltip>
						</Link>
					)}
					<Radio.Group value={view} onChange={this.handleViewChange}>
						<Radio.Button value="list">
							<Icon style={{ marginRight: 5 }} type="unordered-list" />
							Results
						</Radio.Button>
						<Radio.Button value="query" data-cy="raw-request-button">
							<Icon style={{ marginRight: 5 }} type="code" />
							Raw
						</Radio.Button>
					</Radio.Group>
				</Row>
				{view === 'list' ? (
					<ListView
						result={result}
						showFeaturedProducts={showFeaturedProducts}
						selectButtonLabel={selectButtonLabel}
						value={value}
						onChange={onChange}
					/>
				) : (
					<QueryView />
				)}
			</Card>
		);
	}
}

Result.propTypes = {
	result: PropTypes.object,
	app: PropTypes.string.isRequired,
	rules: PropTypes.array,
	showFeaturedProducts: PropTypes.bool,
	selectButtonLabel: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.array,
	page: PropTypes.string,
	withRule: PropTypes.bool,
};

Result.defaultProps = {
	result: {},
	rules: [],
	showFeaturedProducts: false,
	selectButtonLabel: undefined,
	onChange: () => {},
	value: [],
	page: '',
	withRule: false,
};

// const mapStateToProps = (state, props) => {
// 	return {
// 		AppRules:  get(state, '$getSearchState.searchState.settings'),
// 	}
// };

// export default connect(mapStateToProps, null)(Result);

export default Result;
