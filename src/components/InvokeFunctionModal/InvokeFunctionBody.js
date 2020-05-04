import React from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Skeleton } from 'antd';
import { values } from 'lodash';
import { modalHeading } from '../../pages/HomePage/styles';
import Ace from '../../batteries/components/SearchSandbox/containers/AceEditor';
import { FUNCTIONS } from '../../constants';
import InvokeResponse from './InvokeResponse';

function InvokeFunctionBody({
	invokeState,
	loading,
	onChange,
	onClick,
	responseData,
	status,
	time,
	validJSON,
	value,
}) {
	return (
		<>
			<Row>
				<h3 className={modalHeading} style={{ marginTop: 0 }}>
					Request Data
				</h3>
				<Ace
					mode="json"
					value={value}
					onChange={onChange}
					name="editor-JSON"
					fontSize={14}
					showPrintMargin
					style={{
						width: '100%',
						maxHeight: '300px',
					}}
					showGutter
					highlightActiveLine
					setOptions={{
						showLineNumbers: true,
						tabSize: 2,
					}}
					editorProps={{ $blockScrolling: true }}
				/>
			</Row>
			<Row style={{ marginTop: '16px' }}>
				<Button disabled={!validJSON || loading} onClick={onClick} type="primary">
					Invoke
				</Button>
			</Row>
			{loading ? (
				<Skeleton />
			) : (
				invokeState !== FUNCTIONS.NOT_INVOKED &&
				responseData && (
					<InvokeResponse status={status} time={time} responseData={responseData} />
				)
			)}
		</>
	);
}

InvokeFunctionBody.propTypes = {
	invokeState: PropTypes.oneOf(values(FUNCTIONS)).isRequired,
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	onClick: PropTypes.func,
	responseData: PropTypes.object,
	status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	time: PropTypes.number,
	validJSON: PropTypes.bool,
	value: PropTypes.string,
};

const noop = () => {};
InvokeFunctionBody.defaultProps = {
	loading: false,
	onChange: noop,
	onClick: noop,
	responseData: null,
	status: undefined,
	time: undefined,
	validJSON: false,
	value: undefined,
};

export default InvokeFunctionBody;
