import React from 'react';
import { Input, Spin } from 'antd';
import PropTypes from 'prop-types';
import { validateQueryString } from '../../../../utils';

class ReplaceSearchQuery extends React.Component {
	constructor(props) {
		super(props);

		const { value } = props;

		this.state = {
			value,
			isVerifying: false,
		};
	}

	handleInput = (e) => {
		const {
			target: { value },
		} = e;
		this.setState({
			value,
		});
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
			} else {
				onChange(value, {
					hasError: true,
					description: 'Invalid query string',
				});
			}
		} catch (_e) {
			console.error(_e);
			onChange(value, {
				hasError: true,
				description: 'Invalid query string',
			});
		}
		this.toggleVerification();
	};

	render() {
		const { value, isVerifying } = this.state;
		return (
			<React.Fragment>
				<Spin spinning={isVerifying}>
					<Input
						placeholder="Enter query string"
						value={value}
						onChange={this.handleInput}
						onBlur={this.handleValidate}
					/>
				</Spin>
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
