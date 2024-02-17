import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector } from 'react-redux';
import ProjectCrmService from '../../../services/CRM/Project';
import Layout from '../../../component/layout/Layout';
const LocationCustomer = () => {
    const navigation = useNavigation()
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPosition, setCurrentPosition] = useState({
        latitude: 37.78825, // Latitude default
        longitude: -122.4324, // Longitude default
        latitudeDelta: 100, // Delta values determine the zoom level
        longitudeDelta: 100,
    })
    const { authToken, user } = useSelector((state) => state.auth);

    useEffect(() => {

        ProjectCrmService.getLocationCustomer(authToken, user?.client?.id, navigation).then((location) => {
            setLocations(location);
            setLoading(false)
        }).finally(() => setLoading(false))
    }, [])

    return (
        <Layout>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginHorizontal: 20 }} >Customer Location</Text>
            <View style={{ flex: 1 }} >
                {loading == false && (
                    <MapView
                        style={{ width: '100%', flex: 1 }}
                        initialRegion={{
                            latitude: currentPosition.latitude, // Latitude default
                            longitude: currentPosition.longitude, // Longitude default
                            latitudeDelta: 100, // Delta values determine the zoom level
                            longitudeDelta: 100,
                        }}
                        region={{
                            latitude: parseFloat(locations[0]?.latitude), // Latitude default
                            longitude: parseFloat(locations[0]?.longitude), // Longitude default
                            latitudeDelta: 100, // Delta values determine the zoom level
                            longitudeDelta: 100,
                        }}

                    >
                        {locations.length > 0 && locations.map((location, index) => (
                            <Marker
                                key={index}
                                title={`${location.address}`}
                                coordinate={{ latitude: parseFloat(location.latitude), longitude: parseFloat(location.longitude) }}
                            // onDragEnd={(e) => this.setState({ x: e.nativeEvent.coordinate })}
                            />
                        ))}
                    </MapView>
                )}
            </View>
        </Layout>
    )
}

export default LocationCustomer