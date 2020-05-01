import React from 'react';
import PropTypes from 'prop-types';
import { Card, Radio, Icon, Row, Button, Alert, Tooltip, Typography } from 'antd';
import { StateProvider } from '@appbaseio/reactivesearch';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import QueryView from './QueryView';
import ListView from './ListView';
import settingsMap from '../../../../components/ReviewAndSave/helper';
import { ruleStyle } from './styles';

class Result extends React.Component {
	state = {
		view: 'list',
	};

	handleViewChange = (e) => {
		this.setState({
			view: e.target.value,
		});
	};

	render() {
		const { result, app, credentials, url, onChange, query, rules } = this.props;
		const { view } = this.state;
		return (
			<Card>
				<StateProvider
					includeKeys={['settings']}
					componentIds={['result']}
					render={({ searchState }) => {
						const rulesApplied = get(searchState, 'result.settings.queryRules', []);
						if (rulesApplied.length) {
							return (
								<Alert
									type="info"
									icon="info"
									style={{ margin: '0px 0 16px' }}
									message={
										<React.Fragment>
											<Typography.Text>
												Query {rulesApplied.length > 1 ? 'rules' : 'rule'}{' '}
												applied
											</Typography.Text>
											{rulesApplied.map((rule) => {
												const ruleInfo = (rules || []).find(
													(r) => r.id === rule,
												);

												return (
													<div className={ruleStyle}>
														<div>
															<p className="name">{ruleInfo.name}</p>
															<p className="expression">
																{ruleInfo &&
																	ruleInfo.trigger &&
																	ruleInfo.trigger.expression}
															</p>
														</div>
														<div>
															<Link to={`/cluster/rules/${rule}`}>
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
							);
						}
						return null;
					}}
				/>
				<Row type="flex" justify="space-between" align="middle">
					<Link to={`/app/${app}/results/`}>
						<Tooltip title={settingsMap.set_result.description}>
							<Button ghost type="primary">
								<Icon type="edit" />
								{settingsMap.set_result.title}
							</Button>
						</Tooltip>
					</Link>
					<Radio.Group value={view} onChange={this.handleViewChange}>
						<Radio.Button value="list">
							<Icon style={{ marginRight: 5 }} type="unordered-list" />
							Results
						</Radio.Button>
						<Radio.Button value="query">
							<Icon style={{ marginRight: 5 }} type="code" />
							Raw
						</Radio.Button>
					</Radio.Group>
				</Row>
				{view === 'list' ? (
					<ListView result={result} />
				) : (
					<QueryView
						app={app}
						credentials={credentials}
						url={url}
						query={query}
						onChange={onChange}
					/>
				)}
			</Card>
		);
	}
}

Result.propTypes = {
	result: PropTypes.object,
	app: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string,
	onChange: PropTypes.func,
	query: PropTypes.object,
	rules: PropTypes.array,
};

Result.defaultProps = {
	result: {},
	url: undefined,
	onChange: null,
	query: {},
	results: [],
};

export default Result;
