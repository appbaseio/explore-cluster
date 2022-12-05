import React, { useEffect, useState } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Popover } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import Text from 'antd/lib/typography/Text';
import ScriptConsole from '../../../../components/ScriptConsole';
import Info from '../../../../components/Info';
import { withErrorToaster } from '../../../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { getScriptRule } from '../../../../batteries/modules/actions';

const scriptRuleModal = css`
	.ant-modal-content {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		box-sizing: border-box;
		border-radius: 0;
	}
`;

const ScriptRule = ({
	scriptId,
	envs: envsProp,
	savedExecutionContext,
	fetchRule,
	onChange,
	scriptRule,
}) => {
	const [isScriptConsoleOpen, setIsScriptConsoleOpen] = useState(false);
	const [scriptRuleLocalValue, setScriptRuleLocalValue] = useState('');

	useEffect(() => {
		if (!scriptId) {
			setIsScriptConsoleOpen(true);
		} else {
			fetchRule(scriptId);
		}
	}, []);

	useEffect(() => {
		if (scriptId && scriptRule) {
			setScriptRuleLocalValue(scriptRule);
		}
	}, [scriptRule]);

	// START: envs handling
	const [envValues, setEnvValues] = useState({
		envs: envsProp,
		currentEnvKey: '',
		currentEnvValue: '',
	});
	const { envs, currentEnvKey, currentEnvValue } = envValues;
	const [envPopoverVisible, setEnvPopoverVisible] = useState(false);

	const handleEnvsInputChange = (e) => {
		if (e.target.name === 'environmentKey') {
			if (Object.keys(envs).includes(e.target.getAttribute('data-env-field'))) {
				const finalEnvs = {
					...envs,
					[e.target.value]: envs[e.target.getAttribute('data-env-field')],
				};

				delete finalEnvs[e.target.getAttribute('data-env-field')];
				setEnvValues({
					...envValues,
					envs: { ...finalEnvs },
				});
			}

			return;
		}
		if (e.target.name === 'environmentValue') {
			setEnvValues({
				...envValues,
				envs: {
					...envs,
					[e.target.getAttribute('data-env-field')]: e.target.value,
				},
			});
			return;
		}

		setEnvValues({ ...envValues, [e.target.name]: e.target.value });
	};

	const handleEnvAddition = () => {
		if (!currentEnvKey || !currentEnvValue) {
			setEnvPopoverVisible(true);

			setTimeout(() => {
				setEnvPopoverVisible(false);
			}, 700);
			return;
		}

		setEnvValues({
			envs: { ...envs, [currentEnvKey]: currentEnvValue },
			currentEnvKey: '',
			currentEnvValue: '',
		});
	};

	useEffect(() => {
		try {
			if (JSON.stringify(envsProp) !== JSON.stringify(envs))
				onChange({ scriptValue: scriptRule, envs });
		} catch (e) {
			// eslint-disable-next-line
			console.error('error: ', e);
		}
	}, [envs]);
	// END: envs handling

	return (
		<div>
			<Button onClick={() => setIsScriptConsoleOpen(true)}>Edit Script</Button>
			<div style={{ marginTop: '1rem' }}>
				<Text style={{ display: 'inline-block', marginBottom: '15px' }}>
					Set Environments
					<Info content="Environments are persistent key / value pairs of string type that are available at runtime to this script action." />
				</Text>
				{envs && Object.keys(envs).length
					? Object.keys(envs).map((field) => (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '10px',
								}}
							>
								<Input
									name="environmentKey"
									value={field}
									placeholder="Key"
									onChange={handleEnvsInputChange}
									data-env-field={field}
								/>
								<Input
									name="environmentValue"
									value={envs[field]}
									placeholder="Value"
									onChange={handleEnvsInputChange}
									data-env-field={field}
								/>
								<DeleteOutlined
									style={{
										marginBottom: 15,
										color: 'red',
									}}
									onClick={() => {
										const newEnvs = { ...envs };
										delete newEnvs[field];
										setEnvValues({
											...envValues,
											envs: { ...newEnvs },
										});
									}}
								/>
							</div>
					  ))
					: null}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
					}}
				>
					<Input
						name="currentEnvKey"
						value={currentEnvKey}
						placeholder="Key"
						onChange={handleEnvsInputChange}
						style={{ margin: 0 }}
					/>
					<Input
						name="currentEnvValue"
						value={currentEnvValue}
						placeholder="Value"
						onChange={handleEnvsInputChange}
						style={{ margin: 0 }}
					/>

					<Popover
						content={
							<span style={{ color: '#ff4d4f' }}>Please fill key/ value pair.</span>
						}
						visible={envPopoverVisible}
						overlayStyle={{ opacity: '0.9' }}
						trigger="click"
						placement="top"
					>
						<PlusOutlined style={{ color: '#1990ff' }} onClick={handleEnvAddition} />
					</Popover>
				</div>
			</div>
			{isScriptConsoleOpen && (
				<Modal
					className="script-console-modal"
					visible={isScriptConsoleOpen}
					closable={false}
					title={
						<Popconfirm
							title="Any changes would be lost. Do you really want to go back?"
							onConfirm={() => setIsScriptConsoleOpen(false)}
							okText="Yes"
							cancelText="No"
							placement="bottomRight"
						>
							<Button>Go Back</Button>
						</Popconfirm>
					}
					footer={null}
					style={{ top: 0, margin: 0, padding: 0 }}
					css={scriptRuleModal}
					bodyStyle={{
						height: 'calc(100vh - 50px)',
						overflowY: 'scroll',
						padding: ' 0 1rem',
					}}
				>
					<ScriptConsole
						onScriptSave={({ script, payloadExecutionContextObj }) => {
							setScriptRuleLocalValue(script);
							onChange({ scriptValue: script, envs, payloadExecutionContextObj });
							setIsScriptConsoleOpen(false);
						}}
						scriptRule={scriptRuleLocalValue}
						envs={envs}
						savedExecutionContext={savedExecutionContext}
					/>
				</Modal>
			)}
		</div>
	);
};

ScriptRule.defaultProps = {
	scriptId: '',
	scriptRule: '',
};

ScriptRule.propTypes = {
	scriptId: PropTypes.string,
	scriptRule: PropTypes.string,
	fetchRule: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	envs: PropTypes.object.isRequired,
	savedExecutionContext: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	scriptRule: get(state, '$getAppScriptRules.results.script'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchRule: (scriptId) => dispatch(getScriptRule(scriptId)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(ScriptRule));
