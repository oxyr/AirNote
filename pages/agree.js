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
    Animated,
    Easing,
    SafeAreaView
} from "react-native";
import {  Button } from "react-native-elements";
import AuthContext from '../AuthContext'

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
import * as actions from '../until.js';
import MyAlert from '../component/MyAlert';


class Agree extends Component {
    static contextType = AuthContext

    constructor(props) {
        super(props);
        const theme = props.theme || Appearance.getColorScheme();
        const contentStyle = this.createContentStyle(theme);
        console.log(theme)
        this.state = {
            theme: theme,
            contentStyle,
            visibleAgree:true,
        };

    }

    static navigationOptions = ({ route, navigation }) => {
        const navStyle = actions.getNavStyle();
        const { params = {} } = route;
        return {
            headerShown: false,
            gesturesEnabled: false
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
    render() {
        var that = this;
        const { contentStyle, theme } = this.state;
        const { backgroundColor, color } = contentStyle;
        const themeBg = { backgroundColor };
        return (
            <SafeAreaView style={{ backgroundColor: backgroundColor, flex: 1, }}>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle={theme !== 'dark' ? 'dark-content' : 'light-content'}
                />
                <MyAlert
                    content=""
                    visible={this.state.visibleAgree}
                    contentView={(
                        <View
                            style={{ paddingTop: 15, paddingBottom: 30, alignItems: "center" }}
                        >
                            <View style={{ margin: 10 }}>
                                <Text
                                    style={{ color: "#000", fontSize: 20, fontWeight: "600", textAlign: "center", lineHeight: 24 }}
                                >
                                    Information Protection Guidelines
                            </Text>
                            </View>

                            <View style={{ marginStart: 20, marginEnd: 20 }}>
                                <Text
                                    style={{ color: "#000", fontSize: 16, textAlign: "left", lineHeight: 24,padding:5 }}
                                >
                                    1. We will collect and use practical information in accordance with the privacy policy, but we will not collect it in a mandatory way just because we agree to this privacy policy
                            </Text>
                                <Text style={{ color: "#000", fontSize: 16, textAlign: "left", lineHeight: 24,padding:5 }}>
                                    2. The camera and photo album permissions will not be turned on by default, and will only be used for the realization of functional services after express authorization, and will not collect information through your authorization when the functions and services are not needed. You can view the full version of the terms of service and privacy policy
                            </Text>
                                <Text style={{ color: "#000", fontSize: 16, textAlign: "left", lineHeight: 24,padding:5 }}>
                                    If you agree, please click the button below to accept our service
                            </Text>
                            </View>

                        </View>
                    )}
                    customButtons={(<View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 0
                        }}
                    >
                        <Button
                            containerStyle={{ flex: 1, marginEnd: 0,height:55 }}
                            buttonStyle={{ borderColor: "transparent",backgroundColor: "white",
                            height:55 }}
                            title={'Not Agree'}
                            type="solid"
                            titleStyle={{ color: "black", fontSize: 16, }}
                            onPress={()=>{
                                that.setState({
                                    visibleAgree:false
                                },()=>{
                                    that.context.exitOut({})
                                })
                            }}
                        />
                        <View style={{ width: 1, backgroundColor: "#F5F5F5", height: "100%" }}></View>
                        <Button
                            containerStyle={{ flex: 1, marginStart: 0 ,
                            height:55}}
                            buttonStyle={{ backgroundColor: "#4BBBFA",height:55 }}
                            title={"Agree"}
                            type="solid"
                            titleStyle={{ color: "white", fontSize: 16, }}
                            onPress={()=>{
                                that.setState({
                                    visibleAgree:false
                                },()=>{
                                    actions.setAsyncItem("isAgree","1");
                                    that.context.signIn({})
                                })
                            }}
                        />
                    </View>)}
                    
                />
            </SafeAreaView>
        )
    }
}
export default Agree;