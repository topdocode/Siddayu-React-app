import analytics from '@react-native-firebase/analytics';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useRef } from 'react';
import HomeBase from '../pages/HomeBase';
import Login from '../pages/Login';
import HomeManagement from '../pages/Management/HomeManagement/HomeManagement';
const Stack = createStackNavigator();
const Routes = () => {
  const routeNameRef = useRef();
  const navigationRef = useRef();

  function Management() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="HomeManagement" component={HomeManagement} />
      </Stack.Navigator>
    );
  }


  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current.getCurrentRoute().name;
      }}

      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName) {
          await analytics().logScreenView({
            screen_name: currentRouteName,
            screen_class: currentRouteName,
          });
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      <Stack.Navigator initialRouteName="AppBase" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AppBase" component={HomeBase} />
        <Stack.Screen name="Login" component={Login} />


        <Stack.Screen name="Management" component={Management} />




      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
