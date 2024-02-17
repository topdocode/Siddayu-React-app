import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';

const HomeBase = ({ navigation }) => {
    const { rememberMe } = useSelector(state => state.auth);

    useEffect(() => {
        if (!rememberMe) {
            navigation.replace('Login');
        }
        // No need for an else statement if you're returning from the if block
    }, [rememberMe, navigation]);

    // If rememberMe is true, render the component
    return rememberMe ? <Text>Login</Text> : null;
};

export default HomeBase;
