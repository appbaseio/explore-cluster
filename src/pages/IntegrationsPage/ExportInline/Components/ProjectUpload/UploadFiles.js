import React, { useRef, useEffect } from 'react';
import { fromEvent } from 'file-selector';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { uploadStyles } from './styles';
import { excludedArr } from '../../../utils/sandpack-generator';

const UploadFiles = ({ setErrMsg, setIsFilesFetching, setFileContent, setIsLoading }) => {
	const inputRef = useRef(null);

	useEffect(() => {
		init();
	}, []);

	const init = () => {
		const uploadInput = document.getElementById('file-upload');
		if (uploadInput) uploadInput.addEventListener('change', handleFileSelect, false);
	};

	const isFileExists = (path, arr) => {
		return arr.includes(path);
	};

	const excludeFile = (path) => {
		if (excludedArr.some((v) => path.includes(v))) {
			return true;
		}
		return false;
	};

	const handleValidation = (fileContent) => {
		const filePathsArr = Object.keys(fileContent);
		try {
			if (
				// Validation for existnce of mandatory files
				isFileExists('src/utils/constants.js', filePathsArr) &&
				isFileExists('reactivesearch-manifest.json', filePathsArr) &&
				isFileExists('package.json', filePathsArr)
			) {
				// Validation for manifest file
				const manifestFileContent = fileContent['reactivesearch-manifest.json'];
				JSON.parse(manifestFileContent);
				setErrMsg('Validated');
			} else {
				setErrMsg(
					'The files src/utils/constants.js, package.json and reactivesearch-manifest.json are mandatory to upload a project',
				);
			}
		} catch (err) {
			setErrMsg('reactivesearch-manifest.json is not a valid json');
			console.error(err);
		}
		setIsFilesFetching(false);
	};

	const handleFileSelect = async (event) => {
		setErrMsg('');
		setIsFilesFetching(true);
		const files = await fromEvent(event);
		const fileContent = {};
		for (let i = 0; i < files.length; i += 1) {
			const file = files[i];
			if (file.path && !excludeFile(file.path)) {
				const arr = file.path.split('/');
				arr.shift();
				const filePath = arr.join('/');
				// eslint-disable-next-line no-await-in-loop
				fileContent[filePath] = await file.text();
			}
		}
		handleValidation(fileContent);
		setFileContent(fileContent);
	};

	return (
		<div className={uploadStyles}>
			<p>
				Upload project will load your project contents (multiple folders, files) into the
				code editor
			</p>
			<label
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
				role="button"
				tabIndex={0}
				className="custom-file-upload"
				htmlFor="file-upload"
				onClick={() => {
					setErrMsg('');
					setIsFilesFetching(true);
					setIsLoading(false);
				}}
			>
				<input ref={inputRef} type="file" webkitdirectory="true" id="file-upload" />
				<Icon type="upload" /> Browse Files
			</label>
		</div>
	);
};

UploadFiles.propTypes = {
	setErrMsg: PropTypes.func,
	setFileContent: PropTypes.func,
	setIsFilesFetching: PropTypes.func,
	setIsLoading: PropTypes.func,
};

UploadFiles.defaultProps = {
	setErrMsg: () => {},
	setFileContent: () => {},
	setIsFilesFetching: () => {},
	setIsLoading: () => {},
};

export default UploadFiles;
