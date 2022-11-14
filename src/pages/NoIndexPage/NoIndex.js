import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BookOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { container } from './styles';
import CreateAppModal from '../HomePage/CreateAppModal';

function NoIndex({ view }) {
	const [showModal, setShowModal] = useState(false);

	function handleChange() {
		setShowModal(!showModal);
	}
	return (
		<div css={container}>
			<h3 style={{ marginBottom: 30, textAlign: 'center' }}>
				{`You need to have at least one search index before you can use ${view} view.`}
			</h3>
			<div className="button-container">
				<Button
					size="large"
					type="primary"
					// block
					onClick={() => handleChange()}
					data-cy="initialize-new-index-creation"
				>
					<PlusOutlined /> Create a new index
				</Button>
				<Button size="large">
					<Link to="/tutorial">
						Interactive Tutorial <BookOutlined />
					</Link>
				</Button>
			</div>
			<CreateAppModal
				// type="no-index"
				handleModal={() => handleChange()}
				showModal={showModal}
			/>
		</div>
	);
}

NoIndex.propTypes = {
	view: PropTypes.string,
};

NoIndex.defaultProps = {
	view: 'this',
};

export default NoIndex;
