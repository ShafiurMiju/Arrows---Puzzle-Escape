# navigation/

React Navigation v7 setup: the root `NavigationContainer`, a native-stack
navigator for the main flow, and strongly-typed route params.

Planned (Phase 2):

```
navigation/
├── RootNavigator.tsx   # NavigationContainer + stack
├── routes.ts           # route name constants
└── types.ts            # RootStackParamList + typed navigation/route props
```

Peer deps already declared: `react-native-screens`, `react-native-safe-area-context`,
`react-native-gesture-handler` (root is wrapped in `GestureHandlerRootView` in `App.tsx`).
