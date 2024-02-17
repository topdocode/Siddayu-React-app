import { View, Text, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, { Marker } from 'react-native-maps';
import ProjectCrmService from '../../../../services/CRM/Project';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ListItem, Avatar } from '@rneui/themed'
import Gap from '../../../../component/Gap/Gap';
const Location = () => {
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
        getLocation()

    }, [])

    const getLocation = async (filter = '') => {
        await Promise.all([ProjectCrmService.crmProjectAll(authToken, user?.client?.id, filter, navigation), ProjectCrmService.attributeFilter(authToken, user?.client?.id, navigation)]).then(([clientProject, filterAttr]) => {
            //    location project get  
            const projects = clientProject?.results;
            const dataLoc = [];
            let color;

            if (projects?.length > 0) {


                projects.map((res) => {
                    if (filterAttr?.results.length > 0) {

                        const nameProspect = res?.attributes?.prospect_priority;
                        if (filterAttr.results[0].attribute.options.length > 0) {
                            const filter = filterAttr.results[0].attribute.options;

                            const getProspect = filter.find(item => item.name == nameProspect)
                            if (getProspect?.configuration.color) color = getProspect.configuration.color
                        };


                    }
                    if (res?.location) {
                        res.location.color = color
                        dataLoc.push(res?.location)
                    }
                })

                // if (dataLoc.length > 0) {
                setCurrentPosition({
                    ...currentPosition,
                    latitude: dataLoc[0].latitude,
                    longitude: dataLoc[0].longitude
                })

                setLocations(dataLoc)

                // }


                // prospect data priority
                const prospectData = []

                filterAttr.results.map((res) => {
                    if (res?.attribute?.options.length > 0) {
                        res.attribute?.options.map((item) => {
                            prospectData.push(item)
                        })
                    }
                })

                if (prospectData.length > 0) {
                    setProspectPriority(prospectData)
                }
            } else {
                setLocations([])
            }

        }).catch((err) => console.log(err))
            .finally(e => {
                setLoading(false)
                setLoadingMarker(false)
            })
    }

    const handleChecked = (item) => {
        let filter = '';
        const checkChecked = checked;
        setOpenFilter(false)
        if (!checkChecked.includes(item.name)) {
            checkChecked.push(item.name)
        } else {
            const index = checkChecked.findIndex(array => array == item.name)
            checkChecked.splice(index, 1)
        }
        setChecked(checkChecked)

        checkChecked.map((item) => {
            filter += `&prospect_priority=${item}`
        })
        setLoadingMarker(true)
        getLocation(filter).then(() => setLoadingMarker(false)).catch((e) => ToastAndroid.show('Filter error', ToastAndroid.LONG))
    }

    return (
        <View style={{ width: '100%', flex: 1, position: 'relative' }} >
            {loading && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                    <Text>Loading...</Text>
                </View>
            )}

            {loading == false && (
                <>
                    <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', width: '40%', }} >
                        <View style={{ position: 'relative' }} >
                            <TouchableOpacity style={{ padding: 4, borderBottomWidth: openFilter ? 1 : 0 }} onPress={() => {
                                setOpenFilter(!openFilter)
                                // console.log({ locations });
                            }} >
                                <Text style={{ fontSize: 18 }} >Filter</Text>
                            </TouchableOpacity>

                            {openFilter && (

                                <View style={{ maxHeight: 400, padding: 4 }}>
                                    <Text>Prospect Priority</Text>
                                    <ScrollView>
                                        {prospectPriority.map((item, index) => (
                                            <View key={index} >
                                                <ListItem key={index} bottomDivider containerStyle={{ padding: 0, alignItems: 'flex-start', }} >
                                                    <ListItem.CheckBox
                                                        // Use ThemeProvider to change the defaults of the checkbox
                                                        iconType="material-community"
                                                        checkedIcon="checkbox-marked"
                                                        uncheckedIcon="checkbox-blank-outline"
                                                        checked={checked.includes(item.name)}
                                                        onPress={() => handleChecked(item)}
                                                    />
                                                    <ListItem.Content>
                                                        <ListItem.Title style={{ backgroundColor: item?.configuration?.color.replace(/\s/g, '') ?? 'transparent', padding: 2, borderRadius: 4 }}  >
                                                            <Text>{item.name}</Text>
                                                        </ListItem.Title>
                                                    </ListItem.Content>
                                                </ListItem>
                                                <Gap height={4} />
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>
                    <MapView
                        style={{ width: '100%', flex: 1 }}
                        initialRegion={currentPosition}
                        region={currentPosition}
                    >
                        {loadingMarker == false &&

                            locations.map((location, index) => (
                                <Marker
                                    pinColor={location.color ?? 'red'}
                                    key={index}
                                    title={`${location.name} (${location?.country?.name})`}
                                    draggable
                                    coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                                // onDragEnd={(e) => this.setState({ x: e.nativeEvent.coordinate })}
                                />
                            ))}
                    </MapView>
                </>
            )}
        </View>
    )
}

export default Location