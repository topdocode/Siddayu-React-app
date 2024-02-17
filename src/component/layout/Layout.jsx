import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from "../../utils/color";
import ModeOffline from '../ModeOffline/ModeOffline';
import Navbar from '../Navbar';
import SideBar from "../Sidebar/Sidebar";
const style = StyleSheet.create({
  focus: {
    backgroundColor: 'white',
    borderColor: colors.borderColorSecond
  }
})


const Layout = ({ children, color, backgroundImage = true }) => {
  const [openSideBar, setOpenSideBar] = useState(false)
  // const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const [childSidebar, setChildSidebar] = useState(route.name)
  const [triggerSidebar, setTriggerSidebar] = useState(0)
  // const { authToken, } = useSelector((state) => state.auth)
  const screenWidth = Dimensions.get('window').height * 2
  const slideAnimation = useRef(new Animated.Value(-screenWidth)).current;
  const slideValue = useRef(-screenWidth)
  const [isOpenChildSidebar, setIsOpenChildSidebar] = useState(false)
  const openSideBarAnimation = () => {
    slideValue.current = 0;
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  const closeSideBar = () => {
    slideValue.current = -screenWidth;
    Animated.timing(slideAnimation, {
      toValue: -screenWidth,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };


  const toggleSideBar = (close = false) => {
    if (close == true || slideValue.current === 0) {
      closeSideBar();
    } else {
      openSideBarAnimation();
    }
    setTriggerSidebar(triggerSidebar + 1)
  };

  const handleLogout = () => {
    navigation.navigate('expired', { 'currentLogout': true })

  }

  const handleSideBar = () => {
    setOpenSideBar(!openSideBar)
    toggleSideBar()
  }


  return (
    <View style={{ flex: 1, backgroundColor: 'white', color: 'black', }} >
      <SideBar
        childSidebar={childSidebar}
        setChildSidebar={setChildSidebar}
        isOpenChildSidebar={isOpenChildSidebar}
        setIsOpenChildSidebar={setIsOpenChildSidebar}
        slideAnimation={slideAnimation}
        toggleSideBar={toggleSideBar}
        openSideBar={openSideBar}
        navigation={navigation}
        handleSideBar={handleSideBar}
        handleLogout={handleLogout}
        slideValue={slideValue}
        triggerSidebar={triggerSidebar}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: color ?? colors.bgColor, position: 'relative' }} >
        {backgroundImage && (
          <>
            <Image source={require(`../../assets/vector-left.png`)} style={{ position: 'absolute', top: 90, opacity: 0.7 }} />
            <Image source={require(`../../assets/vector-right.png`)} style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.8 }} />
          </>
        )}
        <ModeOffline />
        <Navbar toggleSideBar={toggleSideBar} handleSideBar={handleSideBar} openSideBar={openSideBar} />
        {children}
      </SafeAreaView>
    </View>
  )
}

export default Layout