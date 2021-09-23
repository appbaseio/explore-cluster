import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { Card } from 'antd';
import { clearAppStoredQueries } from '../../batteries/modules/actions';
import Monaco from '../../batteries/components/SearchSandbox/containers/MonacoEditor';

const main = css`
	margin-top: 15px;
	.ant-card-head {
		padding: 0px 50px;
	}
	.ant-card-body {
		background-color: transparent;
		padding: 24px 50px;
	}
`;

class StoredQueryResponse extends React.Component {
	componentWillUnmount() {
		const { clearValidateExecute } = this.props;
		clearValidateExecute(true, true);
	}

	render() {
		const { validateResult, executeResult, queryResponseTitle } = this.props;
		const result = validateResult || executeResult;
		return (
			<div>
				{result ? (
					<Card css={main} title={<h2>{queryResponseTitle}</h2>}>
						<div data-cy="response-editor">
							<Monaco
								language="json"
								value={JSON.stringify(result, 0, 4)}
								theme="vs-dark"
								options={{
									cursorStyle: 'line',
									lineNumbersMinChars: 2,
									fontFamily: 'Monaco, monospace',
									fontSize: 14,
									padding: {
										top: 10,
										bottom: 10,
									},
									minimap: {
										enabled: false,
									},
									scrollBeyondLastLine: false,
								}}
								readOnly
								height="400px"
							/>
						</div>
					</Card>
				) : null}
			</div>
		);
	}
}

StoredQueryResponse.defaultProps = {
	validateResult: undefined,
	executeResult: undefined,
};

StoredQueryResponse.propTypes = {
	validateResult: PropTypes.object,
	executeResult: PropTypes.object,
	clearValidateExecute: PropTypes.func.isRequired,
	queryResponseTitle: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	validateResult: get(state, '$validateAppStoredQuery.results'),
	executeResult: get(state, '$executeAppStoredQuery.results'),
});
const mapDispatchToProps = (dispatch) => ({
	clearValidateExecute: (validate, execute) => dispatch(clearAppStoredQueries(validate, execute)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StoredQueryResponse);
