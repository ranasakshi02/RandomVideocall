import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './screens/RegisterScreen';
import CallScreen from './screens/CallScreen';
const Stack = createStackNavigator();
const App = () => {

  return (
    <NavigationContainer>
      
      <Stack.Navigator
        initialRouteName="RegisterScreen"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#9c60a2'
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontSize: 25,
            fontWeight: 'bold'
          }
        }}
      >
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
        />
        <Stack.Screen
          name="CallScreen"
          component={CallScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};



export default App;
