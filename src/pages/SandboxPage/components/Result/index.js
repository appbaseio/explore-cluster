import React from 'react';
import { Card, Radio, Icon, Row, Button } from 'antd';
import QueryView from './QueryView';
import ListView from './ListView';

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
				<Row type="flex" justify="space-between" align="middle">
					<Button ghost type="primary">
						<Icon type="edit" />
						Set Result View
					</Button>
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
