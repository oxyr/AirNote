import React, { Component } from "react";
import PropTypes from "prop-types";
import {  Button } from "react-native-elements";
import Modal from 'react-native-translucent-modal';
import { Text, View,Dimensions,TouchableOpacity } from "react-native";
// import I18n from "../i18n";
import * as actions from '../until.js';



const width = Dimensions.get("window").width
export default class MyAlert extends Component {
  static propTypes = {
    content: PropTypes.string,
    visible: PropTypes.bool.isRequired,
    //如果页面需要重新载入，需要重写此方法
    CancelEvent: PropTypes.func,
    cancelTitle: PropTypes.string,
    confirmTitle: PropTypes.string,
  };
  static defaultProps = {
    content: 'areSure',
    visible: false
  };
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: JSON.parse(JSON.stringify(this.props.visible))
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ modalVisible: JSON.parse(JSON.stringify(nextProps.visible))  });
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
  render() {
    return (
      <Modal
        animationType={"slide"}
        visible={this.state.modalVisible}
        onRequestClose={() => this.setModalVisible(false)}
        onBackdropPress={() => this.setModalVisible(false)}
        transparent={true}
      >
      <View style={{width,height: actions.getHeight(),position:'relative',alignItems:'center',justifyContent:'center'}}>
          <TouchableOpacity activeOpacity={1} style={{position:'absolute',width,height: actions.getHeight(),top:0,left:0,backgroundColor:'rgba(0,0,0,.5)'}}/>
        <View style={[{width: width-40,backgroundColor:'white',borderRadius:5,padding:0},this.props.containerStyle]}>
          {this.props.contentView || <View
            style={{ paddingTop: 15, paddingBottom: 30, alignItems: "center" }}
          >
            <Text
              style={{ color: "#000", fontSize: 18, textAlign: "center",lineHeight:24 }}
            >
              {this.props.content}
            </Text>
          </View>}
          <View style={{height:1,backgroundColor:"#F5F5F5",marginBottom:0}}></View>
          {this.props.customButtons ||<View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom:5
            }}
          >
            <Button
              containerStyle={{ flex: 1, marginEnd: 0 }}
              buttonStyle={{ borderColor: "transparent"}}
              title={this.props.cancelTitle ? this.props.cancelTitle : 'Cancel'}
              type="outline"
              titleStyle={{ color: "black",fontSize: 16, }}
              onPress={this.props.CancelEvent || this.setModalVisible.bind(this, false)}
            />
            <View style={{width:1,backgroundColor:"#F5F5F5",height:"100%"}}></View>
            <Button
              containerStyle={{ flex: 1, marginStart: 0 }}
              buttonStyle={{ backgroundColor: "transparent" }}
              title={this.props.confirmTitle ? this.props.confirmTitle : "OK"}
              type="solid"
              titleStyle={{ color: "red",fontSize: 16, }}
              onPress={this.props.positiveEvent}
            />
          </View>}
        </View>
      </View>
      </Modal>
    );
  }
}
