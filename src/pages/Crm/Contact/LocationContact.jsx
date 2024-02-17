import { View, Text, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, { Marker } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ListItem, Avatar } from '@rneui/themed'
import ProjectCrmService from '../../../services/CRM/Project';
import Gap from '../../../component/Gap/Gap';
const LocationContact = () => {
    const navigation = useNavigation()
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMarker, setLoadingMarker] = useState(true)
    const [openFilter, setOpenFilter] = useState(false)
    const [currentPosition, setCurrentPosition] = useState({
        latitude: 37.78825, // Latitude default
        longitude: -122.4324, // Longitude default
        latitudeDelta: 100, // Delta values determine the zoom level
        longitudeDelta: 100,
    })
    const { authToken, user } = useSelector((state) => state.auth);
    const [checked, setChecked] = useState([])
    const [prospectPriority, setProspectPriority] = useState([])

    useEffect(() => {

        ProjectCrmService.getLocationContact(authToken, user?.client?.id, navigation).then((location) => {
            setLocations(location)
            console.log(location);
            setLoading(false)
        }).finally(() => setLoading(false))
    }, [])

    return (
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
    )
}

export default LocationContact