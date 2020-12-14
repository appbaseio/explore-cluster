import React from 'react';
import { Card, Button } from 'antd';
import get from 'lodash/get';
import { string, object } from 'prop-types';
import { connect } from 'react-redux';
import Flex from '../../batteries/components/shared/Flex';

const getURL = () => {
	const { host, protocol } = new URL(sessionStorage.getItem('url'));
	const username = sessionStorage.getItem('username');
	const password = sessionStorage.getItem('password');
	const uri = `${protocol}//${username}:${password}@${host}`;
	return uri;
};

class SyncStatus extends React.Component {
	constructor(props) {
		super(props);
		const { form } = props;
		this.state = {
			exportType: form.get('exportSettings.type').value,
			documents: 0,
			products: 0,
			collections: 0,
		};
		this.fetchData();
	}

	componentDidMount() {
		const { form } = this.props;
		const exportTypeHandler = form.get('exportSettings.type');
		exportTypeHandler.valueChanges.subscribe(this.handleTypeChange);
	}

	componentWillUnmount() {
		const { form } = this.props;
		const exportTypeHandler = form.get('exportSettings.type');
		exportTypeHandler.valueChanges.unsubscribe(this.handleTypeChange);
	}

	get resyncURL() {
		const { index } = this.props;
		return `https://shopify-sync.appbase.io/?index=${index}&url=${getURL()}`;
	}

	get isShopify() {
		const { exportType } = this.state;
		return exportType === 'shopify';
	}

	handleTypeChange = (value) => {
		const { exportType } = this.state;
		if (exportType !== value)
			this.setState({
				exportType: value,
			});
	};

	fetchData = () => {
		const { index } = this.props;
		fetch(`${sessionStorage.getItem('url')}/${index}/_msearch`, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${sessionStorage.getItem('authToken')}`,
				Accept: 'application/json',
				'Content-Type': 'application/x-ndjson',
			},
			body: `{}\n${JSON.stringify({
				query: { term: { type: 'products' } },
				size: 0,
			})}\n{}\n${JSON.stringify({
				query: { term: { type: 'collections' } },
				size: 0,
			})}\n{}\n${JSON.stringify({
				query: { match_all: {} },
				size: 0,
			})}\n`,
		})
			.then((res) => res.json())
			.then((res) => {
				this.setState({
					products: get(res, 'responses[0].hits.total.value'),
					collections: get(res, 'responses[1].hits.total.value'),
					documents: get(res, 'responses[2].hits.total.value'),
				});
			})
			.catch((e) => {
				console.error(e);
			});
	};

	render() {
		const { documents, products, collections } = this.state;
		return (
			<Card>
				<Flex justifyContent="space-between" alignItems="center">
					{this.isShopify ? (
						<div>
							<h3>
								{' '}
								Number of Products: <strong>{products}</strong>
								<span
									style={{
										marginLeft: 20,
									}}
								>
									Number of Collections: <strong>{collections}</strong>
								</span>
							</h3>
						</div>
					) : (
						<div>
							<h3>
								{' '}
								Number of Documents: <strong>{documents}</strong>
							</h3>
						</div>
					)}
					<div>
						{this.isShopify ? (
							<Button
								style={{
									marginRight: 15,
								}}
								target="blank"
								href={this.resyncURL}
								icon="reload"
							>
								Resync
							</Button>
						) : null}

						<Button href="browse" type="primary">
							Browse Data
						</Button>
					</div>
				</Flex>
			</Card>
		);
	}
}

SyncStatus.propTypes = {
	index: string.isRequired,
	form: object.isRequired,
};

const mapStateToProps = (state) => ({
	index: get(state, '$getCurrentApp.name'),
});
export default connect(mapStateToProps)(SyncStatus);
