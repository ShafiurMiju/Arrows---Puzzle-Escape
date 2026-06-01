// Gesture Handler must be imported before anything else (required on some
// Android builds; a safe no-op on the New Architecture).
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import App from './src/App';

AppRegistry.registerComponent(appName, () => App);
