import React from 'react';
import { DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Row, Button, Col } from 'antd';
import PropTypes from 'prop-types';
import { row, deleteRow } from './styles';
import { VIEWS } from '../../../constants/props';
import TypeDropdown from './TypeDropdown';

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
		const { children, field, path, onDelete, view, type, setMapping, usecase } = this.props;
		const { isCollapsed } = this.state;

		// when all the children are null don't render object header
		if (!children.filter((i) => i).length) {
			return null;
		}
		return (
			<Row className={row}>
				<Col xs={24}>
					<Row className={deleteRow} type="flex" justify="start">
						<Col>
							{isCollapsed ? (
								<UpOutlined
									style={{ marginRight: 15, marginTop: 8 }}
									onClick={this.toggleCollapse}
								/>
							) : (
								<DownOutlined
									style={{ marginRight: 15, marginTop: 8 }}
									onClick={this.toggleCollapse}
								/>
							)}
						</Col>
						<Col>
							<p>
								{field}
								<Button
									className="delete-btn"
									danger
									size="small"
									onClick={() => onDelete(path)}
								>
									<DeleteOutlined />{' '}
									{view === VIEWS.SCHEMA ? 'Remove field' : `Remove from ${view}`}
								</Button>
							</p>
						</Col>{' '}
						{view === VIEWS.SCHEMA && (
							<Col
								style={{
									marginLeft: 'auto',
									width: 'max-content',
									marginRight: '12px',
								}}
								data-cy={`data-type-${field}`}
							>
								<TypeDropdown
									value={type}
									usecase={usecase}
									onTypeChange={setMapping}
									path={path}
								/>
							</Col>
						)}
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

ObjectField.defaultProps = {
	view: VIEWS.SCHEMA,
};

ObjectField.propTypes = {
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
	field: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	onDelete: PropTypes.func.isRequired,
	view: PropTypes.string,
	setMapping: PropTypes.func.isRequired,
	type: PropTypes.string.isRequired,
	usecase: PropTypes.string.isRequired,
};
