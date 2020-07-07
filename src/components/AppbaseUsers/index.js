import React from 'react';
import { css, cx } from 'react-emotion';
import { string, object } from 'prop-types';
import { media, mediaKey } from '../../utils/media';

const styles = css`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
	img {
		max-width: 30%;
		margin: 10px;
		${media.medium(css`
			max-width: 30%;
			margin: 30px 5px;
		`)};
	}
`;

const headingCls = css({
	textAlign: 'center',
	paddingTop: 10,
	fontSize: '1.7em',
	fontWeight: 500,
	maxWidth: '900px',
	color: '#232E44',
	[mediaKey.medium]: {
		fontSize: '1.375rem',
	},
});

const AppbaseUsers = ({ className, style, title, imageStyle }) => (
	<React.Fragment>
		{title && <h2 css={headingCls}>{title}</h2>}
		<div className={cx(styles, className)} style={style}>
			<img src="/static/images/testimonials/aerial.png" style={imageStyle} alt="Aerial" />
			<img src="/static/images/testimonials/kwiat.png" style={imageStyle} alt="Kwiat" />
			<img src="/static/images/testimonials/inquisit.png" style={imageStyle} alt="Inquisit" />
			<img src="/static/images/testimonials/lyearn.png" style={imageStyle} alt="Lyearn" />
			<img
				src="/static/images/testimonials/shopelect.png"
				style={imageStyle}
				alt="Shopelect"
			/>
			<img src="/static/images/testimonials/rumbleon.png" style={imageStyle} alt="Rumbleon" />
			<img
				src="/static/images/testimonials/munivisor.png"
				style={imageStyle}
				alt="Munivisor"
			/>
		</div>
	</React.Fragment>
);

AppbaseUsers.propTypes = {
	className: string,
	style: object,
	title: string.isRequired,
	imageStyle: object,
};

AppbaseUsers.defaultProps = {
	className: '',
	style: {},
	imageStyle: {},
};

export default AppbaseUsers;
