import React, { Fragment, useState } from 'react';
import {
 Row, Col, Button, Icon, List, Switch, Card, Divider, Tooltip,
} from 'antd';
import { connect } from 'react-redux';
import { string } from 'prop-types';
import get from 'lodash/get';

import Loader from '../../components/Loader';
import Header from '../../components/Header';
import { getFunctions, updateFunctions } from '../../batteries/modules/actions';
import CreateFunction from './CreateFunction';
import TriggerFunction from './TriggerFunction';
import InvokeFunctionModal from '../../components/InvokeFunctionModal';
import DeployFunctionModal from '../../components/DeployFunctionModal';

const IconText = ({ type, text }) => (
	<span>
		<Icon type={type} style={{ marginRight: 8 }} />
		{text}
	</span>
);

function InvokeButton({ item }) {
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Button onClick={() => setVisible(true)} style={{ marginLeft: 8 }} type="primary">
				<Icon type="experiment" />
				Invoke Function
			</Button>
			{visible && (
				<InvokeFunctionModal
					handleCancel={() => setVisible(false)}
					invocationCount={item.function.invocation_count}
					functionName={item._id}
				/>
			)}
		</>
	);
}

class FunctionsPage extends React.Component {
	state = { invokeModal: false, deployModal: false };

	componentDidMount() {
		const { fetchFunctions, appName } = this.props;
		fetchFunctions(appName);
	}

	refetchFunction = () => {
		const { fetchFunctions, appName } = this.props;
		fetchFunctions(appName);
	};

	handleEnable = (isChecked, node) => {
		const { putFunctions } = this.props;
		putFunctions(node._id, {
			...node,
			enabled: isChecked,
		});
	};

	handleCancel = (modalKey) => {
		this.setState({ [modalKey]: false });
	};

	render() {
		const { isLoading, functions } = this.props;
		const { deployModal } = this.state;

		if (isLoading) {
			return <Loader />;
		}
		return (
			<Fragment>
				<Header compact>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>Deployed Functions</h2>
							<Row>
								<Col lg={18}>
									<p>
										Bring data from JSON/CSV/ElasticSearch/SQL sources into
										appbase.io via GUI.
									</p>
								</Col>
							</Row>
						</Col>
						<Col
							lg={6}
							css={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CreateFunction />

							<Button
								onClick={() => {
									this.setState({ deployModal: true });
								}}
								type="primary"
								size="large"
								rel="noopener noreferrer"
							>
								<Icon type="deployment-unit" />
								Deploy Function
							</Button>
						</Col>
					</Row>
				</Header>
				<section style={{ padding: 50 }}>
					<Card bordered title="All Functions">
						<List
							itemLayout="vertical"
							dataSource={functions}
							renderItem={item => (
								<List.Item
									key={item._id}
									extra={(
          <React.Fragment>
											<TriggerFunction
												isLoading={item.triggerUpdation}
												refetchFunction={this.refetchFunction}
												node={item}
											/>

											<InvokeButton item={item} />
										</React.Fragment>
        )}
								>
									<List.Item.Meta
										title={(
           <React.Fragment>
												{item.function.service}
												<Tooltip
													title={`${
														item.enabled ? 'Disable' : 'Enable'
													} Function`}
												>
													<Switch
														style={{ marginLeft: 8 }}
														loading={item.isToggling}
														onChange={e => this.handleEnable(e, item)}
														checked={item.enabled}
													/>
												</Tooltip>
											</React.Fragment>
         )}
										description={[
											<IconText
												type="container"
												key="container"
												text={item.function.image}
											/>,
											<Divider
												type="vertical"
												style={{ margin: '0 16px' }}
											/>,
											<IconText
												text={item.function.invocation_count}
												type="api"
												key="api"
											/>,
										]}
									/>
									{deployModal && (
										<DeployFunctionModal
											handleCancel={() => this.handleCancel('deployModal')}
										/>
									)}
								</List.Item>
							)}
						/>
					</Card>
				</section>
			</Fragment>
		);
	}
}

FunctionsPage.propTypes = {
	appName: string.isRequired,
};

const mapStateToProps = state => ({
	type: get(state, '$getAppPlan.results.billing_type'),
	user: get(state, 'user', { data: {} }),
	isLoading: get(state, '$getAppFunctions.isFetching'),
	functions: get(state, '$getAppFunctions.results'),
});

const mapDispatchToProps = dispatch => ({
	putFunctions: (appName, payload) => dispatch(updateFunctions(appName, payload)),
	fetchFunctions: appName => dispatch(getFunctions(appName)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(FunctionsPage);
