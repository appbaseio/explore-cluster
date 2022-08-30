import React, { useState } from "react";
import { css } from "emotion";

const bannerStyles = css`
    .announcement-banner {
        padding: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        height: 40px;
        background: #fff;
        position: fixed;
        top: 0px;
        left: 0px;
        right: 0px;
        z-index: 999;
        .link-container {
            color: inherit;
            text-decoration: none;
            &: hover {
                color: #1890ff;
            }
        }
        .close-icon {
            position: absolute;
            right: 30px;
            cursor: pointer;
        }
    }
`
const AnnouncementBanner = ({showBanner, setShowBanner}) => {

    return (
        <div css={bannerStyles}>
            {showBanner ? (
                <div className='announcement-banner'>
                    appbase.io is now reactivesearch.io.&nbsp;
                    <a href="https://blog.reactivesearch.io/appbase-io-announcement" target='_blank'>&nbsp;Read the announcement</a>
                    <img
                        src="/static/images/close.svg"
                        width={20}
                        alt="close-icon"
                        className='close-icon'
                        onClick={() => {
                            localStorage.setItem('announcementBanner', 'false');
                            setShowBanner(false);
                        }}
                    />
                </div>
            ) : null }
        </div>
    )
}

export default AnnouncementBanner;
