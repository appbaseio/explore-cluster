import { css } from 'react-emotion';

const hoverStyles = (themeType) => css`
	.show-on-hover {
		transition: all ease 0.2s;
		transform: scale(0);
		opacity: 0;
	}
	&:hover {
		.show-on-hover {
			transform: scale(1);
			opacity: 1;
		}
	}
	.directory-container {
		display: flex;
		justify-content: space-between;
		width: 100%;
		max-width: 145px;
	}
	.input-container {
		margin: 5px;
		width: auto;
	}
	.filename-container {
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sp-explorer {
		background-color: ${themeType === 'dark' ? 'rgb(21, 21, 21)' : '#f8f9fb'};
	}
`;

const searchFilesContainer = (themeType) => css`
	max-width: 210px;
	.result-stats {
		display: flex;
		justify-content: center;
	}
	.search-content {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #757678;
	}
	.sub-search-content {
		padding: 5px 0px 5px 0px;
		cursor: pointer;
		font-size: 12px;
		color: #757678;
	}
	.ant-tag {
		font-size: 10px;
		margin-right: 5px;
		background-color: ${themeType === 'dark' ? '#cccdce' : '#fafafa'};
	}
	.ant-collapse-header {
		padding: 5px 16px 0px 40px !important;
		color: #757678 !important;
	}
	.ant-collapse-borderless {
		background-color: ${themeType === 'dark' ? 'rgb(21, 21, 21)' : '#fafafa'};
	}
	.ant-collapse .ant-collapse-item .ant-collapse-item {
		color: ${themeType === 'dark' ? '#dfdfdf' : 'rgba(0, 0, 0, 0.85)'};
	}
	.padding {
		padding: 10px;
	}
	.cursor {
		cursor: pointer;
	}
`;

export { hoverStyles, searchFilesContainer };
