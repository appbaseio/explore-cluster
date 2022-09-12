import React from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';
import Flex from '../../batteries/components/shared/Flex';
import AppbaseUsers from '../AppbaseUsers';
import { main, footer } from './styles';

const backgroundUrlImage = require('../../../static/images/Herobg.png');

const LoginContainer = ({ children }) => {
	return (
		<React.Fragment>
			<Flex css={main}>
				<Flex className="content left-container" flexDirection="column">
					<h2 className="title">
						<span className="highlight">Supercharge</span> your search
					</h2>
					<p style={{ fontSize: 20, textAlign: 'left' }}>
						Build, collaborate and ship search UIs with{' '}
						<a href="https://www.reactivesearch.io/">ReactiveSearch</a> 10x faster
					</p>
					<div className="signup_description">
						<ul className="signup_benefits">
							<li>
								<Icon type="check" className="icon" />
								<span>Author search UIs with point and click</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span>Extend search UIs with cloud IDE</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span role="img" aria-label="emoji">
									Configure 🔐 access controls and 👨🏼 end-user authentication
								</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span role="img" aria-label="emoji">
									Deploy on the 🌐 global edge with your domain in one click
								</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span>
									Out of the box analytics and insights for your deployed search
									UI
								</span>
							</li>
						</ul>
					</div>
				</Flex>
				<Flex
					flexDirection="column"
					style={{
						backgroundImage: `url(${backgroundUrlImage})`,
						justifyContent: 'space-around',
						alignItems: 'center',
						height: '100vh',
					}}
				>
					{children}
					<div css={footer}>
						<AppbaseUsers title="You're in good company" />
					</div>
				</Flex>
			</Flex>
		</React.Fragment>
	);
};

LoginContainer.propTypes = {
	children: PropTypes.node.isRequired,
};

export default LoginContainer;
