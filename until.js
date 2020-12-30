import { Dimensions, Platform, StatusBar, DeviceEventEmitter } from "react-native";
import ExtraDimensions from 'react-native-extra-dimensions-android';

// 设备宽度，单位 dp
export const deviceWidthDp = Dimensions.get("window").width;
export const deviceHeightDp = Dimensions.get("window").height;
export const mainColor = "#231F20";
export const mainBgColor = "#fff";

// 设计稿宽度（这里为750px），单位 px
const uiWidthPx = 414;
const uiHeightPx = 736;
export function isIphoneX() {
    // iPhoneX Xs
    const X_WIDTH = 375
    const X_HEIGHT = 812
    // iPhoneXR XsMax
    const XR_WIDTH = 414;
    const XR_HEIGHT = 896;
    if (Platform.OS === 'ios' && (deviceWidthDp === X_WIDTH && deviceHeightDp === X_HEIGHT)) {
        return true;
    } else if (Platform.OS === 'ios' && (deviceWidthDp === XR_WIDTH && deviceHeightDp === XR_HEIGHT)) {
        return true;
    } else {
        return false;
    }
}
export function getHeight() {
    var height = Platform.OS === 'android'
        ? ExtraDimensions.getRealWindowHeight()
        : Dimensions.get('window').height
    return height
}