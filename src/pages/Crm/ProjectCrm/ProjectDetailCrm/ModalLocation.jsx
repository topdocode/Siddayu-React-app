import { View, Text, Modal, FlatList, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import MapView, { Marker } from 'react-native-maps';
import Layout from '../../../../component/layout/Layout';
import Row from '../../../../component/Row/Row';
import { colors } from '../../../../utils/color';
import { CheckBox } from '@rneui/themed';
import { global_styles } from '../../../global_styles';
const ModalLocation = ({ locations, showModalLocation, toggleModelLocation, locationProject, onChange }) => {
    const [location, setLocation] = useState(locationProject?.id)
    try {
        return (
            <Modal
                visible={showModalLocation}
                animationType='slide'
                onRequestClose={toggleModelLocation}
                transparent

            >
                <View style={[{ paddingVertical: 20, },]} >
                    <FlatList
                        style={[{ padding: 20 },]}
                        // horizontal={true}
                        data={locations}
                        // snapToInterval={324}
                        decelerationRate={'fast'}
                        scrollEventThrottle={16}
                        snapToInterval={300}
                        renderItem={({ item }) => {
                            if (item?.latitude && item?.longitude) {
                                return (
                                    <View style={[{ padding: 20, backgroundColor: 'rgba(255,255,255,255)', }, global_styles.shadow]} >
                                        <View style={{ width: '100%', }} >
                                            {/* <Text>Choose Maps</Text> */}
                                            {/* {console.log(item)} */}
                                            <Row styles={{ backgroundColor: colors.borderColorSecond, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center' }} >
                                                <CheckBox
                                                    size={20}
                                                    containerStyle={{ backgroundColor: 'transparent', padding: 0 }}
                                                    checkedColor='#fff'
                                                    checkedIcon="dot-circle-o"
                                                    uncheckedIcon="circle-o"
                                                    uncheckedColor='#fff'
                                                    checked={locationProject?.id === item.id}
                                                    onPress={() => onChange(item)}
                                                />
                                                <Text style={{ color: 'white' }} > {item?.name}</Text>
                                            </Row>
                                            <MapView
                                                style={[styles.map, { width: '100%', height: 200 }]}
                                                // provider={PROVIDER_GOOGLE}
                                                initialRegion={{
                                                    latitude: typeof item?.latitude == 'string' ? parseFloat(item?.latitude) : item?.latitude,
                                                    longitude: typeof item?.longitude == 'string' ? parseFloat(item?.longitude) : item?.longitude,
                                                    latitudeDelta: 0.005,
                                                    longitudeDelta: 0.005,
                                                }}
                                            >
                                                <Marker
                                                    coordinate={{ latitude: typeof item?.latitude == 'string' ? parseFloat(item?.latitude) : item?.latitude, longitude: typeof item?.longitude == 'string' ? parseFloat(item?.longitude) : item?.longitude }}
                                                />
                                            </MapView>
                                        </View>
                                    </View>
                                )
                            }
                        }}
                    />
                </View>

            </Modal>
        )
    } catch (error) {
        console.log(error);
    }

}
const styles = StyleSheet.create({
    // map: {
    //     ...StyleSheet.absoluteFillObject
    // }
});

export default ModalLocation