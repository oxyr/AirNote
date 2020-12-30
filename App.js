/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from "./pages/home.js";
import Add from "./pages/add.js";

const appScreens = {
  Home: { screen: Home },
  Add: {screen:Add},
}
const AppStack = createStackNavigator();

class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <AppStack.Navigator
          initialRouteName={"Home"}>
          {Object.entries(appScreens).map(([name, component]) => (
          <AppStack.Screen key={name} name={name} component={component.screen}
            {...component.screen.navigationOptions && { options: component.screen.navigationOptions }}
          />
        ))}
        </AppStack.Navigator>
      </NavigationContainer>
    );
  }
    
}

export default App;
