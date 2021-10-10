import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import ReviewAndSave from './ReviewAndSave';

const Footer = ({originalData, tab, changedData}) => {

    const [oldObj, setOldObj] =  useState({
        popularSuggestions: {},
        recentSuggestions: {},
        indexSuggestions: {},
    });
    const [newObj, setNewObj] = useState({
        popularSuggestions: {},
        recentSuggestions: {},
        indexSuggestions: {},
    });

    useEffect(() => {
        const oldData = changeOriginalData();
        setOldObj({...oldData});
        const newData = changeNewData();
        setNewObj({...newData});
    })

    useEffect(() => {
        const data = changeNewData();
        setNewObj({ ...data });
    }, [changedData]);

    function changeOriginalData() {
        const newOldObj = {...oldObj}
        if(tab === 'popular-suggestions') {
            newOldObj.popularSuggestions = originalData;
        } else if(tab === 'recent-suggestions') {
            newOldObj.recentSuggestions = originalData;
        } else {
            newOldObj.indexSuggestions = originalData;
        }
        return { ...newOldObj };
    }

    function changeNewData() {
        const setObj = {...newObj}
        if(tab === 'popular-suggestions') {
            setObj.popularSuggestions = changedData;
        } else if(tab === 'recent-suggestions') {
            setObj.recentSuggestions = changedData;
        } else {
            setObj.indexSuggestions = changedData;
        }
        return { ...setObj };
    }

    return (
        <div>
            <ReviewAndSave oldData={oldObj} newData={newObj}/>
        </div>
    )
}

Footer.propTypes = {
    originalData: PropTypes.object,
    tab: PropTypes.string.isRequired,
    changedData: PropTypes.object.isRequired,
};

Footer.defaultProps = {
    originalData: {
        popularSuggestions: {},
        recentSuggestions: {},
        indexSuggestions: {},
    }
}


export default Footer;
