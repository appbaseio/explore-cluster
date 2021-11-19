import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { FieldGroup } from 'react-reactive-form';
import InputElement from '../../components/InputElement';
import { accessControlMessages as Messages } from '../../utils/messages';

const modal = css`
	.error {
		color: tomato;
		padding: 5px 0;
	}
	.input-error {
		border-color: tomato;
	}
`;

const PreferenceForm = ({ control, isLoading, handleSaveTemplate }) => {
	return (
		<FieldGroup
			control={control}
			strict={false}
			render={(
				{ pristine, invalid: invalidForm }, // eslint-disable-line
			) => (
				<div css={modal}>
					<InputElement
						name="syncInterval"
						label="Sync Interval"
						toolTipMessage={Messages.syncInterval}
						inputProps={{
							style: {
								width: '200px',
								float: 'right',
							},
							addonAfter: 'Seconds',
						}}
					/>
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							padding: 0,
							background: 'white',
						}}
					>
						<Button
							onClick={handleSaveTemplate}
							size="large"
							type="primary"
							loading={isLoading}
							disabled={isLoading || invalidForm || pristine}
							// style={{ padding: 0 }}
						>
							Save
						</Button>
					</div>
				</div>
			)}
		/>
	);
};

PreferenceForm.propTypes = {
	control: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	handleSaveTemplate: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$saveSyncPreferences.isFetching', false),
});

export default connect(mapStateToProps, null)(PreferenceForm);
