import React from 'react';
import { func } from 'prop-types';
import Loader from '../../components/Loader';
import { BaseURL, BaseCSSURL } from './utils';

class StoreFrontPreview extends React.Component {
	state = {
		loading: true,
	};

	componentDidMount() {
		const { preferences } = this.props;
		window.PREFERENCES = JSON.stringify(preferences());
		const script = document.createElement('script');
		script.src = BaseURL;
		script.async = true;
		script.onload = () => {
			this.setState({
				loading: false,
			});
		};
		script.onerror = () => {
			this.setState({
				loading: false,
			});
		};
		document.body.appendChild(script);
	}

	render() {
		const { loading } = this.state;
		return (
			<div>
				<link rel="stylesheet" type="text/css" href={BaseCSSURL} />
				<div openwithmodal="false" id="reactivesearch-shopify-1" />
				{loading ? <Loader /> : null}
			</div>
		);
	}
}

StoreFrontPreview.propTypes = {
	preferences: func.isRequired,
};

export default StoreFrontPreview;
