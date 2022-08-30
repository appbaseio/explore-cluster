import { css } from 'react-emotion';

const checkbox = css`
	margin-left: 8px !important;
	text-align: left;
	margin-bottom: 12px !important;
	display: flex !important;

	.ant-checkbox {
		margin-top: 5px;
		height: 16px;
	}
`;

const main = css`
	min-height: 100vh;
	margin: 0 auto;
	max-width: 992px;
	> div {
		width: 100%;
		padding: 50px 0px;
	}
	.content {
		margin-right: 100px;
		.title {
			line-height: 1.8em;
			font-weight: 500;
			font-size: 30px;
			margin-top: 28px;
			margin-bottom: 14px;
			max-width: 350px;
		}
		p {
			margin: 0 0 14px;
			line-height: 1.8em;
		}
		.signup_description {
			h4 {
				margin-top: 14px;
				margin-bottom: 14px;
				line-height: 1.5;
				color: rgba(0, 0, 0, 0.86);
				font-size: 16px;
				text-transform: uppercase;
			}
			.signup_benefits {
				padding-left: 0;
				margin-bottom: 14px 0;
				.icon {
					color: blue;
					padding-right: 10px;
				}
				li {
					list-style: none;
					margin: 15px 0;
				}
			}
		}
	}
`;

const container = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background-image: linear-gradient(120deg, #eef5ff 0%, #c2e9fb 100%);
`;

const card = css`
	width: 90%;
	max-width: 450px;
	display: flex;
	flex-direction: column;
	text-align: center;
	border-radius: 4px;
	margin-top: 25px;
	padding: 20px;
	box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.15);

	h2 {
		font-weight: 400;
		color: #424242;
		font-size: 24px;
		margin-bottom: 25px;
	}

	a {
		margin: 4px 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		letter-spacing: 0.02rem;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		line-height: 2.45;
		height: 50px;
		border-radius: 6px;

		i {
			font-size: 18px;
			position: relative;
			top: 1px;
		}
	}
`;

const emailBtn = css`
	margin: 4px 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	letter-spacing: 0.02rem;
	font-size: 15px;
	font-weight: 700;
	cursor: pointer;
	line-height: 2.45;
	height: 50px;
	border-radius: 6px;

	i {
		font-size: 18px;
		position: relative;
		top: 1px;
	}
`;

const smallBtn = css`
	font-weight: 500 !important;
	height: auto !important;
	font-size: 14px !important;
	padding: 0 12px !important;
	margin: 4px 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	letter-spacing: 0.02rem;
	cursor: pointer;
	line-height: 2.45;
	border-radius: 6px;

	i {
		font-size: 18px;
		position: relative;
		top: 1px;
	}
`;

const inputStyles = css`
	margin: 5px 0;
	letter-spacing: 0.02rem;
	font-size: 15px;
`;

const githubBtn = css`
	color: #fff;
	background: rgb(22, 23, 26);

	&:hover,
	&:focus {
		background-color: #333;
		color: #fff;
		border-color: #666;
	}
`;

const googleBtn = css`
	color: #fff;
	background-color: rgb(234, 67, 53);

	&:hover,
	&:focus {
		background-color: rgb(245, 106, 94);
		color: #fff;
		border-color: #f7d2cf;
	}
`;

const gitlabBtn = css`
	color: #fff;
	background-color: rgb(85, 68, 136);

	&:hover,
	&:focus {
		background-color: rgb(64, 51, 104);
		color: #fff;
		border-color: #473281;
	}
`;

export {
	checkbox,
	smallBtn,
	main,
	container,
	card,
	githubBtn,
	googleBtn,
	gitlabBtn,
	emailBtn,
	inputStyles,
}; // eslint-disable-line
