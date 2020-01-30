import React from 'react';
import {
	Button,
	Icon,
	message,
	Modal,
	notification,
	Popover,
	Radio,
	Table,
	Tooltip,
	Typography,
} from 'antd';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { get, pick } from 'lodash';
import TextArea from 'antd/lib/input/TextArea';
import { updateFunctions } from '../../batteries/modules/actions';
import Ace from '../../batteries/components/SearchSandbox/containers/AceEditor';

import './index.css';

const { Paragraph } = Typography;

const paragraphStyle = css`
	margin-top: 20px;
	margin-bottom: 10px !important;
`;

const columns = [
	{
		title: 'Variable',
		dataIndex: 'variable',
	},
	{
		title: 'Description',
		dataIndex: 'description',
		width: 600,
	},
	{
		title: 'Example values',
		dataIndex: 'example',
		render: text => <b>{text}</b>,
	},
];
const data = [
	{
		key: '1',
		variable: '$category',
		type: 'string',
		description: (
			<>
				Category is the classification of the type of the incoming request. It can be one of
				<b> docs</b>, <b>search</b>, <b>indices</b>, <b>cat</b>, <b>clusters</b>,{' '}
				<b>misc</b>, <b>analytics</b>.
			</>
		),
		example: 'search',
	},
	{
		key: '2',
		variable: '$acl',
		type: 'string',
		description: (
			<>
				An ACL is granular classification of the category of the incoming request. You can
				see the full list of values over{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://arc-api.appbase.io/?version=latest#c736042c-7247-41a7-ab26-91e6861a1167"
				>
					here
				</a>
				.
			</>
		),
		example: 'msearch',
	},
	{
		key: '3',
		variable: '$index',
		type: 'Array<string>',
		description: (
			<>
				The search index/indices used in the incoming request, default to{' '}
				<b>[&#34;*&#34;]</b> if no index is present.
			</>
		),
		example: '["my-index"]',
	},
	{
		key: '4',
		variable: '$query',
		type: 'string',
		description: (
			<>
				The search query string when present, default to <b>&#34;&#34;</b> if no query is
				present.
			</>
		),
		example: 'budget smart phone',
	},
	{
		key: '5',
		variable: '$filter',
		type: 'Array<{[key]: <string>]: string}>',
		description:
			'The search filters (aka facets) if present in the search query. If no filters are passed, this will contain an empty array.',
		example: '{ "year": 2012 }',
	},
	{
		key: '6',
		variable: '$now',
		type: 'int',
		description: 'Request timestamp in seconds since epoch.',
		example: '1578485425',
	},
];

const expressionColumns = [
	{ title: 'Example', dataIndex: 'example' },
	{ title: 'Description', dataIndex: 'description' },
];

const expressionData = [
	{
		example: <code>$category matches &apos;search&apos;</code>,
		description: (
			<>
				Filters the <b>search</b> requests.
			</>
		),
	},
	{
		example: (
			<code>$category matches &apos;search&apos; and $acl matches &apos;msearch&apos;</code>
		),
		description: (
			<>
				Filters the <b>_msearch</b> requests.
			</>
		),
	},
	{
		example: <code>&apos;my-index&apos; in $index</code>,
		description: (
			<>
				Filters the requests by <b>my-index</b>.
			</>
		),
	},
	{
		example: <code>$query startsWith &apos;iphone&apos;</code>,
		description: (
			<>
				Filters the requests for which search query starts with <b>iphone</b>.
			</>
		),
	},
	{
		example: <code>$filter.year matches &apos;2012&apos;</code>,
		description: (
			<>
				Filters the requests for which year <b>filter</b> is set to <b>2012</b>.
			</>
		),
	},
	{
		example: <code>$now &gt; 1578485425</code>,
		description: (
			<>
				Filters the requests made after <b>Jan 08 2020</b>.
			</>
		),
	},
];

class TriggerFunction extends React.Component {
	constructor(props) {
		super(props);
		const executeBeforeVal = get(props.node, 'trigger.executeBefore');
		this.state = {
			isVisible: false,
			type: (props.node && props.node.trigger && props.node.trigger.type) || 'always',
			when:
				// eslint-disable-next-line no-nested-ternary
				executeBeforeVal !== undefined ? (executeBeforeVal ? 'before' : 'after') : 'before',
			request: JSON.stringify(get(props.node, 'extraRequestPayload', {})),
			expression: (props.node && props.node.trigger && props.node.trigger.expression) || '',
			isValidJSON: true,
			parsedValue: get(props.node, 'extraRequestPayload', {}),
		};
	}

	handleModal = () => {
		this.setState(prevState => ({
			isVisible: !prevState.isVisible,
		}));
	};

	handleSave = () => {
		const { putFunctions, node } = this.props;
		const { type, when, expression, parsedValue } = this.state;
		putFunctions(node.function.service, {
			...pick(node, ['enabled', 'order', 'function']),
			trigger: {
				type,
				executeBefore: when === 'before',
				expression,
			},
			extraRequestPayload: parsedValue,
		}).then(res => {
			if (res && res.error) {
				notification.error({
					message: 'Error',
					description: res.error.message,
				});
			} else {
				message.success(`${node.function.service} updated successfully`);
				this.handleModal();
			}
		});
	};

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleRequestChange = value => {
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
		const { isVisible, type, when, expression, request, isValidJSON } = this.state;
		const { node, isLoading } = this.props;
		const content = (
			<div>
				<Paragraph>
					Filter expressions allow setting a trigger condition for the function. You can
					read more to understand the syntax.{' '}
				</Paragraph>
				<Paragraph strong>Environment</Paragraph>
				<Paragraph>
					<Table dataSource={data} columns={columns} size="small" pagination={false} />
				</Paragraph>
				<Paragraph strong>Expressions</Paragraph>
				<Paragraph>
					<Table
						dataSource={expressionData}
						columns={expressionColumns}
						size="small"
						pagination={false}
					/>
				</Paragraph>
				<Paragraph>
					We use this package to evaluate the expressions. Know more about syntax over{' '}
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/antonmedv/expr/blob/master/docs/Language-Definition.md"
					>
						here
					</a>
					.
				</Paragraph>
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
					style={{ top: 20 }}
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
								Filter Expression
								<Popover
									content={content}
									title="Filter Expression Syntax"
									autoAdjustOverflow={false}
									placement="bottom"
									overlayClassName="popover-overflow"
								>
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
							<Tooltip
								title={
									<>
										You can optionally add an additional request object (in JSON
										format) that will be accessible to the function as
										<b> event.body.extraRequestPayload</b> when it&#39;s invoked
										at all times.
									</>
								}
							>
								<Icon style={{ marginLeft: 5 }} type="info-circle" />
							</Tooltip>
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

export default connect(null, mapDispatchToProps)(TriggerFunction);
