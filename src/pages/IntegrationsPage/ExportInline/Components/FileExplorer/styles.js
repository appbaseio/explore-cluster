import { css } from 'react-emotion';

const hoverStyles = css`
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
	}
`;

const searchFilesContainer = css`
	max-width: 210px;
	.result-stats {
		display: flex;
		justify-content: center;
	}
	.search-content {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sub-search-content {
		padding: 5px 0px 5px 0px;
		cursor: pointer;
		font-size: 12px;
	}
	.ant-tag {
		font-size: 10px;
		margin-right: 5px;
	}
	.ant-collapse-header {
		padding: 5px 16px 0px 40px !important;
	}
`;

export { hoverStyles, searchFilesContainer };
