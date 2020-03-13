import React from 'react';
import { Card, Radio, Icon, Row, Button, Alert, Tooltip } from 'antd';
import { StateProvider } from '@appbaseio/reactivesearch';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import QueryView from './QueryView';
import ListView from './ListView';
import { settingsMap } from '../../../../components/ReviewAndSave/helper';

class Result extends React.Component {
	state = {
		view: 'list',
	};

	handleViewChange = e => {
		this.setState({
			view: e.target.value,
		});
	};

	render() {
		const { result, app, credentials, url, onChange, query } = this.props;
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
									style={{ marginBottom: 8 }}
									message={`${rulesApplied.length} Query ${
										rulesApplied.length > 1 ? 'rules' : 'rule'
									} applied`}
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

export default Result;
