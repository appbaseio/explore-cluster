import React from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';
import Flex from '../../batteries/components/shared/Flex';
import Logo from '../Logo';
import AppbaseUsers from '../AppbaseUsers';
import { main } from './styles';

const LoginContainer = ({ children }) => (
	<React.Fragment>
		<Flex css={main}>
			<Flex className="content" flexDirection="column">
				<Logo type="black" width={200} />
				<h2 className="title">
					Try Arc today to give superpowers to your ElasticSearch cluster.
				</h2>
				<p>
					Arc helps you with building the best search experience while you focus on
					serving your users!
				</p>
				<div className="signup_description">
					<h4>
						Arc can be used with appbase.io clusters or your own ElasticSearch cluster.
						See installation guide here.
					</h4>
					<ul className="signup_benefits">
						<li>
							<Icon type="check" className="icon" />
							Deployment Flexibility: Our cloud, your cloud, local environment - works
							everywhere
						</li>
						<li>
							<Icon type="check" className="icon" />
							Import JSON / CSV data or use our CLI for importing from your favorite
							data source
						</li>
						<li>
							<Icon type="check" className="icon" />
							Browse data, edit mappings, build search visually, and create query
							rules
						</li>
						<li>
							<Icon type="check" className="icon" />
							Get actionable analytics to improve content and increase your search ROI
						</li>
						<li>
							<Icon type="check" className="icon" />
							Get best-in-class security with read/write permissions, granular ACLs
							and more
						</li>
					</ul>
				</div>
				<AppbaseUsers title="You're in good company" />
			</Flex>
			<Flex flexDirection="column">{children}</Flex>
		</Flex>
	</React.Fragment>
);

LoginContainer.propTypes = {
	children: PropTypes.node.isRequired,
};

export default LoginContainer;
