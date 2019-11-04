import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Modal } from 'antd';
import * as typeformEmbed from '@typeform/embed';
import { TYPE_FORM } from '../../constants';

class Unsubscribe extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = { typeFormStep: TYPE_FORM.UNLOADED };
	}

	embedTypescriptWidget = () => {
		this.setState({ typeFormStep: TYPE_FORM.LOADED });
		if (this.myRef.current) {
			typeformEmbed.makeWidget(
				this.myRef.current,
				'https://siddharth31.typeform.com/to/QEktta',
				{
					hideFooter: true,
					hideHeaders: true,
					opacity: 0,
					onSubmit: () => {
						this.setState({ typeFormStep: TYPE_FORM.SUBMITTED });
					},
				},
			);
		}
	};

	render() {
		const { loading, onCancel, deleteSubscription } = this.props;
		const { typeFormStep } = this.state;
		return (
			<Modal
				visible
				title="Unsubscribe from the current plan"
				onCancel={onCancel}
				footer={[
					<Button key="back" onClick={onCancel}>
						I{"'"}ve changed my mind
					</Button>,
					<Button
						loading={loading}
						key="submit"
						type="primary"
						onClick={
							typeFormStep === TYPE_FORM.UNLOADED
								? this.embedTypescriptWidget
								: deleteSubscription
						}
						disabled={typeFormStep === TYPE_FORM.LOADED}
					>
						{typeFormStep === TYPE_FORM.UNLOADED
							? 'Continue to Unsubscribe'
							: 'Unsubscribe'}
					</Button>,
				]}
				width={645}
				bodyStyle={{ height: typeFormStep === TYPE_FORM.LOADED && '600px' }}
			>
				<>
					{typeFormStep !== TYPE_FORM.SUBMITTED && (
						<div
							ref={this.myRef}
							style={
								typeFormStep === TYPE_FORM.LOADED
									? { width: '100%', height: '100%' }
									: null
							}
						/>
					)}
					{typeFormStep === TYPE_FORM.UNLOADED && (
						<p>
							We{"'"}re sorry to see you go. Are you sure you want to unsubscribe from
							the current plan? Canceling the subscription would make the dashboard
							GUI and Arc endpoints inaccessible within 24 hours.
							<br />
							<p style={{ fontSize: '14px' }}>
								You{"'"}ll be asked for a one question feedback survey.
							</p>
						</p>
					)}
					{typeFormStep === TYPE_FORM.SUBMITTED && (
						<p>
							Thanks for giving us feedback. We{"'"}ll keep in mind to make appbase.io
							better.
						</p>
					)}
				</>
			</Modal>
		);
	}
}

Unsubscribe.propTypes = {
	deleteSubscription: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	onCancel: PropTypes.func.isRequired,
};

export default Unsubscribe;
