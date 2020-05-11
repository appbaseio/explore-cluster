import React from 'react';
import PropTypes from 'prop-types';
import Ace from '../../../../batteries/components/SearchSandbox/containers/AceEditor';

class CustomData extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			requestData: JSON.stringify(props.value || {}, null, 2),
			parsedData: props.value || {},
		};
	}

	handleRequestDataChange = (value) => {
		this.setState({ requestData: value });
		try {
			const parsedData = JSON.parse(value);
			this.setState({ parsedData }, () => {
				const { parsedData: parsedDataNew } = this.state;
				const { onChange } = this.props;
				onChange(parsedDataNew);
			});
			// eslint-disable-next-line no-empty
		} catch (e) {}
	};

	render() {
		const { requestData } = this.state;
		return (
			<Ace
				mode="json"
				theme="monokai"
				name="editor-JSON"
				fontSize={14}
				showPrintMargin
				style={{
					maxHeight: '250px',
					width: '100%',
				}}
				showGutter
				highlightActiveLine
				setOptions={{
					showLineNumbers: true,
					tabSize: 2,
				}}
				editorProps={{ $blockScrolling: true }}
				value={requestData}
				onChange={this.handleRequestDataChange}
			/>
		);
	}
}

CustomData.propTypes = {
	value: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

CustomData.defaultProps = {
	value: {},
};

export default CustomData;
