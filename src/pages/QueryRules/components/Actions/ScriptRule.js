import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import ScriptConsole from '../../../../components/ScriptConsole';
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

const ScriptRule = ({ scriptId, fetchRule, onChange, scriptRule }) => {
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
		if (scriptRule) {
			setScriptRuleLocalValue(scriptRule);
		}
	}, [scriptRule]);
	return (
		<div>
			<Button onClick={() => setIsScriptConsoleOpen(true)}>Edit Script</Button>
			{isScriptConsoleOpen && (
				<Modal
					className="script-console-modal"
					visible={isScriptConsoleOpen}
					closable={false}
					title={<Button onClick={() => setIsScriptConsoleOpen(false)}>Go Back</Button>}
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
						onScriptSave={(value) => {
							setScriptRuleLocalValue(value);
							onChange(value);
							setIsScriptConsoleOpen(false);
						}}
						scriptRule={scriptRuleLocalValue}
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
};

const mapStateToProps = (state) => ({
	scriptRule: get(state, '$getAppScriptRules.results.script'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchRule: (scriptId) => dispatch(getScriptRule(scriptId)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(ScriptRule));
