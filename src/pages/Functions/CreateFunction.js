import React from 'react';
import { Modal, Button, Collapse, Icon, Typography } from 'antd';
import { withRouter } from 'react-router-dom';
import { css } from 'emotion';

const { Text, Paragraph } = Typography;

const headerStyle = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	i {
		padding: 10px;
		border-radius: 50%;
		background: #fafafa;
		color: #595959;
		border: 1px solid #d9d9d9;
	}
	.content {
		margin-right: 10px;
	}
`;

const handlerCode = `module.exports = (event, context) => {
    if (event.body && event.body.env && event.body.env.query === "iphone") {
        event.body.env.query = "iphone X"
    }
    context
        .status(200)
        .succeed(event.body);
}
`;

const Code = ({ text }) => (
	<Paragraph style={{ display: 'flex', alignItems: 'baseline', margin: 0 }} copyable={{ text }}>
		<pre
			style={{
				padding: '8px 10px',
				background: '#f5f5f5',
				'white-space': 'pre-wrap',
			}}
		>
			{text}
		</pre>
	</Paragraph>
);

const PanelHeader = ({ icon, text, title }) => (
	<div className={headerStyle}>
		<div className="content">
			<Text style={{ fontSize: 16, marginBottom: 10 }} strong>
				{title}
			</Text>
			<br />
			{text && <Text type="secondary">{text}</Text>}
		</div>
		<div className="icon">
			<Icon type={icon} />
		</div>
	</div>
);

class CreateFunction extends React.Component {
	state = { visible: false };

	showModal = () => {
		this.setState({
			visible: true,
		});
	};

	handleToggle = () => {
		this.setState(prevState => ({
			visible: !prevState.visible,
		}));
	};

	render() {
		const { visible } = this.state;
		return (
			<div>
				<Button
					ghost
					size="large"
					block
					style={{ marginBottom: 10 }}
					type="primary"
					onClick={this.showModal}
				>
					<Icon type="plus" />
					Create a Function
				</Button>
				<Modal
					visible={visible}
					title="Create a Function"
					onOk={this.handleToggle}
					onCancel={this.handleToggle}
					footer={null}
				>
					<Collapse defaultActiveKey={1} accordion bordered={false}>
						<Collapse.Panel
							header={
								<PanelHeader
									title="Create function using faas-cli"
									icon="code"
									text={
										<React.Fragment>
											<a
												title="faas-cli"
												href="https://github.com/openfaas/faas-cli"
											>
												faas-cli
											</a>{' '}
											allows you quickly create and deploy a serverless
											functions using some pre-defined{' '}
											<a
												title="faas-cli"
												href="https://docs.openfaas.com/cli/templates/#templates"
											>
												templates
											</a>
											.
										</React.Fragment>
									}
								/>
							}
							showArrow={false}
							key={1}
						>
							<Paragraph strong>1. Install faas-cli</Paragraph>
							<Code text="curl -sSL https://cli.openfaas.com | sudo sh" />

							<Paragraph strong>2. Create function directory</Paragraph>
							<Code text="mkdir my-function" />
							<Paragraph strong>3. Get function template</Paragraph>
							<Paragraph>
								In this example we are using NodeJS template, you can select
								template for other languages{' '}
								<a
									href="https://docs.openfaas.com/cli/templates/"
									target="_blank"
									rel="noopener noreferrer"
								>
									here
								</a>
								.
								<Code text="faas-cli template pull https://github.com/openfaas-incubator/node10-express-template" />
							</Paragraph>

							<Paragraph strong>4. Create a Function</Paragraph>
							<Code text="faas new --lang node10-express my-first-function" />
							<Paragraph strong>5. Update my-first-function/handler.js</Paragraph>
							<Paragraph>
								Here you can add business logic, example if you want to change query
							</Paragraph>
							<Code text={handlerCode} />
							<Paragraph strong>6. Update image name</Paragraph>
							<Paragraph>
								In my-first-function.yaml file, update image name to either your
								docker-username/image or private-registry/image
							</Paragraph>
							<Paragraph strong>7. Build image</Paragraph>
							<Code text="faas-cli build -f my-first-function.yml" />
							<Paragraph strong>8. Push image</Paragraph>
							<Code text="faas-cli push -f function.yml" />
						</Collapse.Panel>
						<Collapse.Panel
							header={
								<PanelHeader
									title="Quick Tutorial"
									icon="play-circle"
									text="Here is a small video which will explain how to create a server less function built using NodeJS."
								/>
							}
							showArrow={false}
							key={2}
						>
							<iframe
								title="functions demo"
								style={{
									borderRadius: 3,
								}}
								width="450"
								height="315"
								src="https://www.youtube.com/embed/ak7nbXxjY-c"
								frameBorder="0"
								allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</Collapse.Panel>
					</Collapse>
				</Modal>
			</div>
		);
	}
}

export default withRouter(CreateFunction);
