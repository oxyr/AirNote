import React, { Fragment, Component, useState, } from "react";
import {
    Appearance,
    Button,
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
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
import * as actions from '../until.js';
import realm from "../realm";
import moment from 'moment';
import MyAlert from '../component/MyAlert'
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Input } from "react-native-elements";
import CheckBox from '@react-native-community/checkbox';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documents: [],
            showPanel: false,
            selectedNote: "",
            selectedRename: "",
            panelViewY: new Animated.Value(150 + 40),
            scaleAnimate: new Animated.Value(0),
            showNavPanel: false,
            sort: 0,
            viewType: 1,
            isChoice: false,
            checklist: [],
            checkedCount: 0
        };

    }
    static navigationOptions = ({ route, navigation }) => {
        const { params = {} } = route;
        return {
            headerTitle: "Documents",
            headerStyle: {
                backgroundColor: actions.mainBgColor,
                elevation: 0,
                borderBottomWidth: 0,
                shadowOpacity: 0,
                elevation: 0,
            },
            headerRight: (props) => (
                <View style={{ marginEnd: 10 }}>
                    <TouchableOpacity
                        onPress={params._toSetting}
                        style={{ justifyContent: 'center', marginEnd: 10 }}
                    >
                        {params.isChoice ? (<Text
                            style={{ color: actions.mainColor, fontSize: 20 }}>Done</Text>) : (<Image
                                source={require("../assets/icon_menu.png")}
                                style={{ width: 30, height: 30, marginStart: 0 }}
                            />)}

                    </TouchableOpacity>
                </View>
            ),
            headerTintColor: actions.mainColor,
        };
    };



    toSetting = () => {
        if (this.state.isChoice) {
            this.setState({
                isChoice: false,
                showPanel: false,
                showNavPanel: false,
                checkedCount: 0
            })
            this.props.navigation.setParams({
                isChoice: false
            })
        } else {
            this.setState({
                showNavPanel: true,
                showPanel: false,
                isChoice: false,
                checkedCount: 0
            })
        }
    };
    toAdd = () => {
        this.setState({
            showPanel: false,
            selectedNote: ""
        })
        var that = this;
        this.props.navigation.navigate("Add", {
            refresh: () => {
                that.setState({ documents: [] }, () => {
                    that.loadData()
                });
            }
        })
    }
    toDelete() {
        this.setState({
            showPanel: false,
            deleteVisible: true
        })
    }
    toChoice = (index) => {
        if (!this.state.checklist[index].check) {
            this.state.checklist[index].check = true;
        } else {
            this.state.checklist[index].check = false;
        }
        var count = 0;
        for (var i in this.state.checklist) {
            if (this.state.checklist[i].check) {
                count++;
            }
        }
        this.setState({
            checklist: this.state.checklist,
            checkedCount: count
        }, () => {

        })
    }
    toModify = (id) => {
        var that = this;
        this.setState({
            showPanel: false,
            selectedNote: ""
        })
        this.props.navigation.navigate("Add", {
            aid: id,
            refresh: () => {
                that.setState({ documents: [] }, () => {
                    that.loadData()
                });
            }
        })
    }
    sureRename() {
        var that = this;
        if (this.state.selectedNote) {
            realm.current((err, context) => {
                var res = context.objects("NoteInfoSchema").filtered('id == $0 ', this.state.selectedNote.id);
                if (res && res.length > 0) {
                    context.write(() => {
                        res[0].title = this.state.selectedRename;
                    });
                }
                that.setState({
                    documents: [], selectedNote: "",
                    renameVisible: false
                }, () => {

                    that.loadData()
                });
            })
        }
    }
    sureDelete() {
        var that = this;
        if (this.state.selectedNote) {
            realm.current((err, context) => {
                try {
                    context.write(() => {
                        let noteItem = context
                            .objects("NoteInfoSchema")
                            .filtered("id==$0", this.state.selectedNote.id);
                        context.delete(noteItem);
                    });
                } catch (e) {
                    console.warn("realm error!", e);
                } finally {
                    // context.close();
                    that.setState({
                        documents: [], selectedNote: "",
                        deleteVisible: false
                    }, () => {

                        that.loadData()
                    });
                }
            })
        } else if (this.state.checkedCount > 0) {
            var dllist = [];
            for (var i in this.state.checklist) {
                if (this.state.checklist[i].check) {
                    dllist.push(this.state.checklist[i].id)
                }
            }
            realm.current((err, context) => {
                try {
                    context.write(() => {
                        var arrDelete = [];
                        for (var i in dllist) {
                            let noteItem = context
                                .objects("NoteInfoSchema")
                                .filtered("id == $0", dllist[i]);
                            context.delete(noteItem);
                        }
                    });
                } catch (e) {
                    console.warn("realm error!", e);
                } finally {
                    // context.close();
                    that.setState({
                        documents: [], selectedNote: "",
                        deleteVisible: false,
                        isChoice: false,
                        checkedCount: 0,
                    }, () => {
                        that.props.navigation.setParams({
                            isChoice: false
                        })
                        that.loadData()
                    });
                }
            })
        }
    }
    setNavPanel(sort, viewType) {
        var that = this;
        this.setState({
            sort: sort,
            viewType: viewType,
            showNavPanel: false
        }, () => {
            that.loadData();
        })
    }
    loadData() {
        var that = this;
        var datalist = [];
        var checklist = []
        realm.current((err, context) => {
            try {
                if (this.state.sort == 1) {
                    var res = context.objects("NoteInfoSchema").sorted("title", true);
                } else {
                    var res = context.objects("NoteInfoSchema").sorted("lastTime", true);
                }
                if (res && res.length > 0) {
                    for (var item in res) {
                        datalist.push(res[item]);
                        var ck = { id: res[item].id, check: false, };
                        checklist.push(ck);
                    }
                }
                console.log("home realm list", that.state.documents)
            } catch (e) {
                console.warn(e);
            } finally {
                // that.setState({documents:datalist});
                that.setState({
                    documents: datalist, checklist: checklist,
                    checkedCount: 0
                }, () => {
                    console.log("reload")
                });
            }
        })
    }
    componentDidMount() {
        this.props.navigation.setParams({
            _toSetting: this.toSetting,
        });
        this.loadData()
        this._addAnimateC();

    };
    onChangeTitle(title) {
        this.setState({
            selectedRename: title
        })
    }
    /******* Animate *******************************/
    _showAnimatePanelView = () => {
        Animated.timing(
            this.state.panelViewY,
            {
                toValue: 0,
                duration: 300,   //动画时长300毫秒
                useNativeDriver: true
            }
        ).start();
    }
    _hideAnimatePanelView = () => {
        Animated.timing(
            this.state.panelViewY,
            {
                toValue: 150 + 40,
                duration: 300,   //动画时长300毫秒
                useNativeDriver: true
            }
        ).start();
    }
    _addAnimateC() {
        setTimeout(() => {
            Animated.spring(this.state.scaleAnimate, {
                toValue: 1,
                velocity: 6,//初始速度
                friction: 6,//摩擦力值
                tension: -4,//弹跳的速度值
                duration: 2500,//
                useNativeDriver: true
            }).start();
        }, 4500);
    }
    documentsGrid({ item, index }) {
        return (
            <TouchableOpacity style={{
                flexDirection: "column", backgroundColor: "#F6F6F6",
                alignItems: "center",
                width: width / 2 - 20,
                margin: 10,
                borderRadius: 5,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.20,
                shadowRadius: 1.41,

                elevation: 2,
            }}
                onPress={this.state.isChoice ? this.toChoice.bind(this, index) : this.toModify.bind(this, item.id)}
                key={item.id}>
                {this.state.isChoice ? (<View style={{ position: "absolute", top: 14, right: 10, zIndex: 2000, }}><CheckBox
                    disabled={false}
                    value={this.state.checklist[index].check}
                    onValueChange={(newValue) => {
                        this.state.checklist[index].check = newValue;
                        var count = 0;
                        for (var i in this.state.checklist) {
                            if (this.state.checklist[i].check) {
                                count++;
                            }
                        }
                        this.setState({
                            checklist: this.state.checklist,
                            checkedCount: count
                        }, () => {
                            console.log("check", this.state.checklist)
                        })
                    }}
                    style={{ height: 22, width: 22 }}
                    onCheckColor={"#000"}
                    tintColor={"gray"}
                    onTintColor={"#000"}
                /></View>) : (<TouchableOpacity style={{ position: "absolute", top: 4, right: 0, width: 50, height: 80, zIndex: 1000, }}
                    onPress={() => {
                        this.setState({
                            selectedNote: item,
                            showPanel: true
                        }, () => {
                            this._showAnimatePanelView();
                        })
                    }}>
                    <Image
                        source={require('../assets/icon_more.png')}
                        style={{
                            width: 30,
                            height: 30,
                        }}
                    />
                </TouchableOpacity>)}

                <View style={{
                    width: 80, height: 80, alignItems: "center",
                    justifyContent: "center",
                    marginTop: 20
                }}>
                    <Image
                        source={require('../assets/icon_gridnote.png')}
                        style={{
                            width: 48,
                            height: 48,
                        }}
                    />
                </View>
                <View style={{ marginStart: 0, flex: 1, justifyContent: "center", position: "relative", elevation: 1000 }}>
                    <Text style={{
                        paddingLeft: 22, paddingRight: 22,
                        color: "#000", fontSize: 16, marginTop: 0, height: 30, textAlign: "center"
                    }}>{item.title && item.title.length > 10 ? item.title.substring(0, 9) + "..." :
                        item.title}</Text>
                    <Text style={{
                        color: "#A5A6A8", fontSize: 14, marginTop: 0, marginBottom: 0, height: 30
                        , textAlign: "center"
                    }}>{moment(item.createTime).format("YYYY-MM-DD HH:mm")}</Text>
                </View>

            </TouchableOpacity>
        )

    }
    documentsItems({ item, index }) {
        return (
            <TouchableOpacity style={{
                flexDirection: "row", backgroundColor: "#fff", height: 80
                , alignItems: "center",
            }}
                onPress={
                    this.state.isChoice ? this.toChoice.bind(this, index) : this.toModify.bind(this, item.id)}
                key={item.id}>
                <View style={{
                    width: 80, height: 90, alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Image
                        source={require('../assets/icon_note.png')}
                        style={{
                            width: 33,
                            height: 33,
                        }}
                    />
                </View>

                <View style={{ marginStart: 0, flex: 1, position: "relative", elevation: 1000 }}>
                    <Text style={{ color: "#000", fontSize: 18, marginTop: 10, height: 30, }}>{item.title && item.title.length > 10 ? item.title.substring(0, 12) + "..." : item.title}</Text>
                    <Text style={{ color: "#A5A6A8", fontSize: 14, marginTop: 4, marginBottom: 0, height: 30 }}>{moment(item.createTime).format("YYYY-MM-DD HH:mm:ss")}</Text>
                    {this.state.isChoice ? (<View style={{ position: "absolute", top: 26, right: 20, zIndex: 2000, }}><CheckBox
                        disabled={false}
                        value={this.state.checklist[index].check}
                        onValueChange={(newValue) => {
                            this.state.checklist[index].check = newValue;
                            var count = 0;
                            for (var i in this.state.checklist) {
                                if (this.state.checklist[i].check) {
                                    count++;
                                }
                            }
                            this.setState({
                                checklist: this.state.checklist,
                                checkedCount: count
                            }, () => {
                                console.log("check", this.state.checklist)
                            })
                        }}
                        style={{ height: 22, width: 22 }}
                        onCheckColor={"#000"}
                        tintColor={"gray"}
                        onTintColor={"#000"}
                    /></View>) : (
                            <TouchableOpacity style={{ position: "absolute", top: 4, right: 0, width: 50, height: 80, zIndex: 1000, }}
                                onPress={() => {
                                    this.setState({
                                        selectedNote: item,
                                        showPanel: true
                                    }, () => {
                                        this._showAnimatePanelView();
                                    })
                                }}>
                                <Image
                                    source={require('../assets/icon_more.png')}
                                    style={{
                                        width: 33,
                                        height: 33,
                                    }}
                                />
                            </TouchableOpacity>
                        )}


                    <View style={{ height: 1, borderBottomWidth: 1, borderColor: "#F3F4F4", marginTop: 0 }}></View>
                </View>

            </TouchableOpacity>
        )
    }

    renderNavPanel() {
        if (this.state.showNavPanel) {
            return (<TouchableOpacity style={{
                position: "absolute",
                bottom: 0,
                zIndex: 200000,
                backgroundColor: "transparent",
                height: height,
                width: "100%",
                activeOpacity: 0,
            }}
                onPress={() => {
                    this.setState({
                        showNavPanel: false
                    })
                    this.props.navigation.setParams({
                        isChoice: false
                    })
                }}>
                <Animated.View style={{
                    backgroundColor: "white",
                    width: "70%",
                    borderRadius: 10,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 1,
                        height: 5,
                    },
                    shadowOpacity: 0.35,
                    shadowRadius: 5,
                    position: "absolute",
                    right: 20,
                    top: Platform.select({ android: 5, ios: (actions.isIphoneX() ? 88 : 20) + 5 }),
                }}>
                    <Text style={{
                        marginTop: 20,
                        marginStart: 20,
                        fontSize: 12,
                        color: "#585A5A",
                        flex: 1
                    }}>Operation</Text>
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 0
                    }}
                        onPress={() => {
                            this.setState({
                                isChoice: true,
                                showNavPanel: false
                            }, () => {
                                this._showAnimatePanelView();
                                this.props.navigation.setParams({
                                    isChoice: true
                                })
                            })
                        }}>
                        <Text style={{
                            fontSize: 18,
                            paddingTop: 12,
                            paddingBottom: 12,
                            color: actions.mainColor,
                            marginStart: 20,
                            marginTop: 0,
                            flex: 1
                        }}>Choice</Text>
                        <Image
                            source={require('../assets/icon_choice.png')}
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: 20,
                                height: 20,
                                marginEnd: 20
                            }}></Image>
                    </TouchableOpacity>
                    <View style={{
                        height: 1, backgroundColor: "#F3F4F4", marginStart: 20,
                        marginEnd: 20
                    }}></View>

                    <View style={{
                        marginStart: 20,
                        marginEnd: 20
                    }}>
                        <Text style={{
                            marginTop: 10,
                            fontSize: 12,
                            color: "#585A5A",
                            flex: 1
                        }}>Sort</Text>
                        <View style={{
                            flexDirection: "row",
                            marginTop: 10
                        }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1, margin: 2,
                                    borderRadius: 4, justifyContent: "center", alignItems: "center",
                                    height: 48,
                                    borderColor: "black",
                                    borderWidth: this.state.sort == 0 ? 1 : 0,
                                    backgroundColor: this.state.sort == 0 ? "rgba(35,31,32,0.2)" : "#F5F5F5"
                                }}
                                onPress={() => {
                                    this.setNavPanel(0, this.state.viewType);
                                }}>
                                <Text style={{ color: actions.mainColor, fontSize: 16 }}>By Time</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1, margin: 2,
                                    borderRadius: 4, justifyContent: "center", alignItems: "center",
                                    height: 48,
                                    borderWidth: this.state.sort == 1 ? 1 : 0,
                                    backgroundColor: this.state.sort == 1 ? "rgba(35,31,32,0.2)" : "#F5F5F5"
                                }}
                                onPress={() => {
                                    this.setNavPanel(1, this.state.viewType);
                                }}>
                                <Text style={{ color: actions.mainColor, fontSize: 16 }}>By Name</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        height: 1, backgroundColor: "#F3F4F4", marginStart: 20,
                        marginEnd: 20, marginTop: 10
                    }}></View>
                    <View style={{
                        marginStart: 20,
                        marginEnd: 20, marginBottom: 20,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            color: "#585A5A",
                            marginTop: 10,
                            flex: 1
                        }}>View</Text>
                        <View style={{
                            flexDirection: "row",
                            marginTop: 10
                        }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1, margin: 2,
                                    borderRadius: 4, justifyContent: "center", alignItems: "center",
                                    height: 48,
                                    borderColor: "black",
                                    borderWidth: this.state.viewType == 0 ? 1 : 0,
                                    backgroundColor: this.state.viewType == 0 ? "rgba(35,31,32,0.2)" : "#F5F5F5",
                                    flexDirection: "row"
                                }}
                                onPress={() => {
                                    this.setNavPanel(this.state.sort, 0);
                                }}>
                                <Image
                                    source={require('../assets/icon_list.png')}
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: 22,
                                        height: 22,
                                        marginEnd: 10
                                    }}></Image>
                                <Text style={{ color: actions.mainColor, fontSize: 16 }}>List</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1, margin: 2,
                                    borderRadius: 4, justifyContent: "center", alignItems: "center",
                                    height: 48,
                                    flexDirection: "row",
                                    borderWidth: this.state.viewType == 1 ? 1 : 0,
                                    backgroundColor: this.state.viewType == 1 ? "rgba(35,31,32,0.2)" : "#F5F5F5",
                                }}
                                onPress={() => {
                                    this.setNavPanel(this.state.sort, 1);

                                }}>
                                <Image
                                    source={require('../assets/icon_grid.png')}
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: 22,
                                        height: 22,
                                        marginEnd: 10
                                    }}></Image>
                                <Text style={{ color: actions.mainColor, fontSize: 16 }}>Grid</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                </Animated.View>

            </TouchableOpacity>)
        }
    }

    renderEditPanel() {
        if (this.state.isChoice) {
            return (<TouchableOpacity style={{
                position: "absolute",
                bottom: 0,
                zIndex: 200000,
                backgroundColor: "transparent",
                height: 180,
                width: "100%",
                activeOpacity: 0,
            }}
                onPress={() => {
                    // this._hideAnimatePanelView()
                    // setTimeout(() => {
                    //     this.setState({
                    //         isChoice: false,
                    //     }, () => {
                    //     })
                    // }, 300)

                }}>
                <Animated.View style={{
                    backgroundColor: "white",
                    height: 160,
                    width: width - 20,
                    borderRadius: 10,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 1,
                        height: 5,
                    },
                    shadowOpacity: 0.35,
                    shadowRadius: 5,
                    position: "absolute",
                    left: 10,
                    bottom: 40,
                    transform: [{ translateY: this.state.panelViewY }]
                }}>
                    <Text style={{
                        fontSize: 24,
                        paddingTop: 12,
                        paddingBottom: 12,
                        color: "#000",
                        marginStart: 20,
                        marginTop: 10
                    }}>{this.state.checkedCount + " selected"}</Text>
                    <View style={{
                        height: 1, backgroundColor: "#F3F4F4", marginStart: 20,
                        marginEnd: 20
                    }}></View>
                    <View style={{
                        flexDirection: "row", height: 90, marginStart: 10,
                        marginEnd: 10,
                        marginBottom: 10
                    }}>
                        <TouchableOpacity
                            style={{
                                flex: 1, backgroundColor: "#F5F5F5", margin: 10,
                                borderRadius: 5, justifyContent: "center", alignItems: "center"
                            }}
                            onPress={() => {
                                for (var i in this.state.checklist) {
                                    this.state.checklist[i].check = true;
                                }
                                this.setState({
                                    checklist: this.state.checklist,
                                    checkedCount: this.state.checklist.length
                                })
                            }}>
                            <Image
                                source={require('../assets/icon_choice.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                }}
                            />
                            <Text style={{ color: "#000", fontSize: 12, marginTop: 5 }}>All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flex: 1, backgroundColor: "#F5F5F5", margin: 10,
                                borderRadius: 5, justifyContent: "center", alignItems: "center"
                            }}
                            onPress={() => {
                                this.setState({
                                    deleteVisible: true
                                })
                            }}>
                            <Image
                                source={require('../assets/icon_delete.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                }}
                            />
                            <Text style={{ color: "#000", fontSize: 12, marginTop: 5 }}>Delete</Text>
                        </TouchableOpacity>
                    </View>


                </Animated.View>

            </TouchableOpacity>)
        } else {
            return null
        }
    }

    renderPanel() {
        if (this.state.showPanel) {
            return (<TouchableOpacity style={{
                position: "absolute",
                bottom: 0,
                zIndex: 200000,
                backgroundColor: "transparent",
                height: height,
                width: "100%",
                activeOpacity: 0,
            }}
                onPress={() => {
                    this._hideAnimatePanelView()
                    setTimeout(() => {
                        this.setState({
                            showPanel: false,
                            selectedNote: ""
                        }, () => {
                        })
                    }, 300)

                }}>
                <Animated.View style={{
                    backgroundColor: "white",
                    height: 160,
                    width: width - 20,
                    borderRadius: 10,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 1,
                        height: 5,
                    },
                    shadowOpacity: 0.35,
                    shadowRadius: 5,
                    position: "absolute",
                    left: 10,
                    bottom: 40,
                    transform: [{ translateY: this.state.panelViewY }]
                }}>
                    <Text style={{
                        fontSize: 24,
                        paddingTop: 12,
                        paddingBottom: 12,
                        color: "#000",
                        marginStart: 20,
                        marginTop: 10
                    }}>{this.state.selectedNote ? (this.state.selectedNote.title.length > 16 ?
                        this.state.selectedNote.title.substring(0, 16) + "....." : this.state.selectedNote.title) : "No Note"}</Text>
                    <View style={{
                        height: 1, backgroundColor: "#F3F4F4", marginStart: 20,
                        marginEnd: 20
                    }}></View>
                    <View style={{
                        flexDirection: "row", height: 90, marginStart: 10,
                        marginEnd: 10,
                        marginBottom: 10
                    }}>
                        <TouchableOpacity
                            style={{
                                flex: 1, backgroundColor: "#F5F5F5", margin: 10,
                                borderRadius: 5, justifyContent: "center", alignItems: "center"
                            }}
                            onPress={() => {
                                this.setState({
                                    renameVisible: true,
                                    selectedRename: this.state.selectedNote.title,
                                    showPanel: false,
                                })
                            }}>
                            <Image
                                source={require('../assets/icon_edit.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                }}
                            />
                            <Text style={{ color: "#000", fontSize: 12, marginTop: 5 }}>Rename</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flex: 1, backgroundColor: "#F5F5F5", margin: 10,
                                borderRadius: 5, justifyContent: "center", alignItems: "center"
                            }}>
                            <Image
                                source={require('../assets/icon_share.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                }}
                            />
                            <Text style={{ color: "#000", fontSize: 12, marginTop: 5 }}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flex: 1, backgroundColor: "#F5F5F5", margin: 10,
                                borderRadius: 5, justifyContent: "center", alignItems: "center"
                            }}
                            onPress={() => {
                                this.setState({
                                    isChoice: true,
                                    checkedCount: 0,
                                    showPanel: false
                                })
                                this.props.navigation.setParams({
                                    isChoice: true
                                })
                            }}>
                            <Image
                                source={require('../assets/icon_choice.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                }}
                            />
                            <Text style={{ color: "#000", fontSize: 12, marginTop: 5 }}>Choice</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flex: 1, backgroundColor: "#F5F5F5", margin: 10,
                                borderRadius: 5, justifyContent: "center", alignItems: "center"
                            }}
                            onPress={this.toDelete.bind(this)}>
                            <Image
                                source={require('../assets/icon_delete.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                }}
                            />
                            <Text style={{ color: "#000", fontSize: 12, marginTop: 5 }}>Delete</Text>
                        </TouchableOpacity>
                    </View>


                </Animated.View>

            </TouchableOpacity>)
        } else {
            return null
        }

    }

    renderEmpty() {
        return (
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: height - 260
            }}>
                <Image
                    source={require('../assets/emptybox.png')}
                    style={{
                        width: 100,
                        height: 100,
                    }}
                />
                <Text style={{ color: "#cdcdcd", fontSize: 20, marginTop: 5 }}>No documents</Text>

            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1, }}>
                <StatusBar
                    backgroundColor="#ffffff"
                    barStyle="dark-content"
                />
                <MyAlert
                    content="Are you sure to delete？"
                    visible={this.state.deleteVisible}
                    CancelEvent={() => this.setState({ deleteVisible: false })}
                    positiveEvent={this.sureDelete.bind(this)}
                />
                <MyAlert
                    contentView={(
                        <View style={{
                            margin: 20,
                            justifyContent: "center", alignItems: "center"
                        }}>
                            <Text style={{ color: "black", fontSize: 24 }}>Rename Title</Text>
                            <Input
                                containerStyle={{
                                    width: "100%",
                                    paddingLeft: 10,
                                    marginTop: Platform.select({ android: 0, ios: 8 }),
                                    ...Platform.select({
                                        ios: {},
                                        android: {}
                                    }),
                                    borderBottomWidth: 1,
                                    borderBottomColor: "black"
                                }}
                                inputStyle={{
                                    fontSize: 22,
                                    height: 48,
                                    paddingLeft: 0,
                                    paddingTop: 0,
                                    color: "#666666",
                                    alignItems: "center",
                                }}
                                keyboardType={"default"}
                                placeholder="Enter your title...."
                                autoFocus={true}
                                placeholderTextColor="#BDBDBD"
                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                value={this.state.selectedRename ? this.state.selectedRename : ""}
                                onChangeText={this.onChangeTitle.bind(this)}
                            />
                        </View>
                    )}
                    visible={this.state.renameVisible}
                    CancelEvent={() => this.setState({ renameVisible: false })}
                    positiveEvent={this.sureRename.bind(this)}
                />
                <View style={{ flex: 1 }}>
                    {this.state.viewType == 1 ? (<FlatList
                        key={'_'}
                        data={this.state.documents}
                        showsVerticalScrollIndicator={false}
                        renderItem={
                            this.documentsGrid.bind(this)}
                        keyExtractor={(item, index) => {
                            return "_" + item.id;
                        }}
                        ListEmptyComponent={this.renderEmpty.bind(this)}
                        style={{
                            marginTop: 10,
                        }}
                        numColumns={2}
                    />) : (<FlatList
                        key={'#'}
                        data={this.state.documents}
                        showsVerticalScrollIndicator={false}
                        renderItem={
                            this.documentsItems.bind(this)}
                        keyExtractor={(item, index) => {
                            return "#" + item.id;
                        }}
                        ListEmptyComponent={this.renderEmpty.bind(this)}
                        style={{

                        }}
                        numColumns={1}
                    />)}

                </View>
                <View
                    style={{
                        position: "absolute",
                        bottom: actions.isIphoneX() ? 16 + 49 + 34 : 16 + 49, right: 20, zIndex: 2000
                    }}
                >
                    <TouchableOpacity style={{
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                        justifyContent: "center",
                        alignItems: "center",
                        elevation: 3,
                        height: 50,
                        width: 50,
                        backgroundColor: "transparent",
                    }}
                        onPress={this.toAdd.bind(this)}>
                        <Animated.Image
                            source={require('../assets/icon_add.png')}
                            style={{
                                width: 50,
                                height: 50,
                                transform: [{
                                    rotateZ: this.state.scaleAnimate.interpolate({
                                        inputRange: [0, 0.5, 0.75, 1],
                                        outputRange: ['0deg', '180deg', '360deg', '0deg']
                                    })
                                }]
                            }}
                        />
                    </TouchableOpacity>
                </View>
                {this.renderPanel()}
                {this.renderNavPanel()}
                {this.renderEditPanel()}
            </SafeAreaView>
        )
    }
}
export default Home;
const styles = StyleSheet.create({
})