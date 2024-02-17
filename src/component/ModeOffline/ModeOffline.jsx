import { View, Text, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import NetInfo from "@react-native-community/netinfo";
import { useDispatch, useSelector } from 'react-redux';
import { saveOnline, sendRequest } from '../../redux/features/offline/offlineSlice';
import { sendRequestStartStop } from '../../redux/features/offline/startStop';
import Gap from '../Gap/Gap';
const ModeOffline = ({ gapHeight = 0 }) => {
    const { online } = useSelector((state) => state.offlineRedux);
    if (online == false) {
        return (
            <>
                <View style={[styles.offlineContainer]}>
                    <Text style={styles.offlineText}>No Internet Connection</Text>
                </View>
                {gapHeight > 0 && <Gap height={gapHeight} />}
            </>
        )
    } else {
        return null;
    }



}

export default ModeOffline

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        position: 'absolute',
        zIndex: 1
    },
    offlineText: {
        color: '#fff'
    }
});