/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthContext from './AuthContext'
import * as actions from './until.js';

import Home from "./pages/home.js";
import Add from "./pages/add.js";
import Agree from "./pages/agree.js";
import Setting from "./pages/setting.js";


const appScreens = {
  Home: { screen: Home },
  Add: { screen: Add },
  Setting: { screen: Setting },
}
const authScreens = {
  Agree: { screen: Agree },
}
const AppStack = createStackNavigator();
const AuthStack = createStackNavigator();



function App({ navigation }) {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'SIGN_IN':
          return {
            isLogin: true,
          };
        case 'SIGN_OUT':
          return {
            isLogin: false,
          };
        case 'EXIT':
          return {
            
          };
      }
    },
    {
      isLoading: true,
      isLogin: true,
    }
  );
  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        dispatch({ type: 'SIGN_IN' });
      },
      exitOut: () => {
        dispatch({ type: 'EXIT' });
      },
      signUp: async data => {
        global.signUpInfo = data.info;
        dispatch({ type: 'SIGN_IN' });
      },
    }),
    []
  );
  useEffect(() => {
    actions.getItem('isAgree', (err, value) => {
      value && value != '' ?
        dispatch({ type: 'SIGN_IN' }) :
        dispatch({ type: 'SIGN_OUT' })
    })

  }, []);

  return (
    <NavigationContainer>
      <AuthContext.Provider value={authContext}>
        {
          state.isLogin ? (
            <AppStack.Navigator
              initialRouteName={"Home"}>
              {Object.entries(appScreens).map(([name, component]) => (
                <AppStack.Screen key={name} name={name} component={component.screen}
                  {...component.screen.navigationOptions && { options: component.screen.navigationOptions }}
                />
              ))}
            </AppStack.Navigator>) : (
              <AuthStack.Navigator
                initialRouteName={"Agree"}
              >
                {Object.entries(authScreens)
                  .map(([name, component]) => (
                    <AuthStack.Screen name={name} component={component.screen}
                      {...component.screen.navigationOptions && { options: component.screen.navigationOptions }}
                    />
                  ))}
              </AuthStack.Navigator>)
        }

      </AuthContext.Provider>
    </NavigationContainer>
  );

}

export default App;
