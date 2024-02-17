import { ThemeProvider, createTheme } from '@rneui/themed';
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./src/redux/store/store";
import Routes from "./src/routes";
import { ToastProvider } from 'react-native-toast-notifications'
import * as Sentry from '@sentry/react-native';
import { Alert, BackHandler } from 'react-native';

Sentry.init({
  dsn: 'https://645c527b04765ba68e5deb6462115da8@o4505757092806656.ingest.sentry.io/4505757094576128',
});




const App = () => {
  // throw new Error('My first Sentry error!');
  const theme = createTheme({
    components: {
      Text: {
        style: {
          // fontFamily: 'Blinker-Light',
          color: 'black'
        }
      }
    }
  });


  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>

        <ThemeProvider theme={theme} >
          <ToastProvider>
            <Routes />
          </ToastProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
};

export default Sentry.wrap(App);
