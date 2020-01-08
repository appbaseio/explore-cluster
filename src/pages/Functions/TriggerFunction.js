import React from 'react';
import {
 Button, Icon, message, Modal, notification, Popover, Radio, Typography,
} from 'antd';
import { connect } from 'react-redux';
import { css } from 'emotion';
import TextArea from 'antd/lib/input/TextArea';
import { updateFunctions } from '../../batteries/modules/actions';
import Ace from '../../batteries/components/SearchSandbox/containers/AceEditor';

const { Paragraph } = Typography;

const codeStyle = css`
	padding: 10px;
	background: #f8f8f8;
`;

const paragraphStyle = css`
	margin-top: 20px;
	margin-bottom: 10px !important;
`;

class TriggerFunction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isVisible: false,
			type: (props.node && props.node.trigger && props.node.trigger.type) || 'filter',
			when: (props.node && props.node.trigger && props.node.trigger.when) || 'before',
			request: '',
			expression: '',
			isValidJSON: true,
			parsedValue: {},
		};
	}

	componentDidUpdate(prevProps) {
		const {
			error: error1,
			function: { service },
		} = this.props.node || {};
		if (prevProps.node.error !== error1) {
			if (error1) {
				notification.error({
					message: 'Error',
					description: error1,
				});
			} else {
				message.success(`${service} triggered successfully`);
				this.handleModal();
			}
		}
	}

	handleModal = () => {
		this.setState(prevState => ({
			isVisible: !prevState.isVisible,
		}));
	};

	handleSave = () => {
		const { putFunctions, node } = this.props;
		const {
 type, when, expression, parsedValue,
} = this.state;
		putFunctions(node.function.service, {
			...node,
			trigger: {
				type,
				executeBefore: when === 'before',
			},
			extraRequestPayload: parsedValue,
			expression,
		});
	};

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleRequestChange = (value) => {
		let isValid = true;
		let parsedValue;
		try {
			parsedValue = JSON.parse(value);
		} catch (e) {
			isValid = false;
		}
		this.setState({ parsedValue, request: value, isValidJSON: isValid });
	};

	render() {
		const {
 isVisible, type, when, expression, request, isValidJSON,
} = this.state;
		const { node, isLoading } = this.props;
		const enviroment = `index = ['abc']
category = 'search'
acl = 'search'
query = 'iphone'
filter = [{"year": "2018"}]`;
		const code = `'abc' in index

'abc' in index and query contains 'iphone' // combination use

(category matches 'docs' and acl matches 'create') and not (index matches '^logs*$')`;
		const content = (
			<div>
				<Paragraph>
					Filter expressions allow setting a trigger condition for the function. You can
					read more to understand the syntax.{' '}
				</Paragraph>
				<Paragraph strong>Enviroment</Paragraph>
				<pre className={codeStyle}>{enviroment}</pre>

				<Paragraph strong>Example Expression</Paragraph>
				<pre className={codeStyle}>{code}</pre>
			</div>
		);

		return (
			<React.Fragment>
				<Button loading={isLoading} onClick={this.handleModal}>
					<Icon type="thunderbolt" />
					Set Trigger
				</Button>
				<Modal
					title={`Set Trigger for ${node.function.service}`}
					visible={isVisible}
					onOk={this.handleSave}
					onCancel={this.handleModal}
					okText="Save"
					okButtonProps={{
						loading: isLoading,
						disabled: !isValidJSON,
					}}
				>
					<Paragraph style={{ marginBottom: 10 }} strong>
						Trigger Type
					</Paragraph>
					<Radio.Group name="type" onChange={this.handleChange} value={type}>
						<Radio value="always">Always</Radio>
						<Radio value="filter">Filter</Radio>
					</Radio.Group>

					{type === 'filter' ? (
						<React.Fragment>
							<Paragraph className={paragraphStyle} strong>
								Trigger Type
								<Popover content={content} title="Filter expression Syntax">
									<Icon style={{ marginLeft: 5 }} type="info-circle" />
								</Popover>
							</Paragraph>
							<TextArea
								placeholder="Enter filter Expression"
								onChange={this.handleChange}
								value={expression}
								name="expression"
							/>
						</React.Fragment>
					) : null}

					<Paragraph className={paragraphStyle} strong>
						When to Execute
					</Paragraph>
					<Radio.Group name="when" onChange={this.handleChange} value={when}>
						<Radio value="before">Before Search</Radio>
						<Radio value="after">After Search</Radio>
					</Radio.Group>

					<React.Fragment>
						<Paragraph className={paragraphStyle} strong>
							Extra Request
						</Paragraph>
						<Ace
							mode="json"
							value={request}
							onChange={this.handleRequestChange}
							name="editor-JSON"
							fontSize={14}
							showPrintMargin
							style={{ width: '100%', maxHeight: '100px' }}
							showGutter
							highlightActiveLine
							setOptions={{
								showLineNumbers: true,
								tabSize: 2,
							}}
							editorProps={{ $blockScrolling: true }}
						/>
					</React.Fragment>
				</Modal>
			</React.Fragment>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	putFunctions: (appName, payload) => dispatch(updateFunctions(appName, payload, true)),
});

export default connect(
	null,
	mapDispatchToProps,
)(TriggerFunction);
