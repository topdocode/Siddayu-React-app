import { View, Text, TextInput, StyleSheet } from 'react-native'
import React, { useRef } from 'react'
import { colors } from '../../utils/color';

const FzTextInput = (props) => {
    const inputRef = useRef(null);

    const handleFocus = () => {
        inputRef.current.setNativeProps({
            borderColor: colors.primary,
        });
    };

    const handleBlur = () => {
        inputRef.current.setNativeProps({
            borderColor: 'gray',
        });
    };
    return (
        <TextInput ref={inputRef}
            style={[styles.input, props.style]}
            onFocus={handleFocus}
            onBlur={handleBlur} {...props} />

    )
}
const styles = StyleSheet.create({
    input: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        borderColor: 'gray',

    },
});

export default FzTextInput