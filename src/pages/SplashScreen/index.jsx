import { unwrapResult } from "@reduxjs/toolkit";
import { Button, Text } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginCheck } from "../../redux/features/auth/authSlice";
import { styles } from "./styles";
import LocalAuthentication, { getBiometryStatusDescription } from 'rn-local-authentication';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import { colors } from "../../utils/color";
import { global_styles } from "../global_styles";


const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { rememberMe } = useSelector(state => state.auth)
  const [isBiometric, setIsBiometric] = useState(false);
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if (rememberMe) {
      // check biometric
      handleBiometric()

    } else {
      handleLoginCheck()
    }

  }, []);


  const handleLoginCheck = () => {
    dispatch(loginCheck({ navigation: navigation })).then((unwrapResult))
      .then(res => {

        if (res?.authToken != null && res?.authToken != '') {
          navigation.replace('homeDashboard');
        } else {
          handlerNavigation()
        }
      }).catch(err => {
        handlerNavigation()
      })
  }



  const handlerNavigation = () => {
    setTimeout(() => {
      navigation.replace('login');
    }, 1000);
  }


  const handleBiometric = async () => {
    LocalAuthentication.isSupportedAsync().then(isSupported => {
      if (isSupported) {
        LocalAuthentication.isAvailableAsync().then(isAvailable => {
          if (isAvailable) {
            setLoading(true)
            LocalAuthentication.authenticateAsync({
              reason: 'Authenticate please',
              title: 'Bz Publish Auth',
              fallbackToPinCodeAction: true,
            }).then(response => {
              if (response?.success) {
                handleLoginCheck()
              }

              setLoading(false)
            }).catch(e => {
              setLoading(false)
            });
            setIsBiometric(true)
          } else {
            handleLoginCheck()
          }
        })

      } else {
        handleLoginCheck()
      }
    })

  }

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      <Image source={require(`../../assets/vector-left.png`)} style={{ position: 'absolute', top: 80, left: 0, opacity: 0.4 }} />
      <Image source={require(`../../assets/vector-right.png`)} style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.4 }} />
      <View style={[{ width: '100%', alignItems: 'center', marginBottom: 5 },]} >
        <View style={[{ borderRadius: 100 }, global_styles.shadow]} >
          <Image source={require('../../assets/bz.png')} style={{ resizeMode: 'contain', borderRadius: 100, height: 80, width: 80 }} />
        </View>
      </View>
      {isBiometric &&
        <Button
          loading={loading}
          titleStyle={{ color: 'white' }}
          buttonStyle={{ backgroundColor: colors.buttonColorSecond, height: 55, width: 200 }}
          type="solid"
          onPress={handleBiometric}
          containerStyle={{ width: 200, borderRadius: 5, height: 55 }}
        >
          Login    <Icon name='finger-print' size={40} color="white" />
        </Button>
      }
      <Text>Waiting...</Text>
    </View>
  );
};

export default SplashScreen;
