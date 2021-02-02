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
        const { params = {} } = route;
        return {
            headerTitle: "Setting",
            headerStyle: {
                backgroundColor: params.navBackgroundColor,
                elevation: 0,
                borderBottomWidth: 0,
                shadowOpacity: 0,
                elevation: 0,
            },
            headerLeft: (prop) => (
                <HeaderBackButton tintColor={params.navColor} onPress={params._toBack} />
            ),
            headerTintColor: params.navColor,
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
            contentStyle.backgroundColor = '#F5F5F5';//actions.mainBgColor;
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
    async componentDidMount() {

        var that = this;
        var Mode = await actions.getItem('Mode');
        if (Mode == 'dark') {
            contentStyle = this.createContentStyle('dark');
            that.setState({
                contentStyle
            });
        } else if (Mode == 'light') {
            contentStyle = this.createContentStyle('light');
            that.setState({
                contentStyle
            });
        } else {
            Mode = 'auto';
            contentStyle = this.createContentStyle('light');
            that.setState({
                contentStyle
            });
        }
        navStyle = actions.getNavStyle(Mode);
        this.props.navigation.setParams({
            _toBack: this.toBack,
            navBackgroundColor: navStyle.backgroundColor,
            navColor: navStyle.color,
        });
        that.setState({
            Mode: Mode
        });


    }
    toBack = () => {
        if (this.props.route.params.refresh) {
            this.props.route.params.refresh();
        }
        this.props.navigation.goBack();
    };
    changeTheme = (themes) => {
        var that = this;
        if (themes == 'auto') {
            contentStyle = this.createContentStyle(Appearance.getColorScheme());
        } else {
            contentStyle = this.createContentStyle(themes);
        }
        navStyle = actions.getNavStyle(themes);
        this.props.navigation.setParams({
            navBackgroundColor: navStyle.backgroundColor,
            navColor: navStyle.color,
        });
        this.setState({
            contentStyle,
            Mode: themes
        }, () => {
            actions.setAsyncItem('Mode', themes);
        });
    }
    render() {
        var that = this;
        const { contentStyle, theme } = this.state;
        const { backgroundColor, itemBgColor, color, iconColor, itemDateColor,
            panelBg, panelBtnBg, lineColor } = contentStyle;
        const themeBg = { backgroundColor };
        return (
            <SafeAreaView style={{ backgroundColor: backgroundColor, flex: 1, }}>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle={this.state.Mode !== 'dark' ? 'dark-content' : 'light-content'}
                />
                <ScrollView style={{
                    flex: 1,
                    backgroundColor: backgroundColor
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
                    <Text style={{ marginStart: 15, marginTop: 10, color: itemDateColor, marginBottom: 10 }}>Policy</Text>

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
                            marginStart: 15,
                            textAlignVertical: 'center',
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
                            marginStart: 15
                        }}></View>
                        <Image
                            source={require('../assets/icon_right.png')}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 14,
                                width: 18,
                                height: 18,
                                tintColor: this.state.Mode === 'dark' ? 'white' : '#231F20'
                            }}></Image>
                    </TouchableOpacity>
                    <Text style={{ marginStart: 10, marginTop: 10, color: itemDateColor, marginBottom: 10 }}>Theme Setting</Text>

                    <TouchableOpacity style={{
                        backgroundColor: panelBg, height: 45
                        , textAlign: "left",
                    }}
                        onPress={this.changeTheme.bind(this, 'auto')}>
                        <Text style={{
                            color: color, fontSize: 18, textAlign: "left",
                            marginStart: 15,
                            textAlignVertical: 'center',
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
                            marginStart: 10
                        }}></View>
                        {(!this.state.Mode || this.state.Mode === 'auto') ? (<Image
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
                    }}
                        onPress={this.changeTheme.bind(this, 'dark')}>
                        <Text style={{
                            color: color, fontSize: 18, textAlign: "left",
                            marginStart: 15,
                            textAlignVertical: 'center',
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
                            marginStart: 15
                        }}></View>
                        {this.state.Mode == "dark" ? (<Image
                            source={require('../assets/icon_selected.png')}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 14,
                                width: 18,
                                height: 18,
                                tintColor: this.state.Mode === 'dark' ? 'white' : '#231F20'
                            }}></Image>) : null}
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        backgroundColor: panelBg, height: 45
                        , textAlign: "left",
                    }}
                        onPress={this.changeTheme.bind(this, 'light')}>
                        <Text style={{
                            color: color, fontSize: 18, textAlign: "left",
                            marginStart: 15,
                            textAlignVertical: 'center',
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
                            marginStart: 15
                        }}></View>
                        {this.state.Mode == "light" ? (<Image
                            source={require('../assets/icon_selected.png')}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 14,
                                width: 18,
                                height: 18,
                                tintColor: this.state.Mode === 'dark' ? 'white' : '#231F20'
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