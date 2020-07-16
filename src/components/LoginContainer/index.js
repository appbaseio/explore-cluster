import React from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';
import Flex from '../../batteries/components/shared/Flex';
import Logo from '../Logo';
import AppbaseUsers from '../AppbaseUsers';
import { main, footer } from './styles';

const LoginContainer = ({ children }) => (
	<React.Fragment>
		<Flex css={main}>
			<Flex className="content" flexDirection="column">
				<Logo width={200} />
				<h2 className="title">
					<mark>
						Give <span className="highlight">superpowers</span> to your
						&nbsp;ElasticSearch cluster!
					</mark>
				</h2>
				<p>
					appbase.io enables you to build the best relevant search experiences for web and
					mobile. You can deploy it on cloud or host it yourself.
				</p>
				<div className="signup_description">
					<ul className="signup_benefits">
						<li>
							<Icon type="check" className="icon" />
							<span>
								Deployment Flexibility: Our cloud, your cloud, local environment -
								works everywhere
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
								Browse data, edit schema, build relevant search visually, and apply
								query rules to extend the search engine.
							</span>
						</li>
						<li>
							<Icon type="check" className="icon" />
							<span>
								Get actionable analytics to understand and improve the search ROI
								impact on your business
							</span>
						</li>
						<li>
							<Icon type="check" className="icon" />
							<span>Setup access control for search that works out of the box</span>
						</li>
					</ul>
				</div>
			</Flex>
			<Flex flexDirection="column">{children}</Flex>
		</Flex>
		<div css={footer}>
			<AppbaseUsers title="You're in good company" />
		</div>
	</React.Fragment>
);

LoginContainer.propTypes = {
	children: PropTypes.node.isRequired,
};

export default LoginContainer;
