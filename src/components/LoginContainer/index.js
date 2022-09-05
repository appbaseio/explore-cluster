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
						Give <span className="highlight">superpowers</span> to your Elasticsearch
						cluster!
					</h2>
					<p style={{ fontSize: 20, textAlign: 'left' }}>
						<a href="https://www.reactivesearch.io/">reactivesearch.io</a> enables you
						to build the best relevant search experiences for web and mobile. You can
						deploy it on cloud or host it yourself.
					</p>
					<div className="signup_description">
						<ul className="signup_benefits">
							<li>
								<Icon type="check" className="icon" />
								<span>
									Deployment Flexibility: Our cloud, your cloud, local environment
									- works everywhere
								</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span>
									Import JSON / CSV data or use our CLI for importing from your
									favorite data source
								</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span>
									Browse data, edit schema, build relevant search visually, and
									apply query rules to extend the search engine.
								</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span>
									Get actionable analytics to understand and improve the search
									ROI impact on your business
								</span>
							</li>
							<li>
								<Icon type="check" className="icon" />
								<span>
									Setup access control for search that works out of the box
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
