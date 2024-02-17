import React, { FC, ReactElement, useRef, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Ionicons';

// interface Props {
//     label: string;
//     data: Array<{ label: string; value: string }>;
//     onSelect: (item: { label: string; value: string }) => void;
// }

const Dropdown = ({ label, data, onSelect, style }) => {
    const DropdownButton = useRef();
    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState(undefined);
    const [dropdownTop, setDropdownTop] = useState(0);

    const toggleDropdown = () => {
        visible ? setVisible(false) : openDropdown();
    };

    const openDropdown = () => {
        DropdownButton.current.measure((_fx, _fy, _w, h, _px, py) => {
            setDropdownTop(py + h);
        });
        setVisible(true);
    };

    const onItemPress = (item) => {
        setSelected(item);
        onSelect(item);
        setVisible(false);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => onItemPress(item)}>
            <Text>{item.label}</Text>
        </TouchableOpacity>
    );

    const renderDropdown = () => {
        return (
            <Modal visible={visible} transparent animationType="none">
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={() => setVisible(false)}
                >
                    <View style={[styles.dropdown, { top: dropdownTop }]}>
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    return (
        <TouchableOpacity
            ref={DropdownButton}
            style={styles.button(style)}
            onPress={toggleDropdown}
        >
            {renderDropdown()}
            <Text style={styles.buttonText}>
                {(!!selected && selected.label) || label}
            </Text>
            <Icon style={styles.icon} type="font-awesome" name="chevron-down" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: (style) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: style?.backgroundColor ?? '#efefef',
        height: style?.height ?? 'auto',
        width: style?.width ?? 'auto',
        zIndex: 1,
        position: 'relative',
        justifyContent: 'center'
    }),
    buttonText: {
        flex: 1,
        textAlign: 'center',
    },
    icon: {
        marginRight: 10,
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: '#fff',
        width: '100%',
        shadowColor: '#000000',
        shadowRadius: 4,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.5,
        height: '100%',
        marginHorizontal: 20
    },
    overlay: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 20
    },
    item: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: 0.2,
    },
});

export default Dropdown;