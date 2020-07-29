import React from 'react';
import PropTypes from 'prop-types';
import { children as childrenProp } from '../../../../utils/prop-types';

class Expand extends React.Component {
	state = { collapsed: false, hasOverflow: false };

	currentRef = React.createRef();

	componentDidMount() {
		if (this.currentRef && this.currentRef.current) {
			const currentHeight = this.currentRef.current.getBoundingClientRect().height;

			if (currentHeight > 200) {
				this.setState({
					hasOverflow: true,
					collapsed: true,
				});
			}
		}
	}

	toggleCollapse = () => {
		this.setState((state) => ({
			collapsed: !state.collapsed,
		}));
	};

	render() {
		const { className, children } = this.props;
		const { hasOverflow, collapsed } = this.state;
		return (
			<React.Fragment>
				<div
					ref={this.currentRef}
					className={`${className} ${hasOverflow && collapsed ? 'collapse' : ''}`}
				>
					{children}
				</div>
				{hasOverflow ? (
					<div className="expand-button-container">
						<button type="button" onClick={this.toggleCollapse}>
							{collapsed ? 'Show more...' : 'Collapse'}
						</button>
					</div>
				) : null}
			</React.Fragment>
		);
	}
}

Expand.propTypes = {
	className: PropTypes.string,
	children: childrenProp.isRequired,
};

Expand.defaultProps = {
	className: '',
};

export default Expand;
