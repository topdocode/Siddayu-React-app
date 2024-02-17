import { Button } from '@rneui/themed';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Row from '../Row/Row';
import Icon from 'react-native-vector-icons/dist/AntDesign';

const DropDownSelectMultiple = ({ dataOptions, setValueSelected, valueSelected, fullWidth = false }) => {
    const data = dataOptions;

    const [selectedOptions, setSelectedOptions] = useState(valueSelected ?? []);

    const handleSelectOption = (option) => {
        const updatedOptions = [...selectedOptions];

        if (selectedOptions.some((item) => item.name === option.name)) {
            // If the option is already selected, remove it from the list
            const index = selectedOptions.findIndex((item) => item.name === option.name);
            updatedOptions.splice(index, 1);
        } else {
            // If the option is not selected, add it to the list
            updatedOptions.push(option);
        }

        setSelectedOptions(updatedOptions);
        setValueSelected(updatedOptions);
    };

    const renderButtonText = () => {
        return 'select'
    };

    const renderRow = (option, index, isSelected) => {
        return (
            <View style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}>
                <Text style={styles.dropdownItemText}>{option.name}</Text>
                {/* {isSelected && <Text style={styles.selectedMarker}>✓</Text>} */}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ModalDropdown
                options={data}
                style={styles.dropdown(fullWidth)}
                textStyle={styles.dropdownText}
                dropdownStyle={styles.dropdownContainer}
                dropdownTextStyle={styles.dropdownItemText}
                dropdownTextHighlightStyle={styles.dropdownItemTextHighlighted}
                renderButtonText={renderButtonText}
                renderRow={renderRow}
                onSelect={(index, option) => handleSelectOption(option)}
                multipleSelect={true}
                saveScrollPosition={false}
            />
            {/* <Text style={styles.selectedOptionsText}>
                {selectedOptions.map((option) => option.name).join(', ')}
            </Text> */}
            <Row styles={{ columnGap: 3, flexWrap: 'wrap', maxWidth: '90%', rowGap: 3 }} >
                {selectedOptions.map((option,) => {
                    return (
                        <View key={option.id} style={{ position: 'relative' }} >
                            <Icon name='close' style={{ position: 'absolute', top: -2, right: -4 }} size={8} />
                            <Button onPress={() => handleSelectOption(option)} titleStyle={{ fontSize: 12, color: option.color }} size='sm' containerStyle={{ padding: 0 }} buttonStyle={{ padding: 0, borderColor: option.color }} type='outline' >{option.name}</Button>
                        </View>
                    )
                })}
            </Row>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    dropdown: (fullWidth) => ({
        width: fullWidth ? '100%' : 200,
        height: fullWidth ? 40 : 'auto',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        padding: 2,
        marginBottom: 5,
        justifyContent: 'center',
    }),
    dropdownText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    dropdownContainer: {
        width: 200,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        backgroundColor: '#FFF',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    dropdownItemSelected: {
        backgroundColor: '#e6e6e6',
    },
    dropdownItemText: {
        fontSize: 12,
        color: '#333',
        flex: 1,
    },
    dropdownItemTextHighlighted: {
        color: 'blue',
    },
    selectedMarker: {
        color: 'green',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    selectedOptionsText: {
        fontSize: 12,
        // fontWeight: 'bold',
        color: '#333',
        maxWidth: '90%'
    },
});


export default DropDownSelectMultiple;
