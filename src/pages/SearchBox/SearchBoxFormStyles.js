import { Col, Row, Tooltip } from 'antd';
import styled from 'react-emotion';
import { IndexSwitcher } from './components/IndexSwitcher';
import { PipelineSwitcher } from './components/PipelineSwitcher';

export const FormTooltip = styled(Tooltip)`
	margin-left: 5px;
	color: #898989;
`;
FormTooltip.Text = styled.span`
	color: black;
`;
export const FormRow = styled(Row)`
	width: 100%;
	align-items: center;
`;
export const FormLabel = styled.span`
	font-weight: 500;
	color: black;
	font-size: 14px;
`;
export const EndpointRow = styled(FormRow)`
	width: 100%;
	margin: 1rem 0rem;
`;
export const EndpointCol = styled(Col)`
	padding-right: 1rem;
`;
export const EndpointInnerLabel = styled.div`
	margin: 0.5rem 0rem;
`;
export const StyledIndexSwitcher = styled(IndexSwitcher)`
	display: block;
	width: 100%;
	${({ error }) =>
		error ? 'border: 1px solid red; border-radius: 6px; margin-bottom: 2px;' : ''}
`;
export const StyledPipelineSwitcher = styled(PipelineSwitcher)`
	display: block;
	min-width: 300px;
	width: 100%;
	max-width: 800px;
	${({ error }) =>
		error ? 'border: 1px solid red; border-radius: 6px; margin-bottom: 2px;' : ''}
`;
