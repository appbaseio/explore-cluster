import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useActiveCode, SandpackStack, FileTabs, useSandpack } from '@codesandbox/sandpack-react';
import '@codesandbox/sandpack-react/dist/index.css';
import { number, object, string } from 'prop-types';
import { css } from 'emotion';

const MonacoEditor = ({ iframeHeight, highlightLine, path }) => {
	const { code, updateCode } = useActiveCode();

	const editorRef = useRef(null);
	const { sandpack } = useSandpack();

	useEffect(() => {
		if (!editorRef.current) return;
		highlightLines();
	}, [highlightLine]);

	const highlightLines = () => {
		const { monaco, editor } = editorRef.current;
		if (path === highlightLine.path) {
			highlightLine.lines.forEach((line) => {
				// Highlight the selected line while searching in all files.
				const r = new monaco.Range(line, 1, line, 1);
				editor.deltaDecorations(
					[],
					[
						{
							range: r,
							options: {
								inlineClassName: css`
									background-color: #ffefcf;
								`,
								isWholeLine: line,
							},
						},
					],
				);
			});
		}
	};

	const handleEditorDidMount = (editor, monaco) => {
		editorRef.current = {
			editor,
			monaco,
		};

		highlightLines();

		const undo = editor.createContextKey('undo', false); // eslint-disable-line
		const redo = editor.createContextKey('redo', false); // eslint-disable-line
		editor.addAction({
			id: 'my-undo-id',
			label: 'Undo',
			keybindings: [
				// eslint-disable-next-line
				monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ,
				// eslint-disable-next-line
				monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ),
			],
			precondition: null,
			keybindingContext: null,
			contextMenuGroupId: 'navigation',
			contextMenuOrder: 1.5,
			run() {
				editor.trigger('', 'undo');
			},
		});

		editor.addAction({
			id: 'my-redo-id',
			label: 'Redo',
			keybindings: [
				// eslint-disable-next-line
				monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
				monaco.KeyMod.chord(
					// eslint-disable-next-line
					monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
				),
			],
			precondition: null,
			keybindingContext: null,
			contextMenuGroupId: 'navigation',
			contextMenuOrder: 1.5,
			run() {
				editor.trigger('', 'redo');
			},
		});
	};

	return (
		<SandpackStack customStyle={{ height: `${iframeHeight}px`, margin: 0 }}>
			<FileTabs showTabs showLineNumbers showInlineErrors wrapContent={false} closableTabs />
			<div style={{ flex: 1 }}>
				<Editor
					width="100%"
					height="100%"
					language="javascript"
					theme="light"
					key={sandpack.activePath}
					defaultValue={code}
					value={code}
					onChange={(value) => updateCode(value || '')}
					line={highlightLine.line}
					// beforeMount
					onMount={handleEditorDidMount}
					options={{
						minimap: {
							enabled: false,
						},
						overviewRulerLanes: 0,
						autoClosingBrackets: true,
						scrollBeyondLastLine: false,
						autoIndent: true,
						fontSize: 14,
						inlineSuggest: {
							enabled: true,
						},
						contextmenu: true,
					}}
				/>
			</div>
		</SandpackStack>
	);
};

MonacoEditor.propTypes = {
	iframeHeight: number.isRequired,
	highlightLine: object,
	path: string.isRequired,
};

MonacoEditor.defaultProps = {
	highlightLine: {
		line: 0,
		lines: [],
	},
};

export default MonacoEditor;
