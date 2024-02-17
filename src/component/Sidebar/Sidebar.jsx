import { VERSION } from "@env";
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text } from '@rneui/themed';
import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/dist/Entypo';
import { useSelector } from 'react-redux';
import { global_styles } from '../../pages/global_styles';
import { colors } from "../../utils/color";
import Gap from '../Gap/Gap';
import Row from "../Row/Row";
const style = StyleSheet.create({
    focus: {
        backgroundColor: 'white',
        borderColor: colors.borderColorSecond
    }
})

const menuSideBar = [
    {
        id: 'profile',
        title: 'Home',
        route: 'homeDashboard',
    },
    {
        id: 'crm',
        title: 'CRM',
        // route: 'home',
        child: [
            { title: 'Home', route: 'homeCrm' },
            { title: 'Projects', route: 'projectCrm' },
            { title: 'Customers', route: 'customerCrm' },
            { title: 'Contacts', route: 'contactCrm' },
            { title: 'Activities', route: 'activitieCrm' },
        ]
    },
    {
        id: 'TaskManager',
        title: 'Task Manager',
        route: 'Task Manager',
        child: [
            { title: 'Home', route: 'home' },
            { title: 'Projects', route: 'project' },
        ]
    },
    {
        id: 'profile',
        title: 'Profile',
        route: 'profile',
    },
    {
        id: 'setting',
        title: 'Setting',
        route: 'setting',
    },
    {
        id: 'about',
        title: 'About',
        route: 'about',
    }


]

const ButtonSideBar = ({ navigation, onPress, title, focus, disabled, isOpenChildSidebar, setIsOpenChildSidebar, dataSidebar = [], childSidebar, id, setChildSidebar, toggleListItem, arrowTransform, toggleSideBar }) => {
    const route = useRoute();
    // const indexRouteActive = dataSidebar.findIndex(item => item.route == route.name)
    return (
        <View style={{ marginBottom: 5 }} >
            <TouchableOpacity disabled={disabled}
                onPress={() => {
                    // dataSidebar.length > 0 ? toggleListItem(id) : onPress();
                    if (dataSidebar.length > 0) {
                        toggleListItem(id)
                    } else {
                        onPress()
                        // toggleSideBar(true)
                    }
                }}
                style={[{ paddingHorizontal: 12, borderRadius: 5, paddingVertical: 8 }, focus ? style.focus : null]}>
                <Row styles={{ alignItems: 'center', justifyContent: 'space-between' }} >
                    <Text style={{ color: colors.textColor }} >{title}</Text>
                    {dataSidebar.length > 0 && (

                        // <Animated.View style={{ transform: [{ rotateZ: arrowTransform }] }} >
                        //     <Icon name="chevron-right" />
                        // </Animated.View>
                        <View style={{ transform: [{ rotate: (isOpenChildSidebar && childSidebar == id) ? '90deg' : '0deg' }] }} >
                            <Icon name="chevron-right" />
                        </View>
                    )}
                </Row>
            </TouchableOpacity>

            {
                dataSidebar.length > 0 && (
                    <>
                        {((isOpenChildSidebar && childSidebar == id)) && (
                            <View style={{ paddingLeft: 12, paddingVertical: 4 }} >
                                {dataSidebar.map((res, index) => {
                                    return (
                                        <View key={index}>
                                            {/* rgba(255,255,255,0.6) */}
                                            <TouchableOpacity onPress={() => { navigation.navigate(res.route); setChildSidebar('x') }} style={{ paddingLeft: 10, backgroundColor: route.name == res.route ? 'rgba(255,255,255,0.6)' : 'transparent', borderRadius: 5, paddingVertical: 4 }} >
                                                <Text style={{ fontSize: 12 }} >{res.title}</Text>
                                            </TouchableOpacity>
                                            <Gap height={5} />
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                    </>
                )
            }
        </View >

    )


}

const SideBar = (props) => {
    const openSideBar = props.openSideBar;
    const handleSideBar = props.handleSideBar;
    const navigation = useNavigation();
    const [saveId, setSaveId] = useState(null)
    const handleLogout = props.handleLogout;
    const slideAnimation = props.slideAnimation;
    const toggleSideBar = props.toggleSideBar;
    const childSidebar = props.childSidebar;
    const setChildSidebar = props.setChildSidebar;
    const isOpenChildSidebar = props.isOpenChildSidebar;
    const setIsOpenChildSidebar = props.setIsOpenChildSidebar;
    const triggerSidebar = props.triggerSidebar;
    const { user } = useSelector((state) => state.auth)
    const route = useRoute();


    const handleNavigation = (nameRoute) => {
        navigation.navigate(nameRoute);
        handleSideBar();
    }

    const animationController = useRef(new Animated.Value(0)).current;

    const toggleListItem = (id) => {
        setSaveId(id)
        const config = {
            duration: 100,
            toValue: childSidebar == id ? (!isOpenChildSidebar ? 1 : 0) : 1,
            useNativeDriver: true
        }

        Animated.timing(animationController, config).start();
        setIsOpenChildSidebar(childSidebar == id ? (!isOpenChildSidebar) : true)
        setChildSidebar(id)
    }

    const arrowTransform = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg']
    })

    // useEffect(() => {

    //     setIsOpenChildSidebar(false)
    //     return () => {

    //     }
    // }, [triggerSidebar])


    return (

        <Animated.View style={global_styles.containerSideBar(slideAnimation)}>
            <TouchableWithoutFeedback onPress={toggleSideBar}>
                <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <Animated.View style={global_styles.sideBarAnimation(slideAnimation)}>
                <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }} >
                    <Pressable>
                        <Icon name='cross' color={colors.textColor} size={20} onPress={toggleSideBar} />
                    </Pressable>
                </View>
                <Gap height={10} />
                {/* profile */}
                <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }} >
                    <Image alt='profile' source={user.avatar != null ? { uri: `${user.avatar}` } : require('../../assets/profile.png')} style={{ width: 40, height: 40, backgroundColor: 'transparent', borderRadius: 100 }} w={10} h={10} bgColor='#FFD88D' />
                    <Gap width={8} />
                    <View style={{ color: 'white' }} >
                        <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: 'bold' }} >{user.name}</Text>
                        <Text style={{ color: colors.textColor, fontSize: 12 }} >{user.name}</Text>
                    </View>
                </View>
                <Gap height={20} />
                <ScrollView>

                    <View style={{ flex: 1, justifyContent: 'space-between' }} >
                        <View style={{ flex: 1 }} >
                            {menuSideBar.length > 0 && menuSideBar.map((item, index) => (
                                <ButtonSideBar
                                    navigation={navigation}
                                    key={index}
                                    toggleSideBar={toggleSideBar}
                                    // onPress={() => handleNavigation(item.route)}
                                    onPress={() => item.child && item.child.length > 0 ? setIsOpenChildSidebar(!isOpenChildSidebar) : handleNavigation(item.route)}
                                    title={item.title}
                                    focus={route.name == item.route ? true : false}
                                    id={item.id}
                                    toggleListItem={toggleListItem}
                                    arrowTransform={arrowTransform}
                                    setChildSidebar={setChildSidebar}
                                    childSidebar={childSidebar}
                                    setIsOpenChildSidebar={setIsOpenChildSidebar}
                                    isOpenChildSidebar={isOpenChildSidebar}
                                    dataSidebar={
                                        item.child && item.child.length > 0 ? item.child : []
                                    }
                                />
                            ))}
                        </View>
                        <ButtonSideBar onPress={handleLogout} title='Logout' />
                        <ButtonSideBar disabled={true} title={VERSION} />
                    </View>
                </ScrollView>
            </Animated.View>
        </Animated.View>
    );
};
export default SideBar