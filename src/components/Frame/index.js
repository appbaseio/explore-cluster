import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class Frame extends React.Component {
	constructor(props) {
		super(props);
		const { id } = props;
		this.iframeRef = React.createRef(`iframe-${id}`);
	}

	componentDidMount() {
		// eslint-disable-next-line react/no-find-dom-node
		const iframeNode = ReactDOM.findDOMNode(this.iframeRef.current);
		const { onLoad } = this.props;
		iframeNode.addEventListener('load', onLoad);
	}

	render() {
		const { id, onLoad, ...rest } = this.props;
		return <iframe ref={this.iframeRef} title={id} {...rest} />;
	}
}

Frame.propTypes = {
	id: PropTypes.string.isRequired,
	onLoad: PropTypes.func.isRequired,
};

Frame.defaultProps = {};

export default Frame;
