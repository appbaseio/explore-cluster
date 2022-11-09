import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import * as Sentry from '@sentry/browser';

class ErrorPage extends React.Component {
	state = {
		error: false,
	};

	eventId = null;

	componentDidMount() {
		window.addEventListener('error', () => {
			const errorId = Sentry.lastEventId();
			this.eventId = errorId;
		});
	}

	componentDidUpdate(prevProps) {
		const {
			location: { pathname }, // eslint-disable-line
		} = this.props;
		if (get(prevProps, 'location.pathname') !== pathname) {
			// eslint-disable-next-line
			this.setState({
				error: false,
			});
		}
	}

	componentDidCatch(error, errorInfo) {
		this.setState({
			error: true,
		});
		Sentry.withScope((scope) => {
			scope.setExtras(errorInfo);
			Sentry.captureException(error);
		});
	}

	render() {
		const { error } = this.state;
		const { children, user } = this.props; // eslint-disable-line
		return error ? (
			<section
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					height: '80vh',
				}}
			>
				<Icon type="frown" theme="outlined" style={{ fontSize: 55, marginBottom: 10 }} />
				<h2>Something went wrong!</h2>
				<p>Our team has been notified about this.</p>
				<section
					style={{
						display: 'flex',
					}}
				>
					<Button href={user ? '/' : '/login'} size="large" type="primary">
						<Icon type={user ? 'home' : 'left'} />
						Back to {user ? 'Home' : 'Login'}
					</Button>
					<Button
						size="large"
						type="danger"
						style={{ marginLeft: '8' }}
						onClick={() => {
							Sentry.showReportDialog();
						}}
					>
						<Icon type="info-circle" />
						Report this problem
					</Button>
				</section>
			</section>
		) : (
			children
		);
	}
}

ErrorPage.propTypes = {
	location: PropTypes.object.isRequired,
};

const mapStateToProps = ({ user }) => ({
	user,
});

export default connect(mapStateToProps, null)(ErrorPage);
