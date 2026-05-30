// Gesture Handler must be imported before anything else (required on some
// Android builds; a safe no-op on the New Architecture).
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';

import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and sets up the environment for Expo Go and native dev/release builds alike.
registerRootComponent(App);
