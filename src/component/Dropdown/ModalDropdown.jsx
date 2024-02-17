import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { colors } from '../../utils/color';

const ModalDropdownCustom = ({ dataOptions, setValueSelected, valueSelected, styleDropdown = {}, width = 200, height }) => {
    try {
        const [selectedOption, setSelectedOption] = useState(valueSelected);
        const handleSelectOption = (index) => {
            setSelectedOption(dataOptions[index]);
            setValueSelected(dataOptions[index]);
            // return option.name
        };


        return (
            <View style={[styles.container]}>
                <ModalDropdown
                    options={dataOptions.map(item => item.name)}
                    style={[styles.dropdown(width, height), styleDropdown]}
                    textStyle={styles.dropdownText}
                    dropdownStyle={styles.dropdownContainer(width ?? null,)}
                    dropdownTextStyle={styles.dropdownItemText}
                    dropdownTextHighlightStyle={styles.dropdownItemTextHighlighted}
                    // renderRow={renderRow}
                    // renderButtonText={() => selectedOption?.name} // Menggunakan selectedOption untuk menampilkan nilai terpilih
                    onSelect={(index, option) => handleSelectOption(index)}
                    defaultValue={selectedOption?.name}
                // saveScrollPosition={true}
                // showSearch={true}

                />
            </View>

        );
    } catch (error) {
        console.log(error);
        return <Text>Error</Text>
    }

};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: 'red'
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    dropdown: (width = 200, height) => ({
        width: width,
        height: height ?? 30,
        maxWidth: width,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        padding: 2,
        marginBottom: 5,
        justifyContent: 'center'
    }),
    dropdownText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    dropdownContainer: (width = 200) => ({
        // width: width,
        maxWidth: '80%',
        height: 'auto',
        maxHeight: 200,
        minWidth: 150,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        backgroundColor: '#FFF',
    }),
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
        color: colors.textColorSecond,
    },
    selectedMarker: {
        color: 'green',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    selectedOptionsText: {
        fontSize: 12,
        color: '#333',
        maxWidth: '90%'
    },
});

export default ModalDropdownCustom;
