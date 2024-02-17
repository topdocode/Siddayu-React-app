/**
 * @format
 */

import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
// import App from './App';
import { name as appName } from './app.json';
import App from './App';
// navigator.geolocation = require('@react-native-community/geolocation');
AppRegistry.registerComponent(appName, () => App);
