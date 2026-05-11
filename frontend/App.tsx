import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import RootNavigator from './src/navigation/RootNavigator';
import { hydrateThunk } from './src/store/authSlice';
import { store } from './src/store';

function Root() {
  useEffect(() => {
    store.dispatch(hydrateThunk());
  }, []);

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Root />
    </Provider>
  );
}
