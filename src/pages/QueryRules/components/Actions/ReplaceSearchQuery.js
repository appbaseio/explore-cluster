import React from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import { validateQueryString } from '../../../../utils';

class ReplaceSearchQuery extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isVerifying: false,
			isValid: false,
			value: props.value,
		};
	}

	handleInput = (e) => {
		const {
			target: { value },
		} = e;
		this.setState({
			value,
		});
		this.handleValidate(e);
	};

	toggleVerification = () => {
		this.setState((prevState) => ({
			isVerifying: !prevState.isVerifying,
		}));
	};

	handleValidate = async (e) => {
		const {
			target: { value },
		} = e;
		const { onChange } = this.props;
		if (!value) {
			onChange(value, {
				hasError: true,
				description: 'Please enter query string',
			});
			return;
		}
		this.toggleVerification();
		try {
			const queryStringResponse = await validateQueryString(value);
			if (queryStringResponse.valid) {
				onChange(value);
				this.setState({
					isValid: true,
				});
			} else {
				onChange(value, {
					hasError: true,
					description: 'Invalid query string',
				});
				this.setState({
					isValid: false,
				});
			}
		} catch (_e) {
			console.error(_e);
			this.setState({
				isValid: false,
			});
			onChange(value, {
				hasError: true,
				description: 'Invalid query string',
			});
		}
		this.toggleVerification();
	};

	render() {
		const { value, isVerifying, isValid } = this.state;
		return (
			<React.Fragment>
				{value && !isVerifying && isValid ? (
					<span
						style={{
							color: '#1890ff',
							fontSize: 13,
							marginBottom: 8,
							display: 'inline-block',
						}}
					>
						Query string is valid!
					</span>
				) : null}
				{isVerifying ? (
					<span style={{ marginBottom: 8, fontSize: 13, display: 'inline-block' }}>
						Verifying query string!
					</span>
				) : null}
				<Input placeholder="Enter query string" value={value} onChange={this.handleInput} />
			</React.Fragment>
		);
	}
}

ReplaceSearchQuery.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

ReplaceSearchQuery.defaultProps = {
	value: '',
};

export default ReplaceSearchQuery;
