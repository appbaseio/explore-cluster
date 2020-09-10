import React from 'react';
import { Row, Button, Col, Icon } from 'antd';
import PropTypes from 'prop-types';
import { row, deleteRow } from './styles';

class ObjectField extends React.Component {
	state = {
		isCollapsed: false,
	};

	toggleCollapse = () => {
		this.setState((state) => ({
			isCollapsed: !state.isCollapsed,
		}));
	};

	render() {
		const { children, field, path, onDelete } = this.props;
		const { isCollapsed } = this.state;
		return (
			<Row className={row}>
				<Col xs={24}>
					<Row className={deleteRow} type="flex" justify="space-between">
						<Col>
							<p>
								{field}
								<Button
									className="delete-btn"
									type="danger"
									size="small"
									onClick={() => onDelete(path)}
								>
									<Icon type="delete" /> Delete
								</Button>
							</p>
						</Col>
						<Col>
							<Icon
								style={{ marginRight: 15 }}
								type={isCollapsed ? 'up' : 'down'}
								onClick={this.toggleCollapse}
							/>
						</Col>
					</Row>
				</Col>

				<Col
					style={{
						height: isCollapsed ? 0 : 'auto',
						overflow: 'hidden',
						paddingTop: isCollapsed ? 0 : 8,
						minHeight: 0,
					}}
					xs={24}
				>
					{children}
				</Col>
			</Row>
		);
	}
}

export default ObjectField;

ObjectField.propTypes = {
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
	field: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	onDelete: PropTypes.func.isRequired,
};
