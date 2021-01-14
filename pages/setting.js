import React, { Fragment, Component, useState, } from "react";
import {
    Appearance,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    Linking,
    Animated,
    Easing,
    SafeAreaView
} from "react-native";
import { Button } from "react-native-elements";
import AuthContext from '../AuthContext'

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
import * as actions from '../until.js';
import MyAlert from '../component/MyAlert';
import { HeaderBackButton, Header, HeaderHeightContext } from "@react-navigation/stack";


class Setting extends Component {
    static contextType = AuthContext

    constructor(props) {
        super(props);
        const theme = props.theme || Appearance.getColorScheme();
        const contentStyle = this.createContentStyle(theme);
        console.log(theme)
        this.state = {
            theme: theme,
            contentStyle,
            visibleAgree: true,
        };

    }

    static navigationOptions = ({ route, navigation }) => {
        const navStyle = actions.getNavStyle();
        const { params = {} } = route;
        return {
            headerTitle: "Setting",
            headerStyle: {
                backgroundColor: navStyle.backgroundColor,
                elevation: 0,
                borderBottomWidth: 0,
                shadowOpacity: 0,
                elevation: 0,
            },
            headerLeft: (prop) => (
                <HeaderBackButton tintColor={navStyle.color} onPress={params._toBack} />
            ),
            headerTintColor: navStyle.color,
        };

    };

    createContentStyle(theme) {
        // Can be selected for more situations (cssText or contentCSSText).
        const contentStyle = {
            backgroundColor: '#161819',
            color: '#fff',
            placeholderColor: 'gray',
            // cssText: '#editor {background-color: #f3f3f3}', // initial valid
            contentCSSText: 'font-size: 16px;',
            itemBgColor: '#222324', // initial valid
            itemDateColor: '#A5A6A8',
            panelBg: "#272829",
            panelBtnBg: "#373939",
            lineColor: "#343637",

        };
        if (theme === 'light') {
            contentStyle.backgroundColor = actions.mainBgColor;
            contentStyle.color = '#000';
            contentStyle.placeholderColor = '#a9a9a9';
            contentStyle.itemBgColor = '#F6F6F6';
            contentStyle.itemDateColor = '#A5A6A8';
            contentStyle.panelBg = '#fff';
            contentStyle.panelBtnBg = '#F5F5F5';
            contentStyle.lineColor = '#F3F4F4'
        }
        return contentStyle;
    }
    componentDidMount() {
        this.props.navigation.setParams({
            _toBack: this.toBack,
        });
        var that = this;
        actions.getItem('Mode', (err, value) => {
            that.setState({
                Mode: value
            });
        })

    }
    toBack = () => {
        this.props.navigation.goBack();
    };
    render() {
        var that = this;
        const { contentStyle, theme } = this.state;
        const { backgroundColor, itemBgColor, color, iconColor, itemDateColor,
            panelBg, panelBtnBg, lineColor } = contentStyle;
        const themeBg = { backgroundColor };
        return (
            <SafeAreaView style={{ backgroundColor: panelBtnBg, flex: 1, }}>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle={theme !== 'dark' ? 'dark-content' : 'light-content'}
                />
                <ScrollView style={{
                    flex: 1,
                    backgroundColor: panelBtnBg
                }}>
                    <View
                        style={{ justifyContent: "center", flex: 1, alignItems: "center", marginTop: 20 }}
                    >
                        <Image
                            source={require('../assets/logo.png')}
                            style={{
                                justifyContent: "center", width: 66, height: 66, margin: 0,
                                borderRadius: 10,
                                borderRadius: 10,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 1,
                                    height: 5,
                                },
                                shadowOpacity: 0.35,
                                shadowRadius: 5,
                            }}
                        />
                        <View height={15} />
                    </View>
                    <Text style={{ marginStart: 10, marginTop: 10, color: itemDateColor, marginBottom: 10 }}>Policy</Text>

                    <TouchableOpacity style={{
                        backgroundColor: panelBg, height: 45
                        , textAlign: "left",
                    }}
                        onPress={() => {
                            var url = 'https://autobot.im/pages/policies';
                            Linking.openURL(url)
                                .catch((err) => {
                                    console.log('An error occurred', err);
                                });
                        }}>
                        <Text style={{
                            color: color, fontSize: 18, textAlign: "left",
                            marginStart: 26,
                            alignItems: "center", height: 44, ...Platform.select({
                                ios: {
                                    lineHeight: 44,
                                },
                                android: {
                                }
                            }),
                        }}>Service Privacy policy</Text>
                        <View style={{
                            height: 1, backgroundColor: lineColor,
                            marginStart: 26
                        }}></View>
                        <Image
                            source={require('../assets/icon_right.png')}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 14,
                                width: 18,
                                height: 18,
                                tintColor: theme === 'dark' ? 'white' : '#231F20'
                            }}></Image>
                    </TouchableOpacity>
                    <Text style={{ marginStart: 10, marginTop: 10, color: itemDateColor, marginBottom: 10 }}>Theme Setting</Text>

                    <TouchableOpacity style={{
                        backgroundColor: panelBg, height: 45
                        , textAlign: "left",
                    }}>
                        <Text style={{
                            color: color, fontSize: 18, textAlign: "left",
                            marginStart: 26,
                            alignItems: "center", height: 44, ...Platform.select({
                                ios: {
                                    lineHeight: 44,
                                },
                                android: {
                                }
                            }),
                        }}>Auto</Text>
                        <View style={{
                            height: 1, backgroundColor: lineColor,
                            marginStart: 26
                        }}></View>
                        {!this.state.Mode ? (<Image
                            source={require('../assets/icon_selected.png')}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 14,
                                width: 18,
                                height: 18,
                                tintColor: theme === 'dark' ? 'white' : '#231F20'
                            }}></Image>) : null}

                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        backgroundColor: panelBg, height: 45
                        , textAlign: "left",
                    }}>
                        <Text style={{
                            color: color, fontSize: 18, textAlign: "left",
                            marginStart: 26,
                            alignItems: "center", height: 44, ...Platform.select({
                                ios: {
                                    lineHeight: 44,
                                },
                                android: {
                                }
                            }),
                        }}>Dark Mode</Text>
                        <View style={{
                            height: 1, backgroundColor: lineColor,
                            marginStart: 26
                        }}></View>
                        {this.state.Mode == "1" ? (<Image
                            source={require('../assets/icon_selected.png')}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 14,
                                width: 18,
                                height: 18,
                                tintColor: theme === 'dark' ? 'white' : '#231F20'
                            }}></Image>) : null}
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        backgroundColor: panelBg, height: 45
                        , textAlign: "left",
                    }}>
                        <Text style={{
                            color: color, fontSize: 18, textAlign: "left",
                            marginStart: 26,
                            alignItems: "center", height: 44, ...Platform.select({
                                ios: {
                                    lineHeight: 44,
                                },
                                android: {
                                }
                            }),
                        }}>Light Mode</Text>
                        <View style={{
                            height: 1, backgroundColor: lineColor,
                            marginStart: 26
                        }}></View>
                        {this.state.Mode == "2" ? (<Image
                            source={require('../assets/icon_selected.png')}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 14,
                                width: 18,
                                height: 18,
                                tintColor: theme === 'dark' ? 'white' : '#231F20'
                            }}></Image>) : null}
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 50 }}>
                        <Text
                            style={{ marginTop: 0, color: color }}
                        >AirNote</Text>
                        <Text
                            style={{ marginTop: 0, color: color }}
                        >1.0</Text>
                    </View>

                </ScrollView>


            </SafeAreaView>
        )
    }
}
export default Setting;