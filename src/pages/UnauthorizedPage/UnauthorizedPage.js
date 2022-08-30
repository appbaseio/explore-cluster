import React from 'react';
import PropTypes from 'prop-types';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const UnauthorizedPage = ({ view }) => {
	return (
		<Result
			status="404"
			title="401 Unauthorized"
			subTitle={
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<div style={{ width: '60%' }}>
						You don&apos;t have access to the {view} view. You can contact the
						reactivesearch.io admin to grant you access to view this. Read the{' '}
						<a
							href="https://docs.appbase.io/docs/security/user-management/"
							target="_blank"
							rel="noreferrer"
						>
							user management doc{' '}
						</a>
						to learn more .
					</div>
				</div>
			}
			extra={
				<Link to="/">
					<Button type="primary">Back Home</Button>
				</Link>
			}
		/>
	);
};

UnauthorizedPage.defaultProps = {
	view: '',
};

UnauthorizedPage.propTypes = {
	view: PropTypes.string,
};

export default UnauthorizedPage;
