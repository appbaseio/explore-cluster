import React from 'react';
import { func, bool, number, oneOfType, string } from 'prop-types';
import { MobileOutlined, DesktopOutlined } from '@ant-design/icons';
import { Button, notification } from 'antd';
import get from 'lodash/get';
import Loader from '../../components/Loader';
import SearchPreviewWrapper from './SearchPreviewWrapper';
import { BaseURL, BaseCSSURL } from './utils';

class StoreFrontPreview extends React.Component {
	constructor(props) {
		super(props);
		this.iframeRef = React.createRef(`iframe-preview`);
		this.state = {
			loading: !props.displayProductPicker,
			isMobile: false,
			currentProduct: '',
		};
	}

	componentDidMount() {
		const { displayProductPicker } = this.props;
		if (!displayProductPicker) {
			if (this.iframeRef.current) {
				this.onLoad();
			}
		}
	}

	onLoad = () => {
		const { preferences, isRecommendation, widgetId } = this.props;
		const { currentProduct } = this.state;
		const div = this.iframeRef.current.contentDocument.createElement('div');
		this.setState({
			loading: true,
		});
		if (isRecommendation) {
			div.id = 'reactivesearch-shopify-product-recommendations';
			if (widgetId) {
				div.setAttribute('widget-id', widgetId);
			}
			if (currentProduct) {
				div.setAttribute('current-product', currentProduct);
			}
		} else {
			div.id = 'reactivesearch-shopify-1';
			div.setAttribute('openaspage', true);
		}
		div.setAttribute('isPreview', true);
		// Set preferences

		// Add userId
		const newPreferences = { ...preferences() };
		newPreferences.appbaseSettings.userId = 'appbase.io dashboard';

		if (isRecommendation) {
			this.iframeRef.current.contentWindow.APPBASE_RECOMMENDATIONS_PREFERENCES =
				JSON.stringify(preferences());
		} else {
			this.iframeRef.current.contentWindow.APPBASE_SEARCH_PREFERENCES =
				JSON.stringify(newPreferences);
		}

		this.iframeRef.current.contentDocument.body.appendChild(div);
		const link = this.iframeRef.current.contentDocument.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = BaseCSSURL;
		this.iframeRef.current.contentDocument.body.appendChild(link);

		const link1 = this.iframeRef.current.contentDocument.createElement('link');
		link1.rel = 'stylesheet';
		link1.href = 'https://use.fontawesome.com/releases/v5.8.1/css/all.css';
		link1.integrity = 'sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf';
		link1.crossorigin = 'anonymous';
		this.iframeRef.current.contentDocument.body.appendChild(link1);

		const link2 = this.iframeRef.current.contentDocument.createElement('link');
		link2.rel = 'stylesheet';
		link2.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/leaflet.css';
		this.iframeRef.current.contentDocument.body.appendChild(link2);

		const link3 = this.iframeRef.current.contentDocument.createElement('link');
		link3.rel = 'shortcut icon';
		link3.href = '/static/images/favicon.ico';
		this.iframeRef.current.contentDocument.body.appendChild(link3);

		const link4 = this.iframeRef.current.contentDocument.createElement('link');
		link4.rel = 'preload';
		link4.as = 'style';
		link4.href = 'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700';
		this.iframeRef.current.contentDocument.body.appendChild(link4);

		const link5 = this.iframeRef.current.contentDocument.createElement('link');
		link5.rel = 'stylesheet';
		link5.href = 'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700s';
		this.iframeRef.current.contentDocument.body.appendChild(link5);

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

	handleProductSelection = (item) => {
		const { similarToField, onSelectProduct } = this.props;
		let notifyError;
		if (similarToField) {
			const docId = get(item, `${similarToField.split('.keyword')[0]}`);
			if (docId) {
				this.setState(
					{
						currentProduct: docId,
					},
					() => {
						this.onLoad();
						if (onSelectProduct) {
							onSelectProduct(item);
						}
					},
				);
			} else {
				notifyError = true;
			}
		} else {
			notifyError = true;
		}
		if (notifyError) {
			notification.error({
				message: 'Invalid Product Selection',
				description:
					'The selected product does not have the field value that matches with the product page url that you defined for the recommendation. Either change the field by editing the recommendation or select a different product.',
			});
		}
	};

	render() {
		const { isMobile, loading, currentProduct } = this.state;
		const { pipeline } = this.props;
		const { displayProductPicker } = this.props;
		let showLayoutSwitcher = true;
		if (displayProductPicker && !currentProduct) {
			showLayoutSwitcher = false;
		}
		return (
			<div
				style={{
					textAlign: 'center',
				}}
			>
				{loading ? <Loader /> : null}
				{showLayoutSwitcher && (
					<Button
						style={{
							position: 'fixed',
							top: 10,
							left: '50%',
							right: '50%',
							zIndex: 5,
							padding: 0,
							width: 'max-content',
							display: 'flex',
							placeItems: 'center',
						}}
						onClick={this.handleViewChange}
					>
						{isMobile ? (
							<DesktopOutlined
								style={{
									fontSize: 20,
									position: 'relative',
									top: '1px',
									margin: '0 7px',
								}}
							/>
						) : (
							<MobileOutlined
								style={{
									fontSize: 20,
									position: 'relative',
									top: '1px',
									margin: '0 7px',
								}}
							/>
						)}
					</Button>
				)}
				{displayProductPicker && !currentProduct && (
					<SearchPreviewWrapper
						openWithModal={false}
						pipeline={pipeline}
						selectButtonLabel="Select Product"
						value={currentProduct ? [currentProduct] : []}
						onChange={this.handleProductSelection}
					/>
				)}
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
	similarToField: undefined,
	onSelectProduct: null,
	pipeline: undefined,
	displayProductPicker: false,
};

StoreFrontPreview.propTypes = {
	preferences: func.isRequired,
	onSelectProduct: func,
	similarToField: string,
	pipeline: string,
	displayProductPicker: bool,
	isRecommendation: bool,
	widgetId: oneOfType([number, string]),
};

export default StoreFrontPreview;
