import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { palette } from '../constants';
import {
  AchievementsScreen,
  FailureScreen,
  GameScreen,
  LevelSelectScreen,
  MainMenuScreen,
  SettingsScreen,
  SplashScreen,
  VictoryScreen,
} from '../screens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** App-wide dark navigation theme derived from our palette. */
const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.background,
    card: palette.surface,
    text: palette.textPrimary,
    primary: palette.primary,
    border: palette.border,
    notification: palette.accent,
  },
};

export interface RootNavigatorProps {
  /** Called once the navigation tree is mounted — used to hide the native splash. */
  onReady?: () => void;
}

export function RootNavigator({ onReady }: RootNavigatorProps) {
  return (
    <NavigationContainer theme={navigationTheme} onReady={onReady}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />

        {/* Outcome screens overlay the game as transparent modals. */}
        <Stack.Group
          screenOptions={{ presentation: 'transparentModal', animation: 'fade' }}
        >
          <Stack.Screen name="Victory" component={VictoryScreen} />
          <Stack.Screen name="Failure" component={FailureScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
