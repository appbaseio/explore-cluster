export const LayoutSwitch = () => {
	return `/** @jsxRuntime classic */
/** @jsx jsx */
import { Icon } from 'antd';
import { css, jsx } from '@emotion/core';
import { func } from "prop-types";

const viewSwitcherStyles = css\`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 30px;
    .icon-styles {
        padding: 5px;
        &: hover {
            cursor: pointer;
            color: #40a9ff;
        }
    }
\`;
export default function LayoutSwitch({ switchViewLayout }) {

    return (
        <div css={viewSwitcherStyles}>
            <Icon type="appstore" className="icon-styles" onClick={() => switchViewLayout('grid')}/>
            <Icon type="menu" className="icon-styles" onClick={() => switchViewLayout('list')} />
        </div>
    )
}

LayoutSwitch.propTypes = {
    switchViewLayout: func,
}

`;
};
