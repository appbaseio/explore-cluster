import React from 'react';
import { func, bool, number } from 'prop-types';
import { Button, Icon } from 'antd';
import Loader from '../../components/Loader';
import { BaseURL, BaseCSSURL } from './utils';

class StoreFrontPreview extends React.Component {
	constructor(props) {
		super(props);
		this.iframeRef = React.createRef(`iframe-preview`);
		this.state = {
			loading: true,
			isMobile: false,
		};
	}

	componentDidMount() {
		this.iframeRef.current.addEventListener('load', this.onLoad);
	}

	onLoad = () => {
		const { preferences, isRecommendation, widgetId } = this.props;
		const div = this.iframeRef.current.contentDocument.createElement('div');
		if (isRecommendation) {
			div.id = 'reactivesearch-shopify-product-recommendations';
			if (widgetId) {
				div.setAttribute('widget-id', widgetId);
			}
		} else {
			div.id = 'reactivesearch-shopify-1';
			div.setAttribute('openaspage', true);
			div.setAttribute('ispreview', true);
		}
		// Set preferences
		this.iframeRef.current.contentWindow.PREFERENCES = JSON.stringify(preferences());
		this.iframeRef.current.contentDocument.body.appendChild(div);
		const link = this.iframeRef.current.contentDocument.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = BaseCSSURL;
		this.iframeRef.current.contentDocument.body.appendChild(link);
		const script = this.iframeRef.current.contentDocument.createElement('script');
		script.type = 'text/javascript';
		script.src = BaseURL;
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
		this.iframeRef.current.contentDocument.body.appendChild(script);
	};

	handleViewChange = () => {
		this.setState((prevState) => ({
			isMobile: !prevState.isMobile,
		}));
	};

	render() {
		const { isMobile, loading } = this.state;
		return (
			<div
				style={{
					textAlign: 'center',
				}}
			>
				{loading ? <Loader /> : null}
				<Button
					style={{
						position: 'fixed',
						top: 10,
						left: '50%',
						right: '50%',
						zIndex: 5,
					}}
					onClick={this.handleViewChange}
				>
					<Icon
						style={{
							fontSize: 20,
						}}
						type={isMobile ? 'desktop' : 'mobile'}
					/>
				</Button>
				<iframe
					title="iframe-preview"
					id="iframe-preview"
					ref={this.iframeRef}
					frameBorder="0"
					style={{
						border: isMobile ? '1px solid rgb(204, 204, 204)' : undefined,
					}}
					width={isMobile ? 400 : '100%'}
					height={window.innerHeight - 60}
					src="about:blank"
				/>
			</div>
		);
	}
}
StoreFrontPreview.defaultProps = {
	isRecommendation: false,
	widgetId: undefined,
};

StoreFrontPreview.propTypes = {
	preferences: func.isRequired,
	isRecommendation: bool,
	widgetId: number,
};

export default StoreFrontPreview;
