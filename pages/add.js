import React, { Fragment, Component } from "react";
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
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
    Easing,
    FlatList,
    SafeAreaView
} from "react-native";
import { HeaderBackButton, Header, HeaderHeightContext } from "@react-navigation/stack";
import { actions, defaultActions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { InsertLinkModal } from './insertLink';
import * as actionss from '../until.js';
import { EmojiView } from './emoji';
import realm from "../realm";
import {
    Input
} from "react-native-elements";
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import RNHTMLtoPDF from 'react-native-html-to-pdf-rd';
import Share from "react-native-share";
import { EasyLoading, Loading } from "../component/Loading";
// const pdf2base64 = require('pdf-to-base64');
import RNFS from 'react-native-fs';
const imageList = [
    'https://img.lesmao.vip/k/h256/R/MeiTu/1293.jpg',
    'https://pbs.twimg.com/profile_images/1242293847918391296/6uUsvfJZ.png',
    'https://img.lesmao.vip/k/h256/R/MeiTu/1297.jpg',
    'https://img.lesmao.vip/k/h256/R/MeiTu/1292.jpg',
];
// import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { encode, decode } from 'base64-arraybuffer';

const initHTML = ``;

const phizIcon = require('../assets/phiz.png');
const htmlIcon = require('../assets/h5.png');
const videoIcon = require('../assets/video.png');
const strikethrough = require('../assets/strikethrough.png');
// const keyboardIcon = require('./assets/keyboard.png');
const bulletIcon = require('../assets/bullet.png');
const removeFIcon = require('../assets/format_clear.png');

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
class Add extends Component {
    constructor(props) {
        super(props);
        const that = this;
        const { route } = this.props;
        this.richText = React.createRef();
        this.linkModal = React.createRef();
        this.Mode = route.params?.Mode ?? "auto";
        const theme = props.theme || Appearance.getColorScheme();
        contentStyle = that.createContentStyle(theme);
        if(this.Mode != 'auto') {
            contentStyle = that.createContentStyle(this.Mode);
        }
        that.state = {
            theme: theme, contentStyle, emojiVisible: false, disabled: false,
            Mode:this.Mode == 'auto'?theme:this.Mode,
            keyboardOffset: 0,
            title: "",
            initFlag: true,
            isTitleEdit: false,
            content: initHTML,
            height: 35,
            inputTitleHeight: 0,
            editorHeight: 0,
            scrollViewHeight: 0,
            scrollViewContentHeight: 0,
            showSubRichTool: false,
            toolMarginTop: 0,
            fontAction: [
                { types: "bold", bgColor: "transparent", icon: require('../assets/icon_format_bold.png') },
                { types: "italic", bgColor: "transparent", icon: require('../assets/icon_format_italic.png') },
                // { types: "h1", bgColor: "transparent", icon: "H1" },
                // { types: "h3", bgColor: "transparent", icon: "H3" },
                { types: "color", bgColor: "#000000" },
                { types: "color", bgColor: "#EBEBEB" },
                { types: "color", bgColor: "#DB392C" },
                { types: "color", bgColor: "#F6AE47" },
                { types: "color", bgColor: "#80C64B" },
                { types: "color", bgColor: "#56A7F6" },
                { types: "color", bgColor: "#7A7EC8" }
            ],
            panelViewY: new Animated.Value(0),
        };
        this.note_id = route.params?.aid ?? "";
        this.autoShare = route.params?.share ?? false;
        that.onHome = that.onHome;
        that.save = that.save;
        that.onTheme = that.onTheme;
        that.onPressAddImage = that.onPressAddImage;
        that.onInsertLink = that.onInsertLink;
        that.onLinkDone = that.onLinkDone;
        // that.themeChange = that.themeChange;
        that.handleChange = that.handleChange;
        that.handleHeightChange = that.handleHeightChange;
        that.insertEmoji = that.insertEmoji;
        that.insertHTML = that.insertHTML;
        that.insertVideo = that.insertVideo;
        that.handleEmoji = that.handleEmoji;
        that.onDisabled = that.onDisabled;
        that.editorInitializedCallback = that.editorInitializedCallback;

    }
    static navigationOptions = ({ route, navigation }) => {
        const navStyle = actionss.getNavStyle();
        const { params = {} } = route;
        return {
            headerTitle: "",
            headerStyle: {
                backgroundColor: params.navBackgroundColor,
                elevation: 0,
                borderBottomWidth: 0,
                shadowOpacity: 0,
                elevation: 0,
            },
            headerLeft: (props) => (
                <HeaderBackButton tintColor={params.navColor} onPress={params._toBack} />
            ),
            headerRight: (props) => (
                <View style={{ marginEnd: 10 }}>
                    <TouchableOpacity
                        onPress={params._toSetting}
                        style={{ justifyContent: 'center', marginEnd: 10 }}
                    >
                        <Image
                            source={require("../assets/icon_more.png")}
                            style={{
                                width: 30, height: 30, marginStart: 0,
                                tintColor: params.iconTint
                            }}
                        />
                    </TouchableOpacity>
                </View>
            ),
            headerTintColor: params.navColor,
        };
    };
    /******* Animate *******************************/
    _showAnimatePanelView = () => {
        Animated.timing(
            this.state.panelViewY,
            {
                toValue: -50,
                duration: 300,   //动画时长300毫秒
                useNativeDriver: true
            }
        ).start();
    }
    _hideAnimatePanelView = () => {
        Animated.timing(
            this.state.panelViewY,
            {
                toValue: 0,
                duration: 300,   //动画时长300毫秒
                useNativeDriver: true
            }
        ).start();
    }


    componentDidMount() {
        // Appearance.addChangeListener(this.themeChange.bind(this));
        navStyle = actionss.getNavStyle(this.state.Mode);
        this.props.navigation.setParams({
            _toBack: this.toBack,
            _toSetting: this.toMore,
            navBackgroundColor: navStyle.backgroundColor,
            navColor: navStyle.color,
            iconTint: navStyle.iconTint
        });
        Keyboard.addListener('keyboardDidShow', this.onKeyBoard);
        var that = this;
        realm.current((err, context) => {
            try {
                var res = context.objects("NoteInfoSchema").filtered('id == $0 ', this.note_id);
                if (res && res.length > 0) {
                    that.setState({
                        title: res[0].title,
                        content: res[0].content
                    })

                }
                console.log("home realm list", res, this.note_id)
            } catch (e) {
                console.warn(e);
            } finally {
                // that.setState({documents:datalist});
            }
        })

    }

    componentWillUnmount() {
        if (this.note_id) {
            this.updateNote();
        } else {
            this.addNote();
        }
        if (this.props.route.params.refresh) {
            this.props.route.params.refresh();
        }
        Keyboard.dismiss()
        // Appearance.removeChangeListener(this.themeChange);
        Keyboard.removeListener('keyboardDidShow', this.onKeyBoard);
    }
    onKeyBoard = (event) => {
        this.setState({
            keyboardOffset: event.endCoordinates.height,
        })
        console.log("event",height,event)
        if (!this.state.isTitleEdit) {
            this.richText?.current?.scrollMore(140);
        }
        // if (this.state.editorHeight - event.endCoordinates.height > this.state.scrollViewHeight) {
        //     this.scrollRef && this.scrollRef.scrollToEnd()
        // }else {
        //     // console.log(this.state.editorHeight - event.endCoordinates.height)
        //     this.richText.current.setWebHeight(this.state.editorHeight - event.endCoordinates.height)

        // }
        // TextInput.State.currentlyFocusedInput() && this.setState({ emojiVisible: false });

    };
    toMore = () => {
        this.setState({
            showNavPanel: true,
        })
    }
    toBack = () => {
        this.props.navigation.goBack();
    };

    async createPDF(image = false) {
        Keyboard.dismiss();
        var title = ''
        if (this.state.title != '' || this.state.title != 'No Title') {
            title = "<h1 style=\"text-align:center\">" + this.state.title + "</h1>"
        }
        var footer = `<div style=\"text-align:center;font-size:12px;margin-top:100px;\">
        Published by <span style=\"color:#4BBBFA;
        text-decoration: none;font-size:16px\">AirNote</span></div>`;
        let options = {
            html: image ? title + "" + this.state.content + footer :
                title + "" + this.state.content,
            fileName: 'NoteLine_' + this.state.title,
            directory: 'Documents',

        };
        if (image) {
            options.height = this.state.editorHeight;
            options.isImage = true;
        }
        EasyLoading.show('Processing...');
        let file = await RNHTMLtoPDF.convert(options)
        console.log(file.filePath);

        // RNFS.readFile(file.filePath, 'base64').then(async (content) => {
        //     var bufferArray = decode(content)
        //     const pdfDoc = await PDFDocument.load(bufferArray);
        //     const pages = pdfDoc.getPages()
        //     const firstPage = pages[0]
        //     // Get the width and height of the first page
        //     const { width, pdfheight } = firstPage.getSize()
        //     // Draw a string of text diagonally across the first page
        //     const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        //     firstPage.drawText('Publish by AirNote', {
        //         x: width/2,
        //         y: pdfheight - 10,
        //         size: 12,
        //         font: helveticaFont,
        //         color: rgb(0.95, 0.1, 0.1),
        //         // rotate: degrees(-45),
        //     })
        //     // Serialize the PDFDocument to bytes (a Uint8Array)
        //     const pdfBytes = await pdfDoc.save();
        //     RNFS.writeFile(file.filePath,encode(pdfBytes),'base64').then(()=>{ 
        //         console.log("ff")
        //      })
        // })
        // alert(file.filePath);
        // EasyLoading.dismiss()
        this.share(file);
    }

    share = async (file) => {
        EasyLoading.dismiss();
        RNFS.readFile(file.filePath, 'base64')
            .then((content) => {

                // content 为base64数据
                console.log("content", file.filePath)
                const shareOptions = {
                    title: "NoteLine Share",
                    // subject: shareMessage,
                    // message: shareMessage,
                    // failOnCancel: false,
                    // saveToFiles: true,
                    urls: [file.filePath]
                };
                Share.open(shareOptions)
                    .then(res => {
                        console.warn("ok", res);

                    })
                    .catch(err => {
                        err && console.warn("error", err);
                    });
            }).catch((err) => {
                console.log("reading error: " + err);
            });

    }

    renderNavPanel() {
        const { contentStyle, theme } = this.state;
        const { backgroundColor, itemBgColor, color, iconColor, itemDateColor
            , panelBg, panelBtnBg, lineColor } = contentStyle;
        const themeBg = { backgroundColor };
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
                    backgroundColor: panelBg,
                    width: "46%",
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
                    top: Platform.select({ android: 5, ios: (actionss.isIphoneX() ? 88 : 20) + 5 }),
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
                        marginTop: 0,
                        paddingTop: 5,
                        paddingBottom: 5,
                    }}
                        onPress={() => {
                            var that = this;
                            this.setState({
                                showNavPanel: false
                            }, () => {
                                that.createPDF(false)
                            })
                        }}>
                        <Image
                            source={require('../assets/icon_pdf.png')}
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: 20,
                                height: 20,
                                tintColor: theme !== 'dark' ? actions.mainColor : 'white',
                                marginStart: 20
                            }}></Image>
                        <Text style={{
                            fontSize: 16,
                            paddingTop: 12,
                            paddingBottom: 12,
                            color: color,
                            marginStart: 20,
                            marginTop: 0,
                            flex: 1
                        }}>Share as PDF</Text>

                    </TouchableOpacity>
                    <View style={{
                        height: 1, backgroundColor: lineColor, marginStart: 20,
                        marginEnd: 20
                    }}></View>
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 0,
                        paddingTop: 5,
                        paddingBottom: 5,
                    }}
                        onPress={() => {
                            var that = this;
                            Keyboard.dismiss();
                            this.setState({
                                showNavPanel: false
                            }, () => {
                                // that.createPDF(true) 
                                EasyLoading.show('Processing...');
                                if (this.state.title != '' || this.state.title != 'No Title') {
                                    title = "<h3 style=\"text-align:center\">" + this.state.title + "</h3>"
                                }
                                var footer = `<div style=\"text-align:center;width:100%;font-size:12px;margin-top:100px\">
                                Published by <span style=\"color:#4BBBFA;
                                text-decoration: none;font-size:16px\">AirNote</span></div>`;
                                that.richText.current.setContentHTML(title+this.state.content + footer);
                                setTimeout(() => {
                                    that.richText.current.snapFullShot()
                                }, 1500)
                            })
                        }}>
                        <Image
                            source={require('../assets/icon_image.png')}
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: 20,
                                height: 20,
                                tintColor: theme !== 'dark' ? actions.mainColor : 'white',
                                marginStart: 20
                            }}></Image>
                        <Text style={{
                            fontSize: 16,
                            paddingTop: 12,
                            paddingBottom: 12,
                            color: color,
                            marginStart: 20,
                            marginTop: 0,
                            flex: 1
                        }}>Share as Image</Text>

                    </TouchableOpacity>
                    <View style={{
                        height: 1, backgroundColor: lineColor, marginStart: 20,
                        marginEnd: 20
                    }}></View>
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 0,
                        paddingTop: 5,
                        paddingBottom: 5,
                    }}
                        onPress={() => {
                            var that = this;
                            this.setState({
                                showNavPanel: false
                            }, () => {
                                that.createPDF()
                            })
                        }}>
                        <Image
                            source={require('../assets/icon_share.png')}
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: 20,
                                height: 20,
                                tintColor: theme !== 'dark' ? actions.mainColor : 'white',
                                marginStart: 20
                            }}></Image>
                        <Text style={{
                            fontSize: 16,
                            paddingTop: 12,
                            paddingBottom: 12,
                            color: color,
                            marginStart: 20,
                            marginTop: 0,
                            flex: 1
                        }}>Share</Text>

                    </TouchableOpacity>
                    <View style={{
                        height: 1, backgroundColor: lineColor, marginStart: 20,
                        marginEnd: 20
                    }}></View>



                </Animated.View>

            </TouchableOpacity>)
        }
    }

    addNote() {
        var createdAt = new Date().getTime()
        realm.current((err, context) => {
            console.log(err, context)
            var noteInfo = {
                id: new Date(createdAt).getTime() + "",
                name: "oc",
                title: this.state.title ? this.state.title : "No Title",
                content: this.state.content ? this.state.content : "",
                lastTime: new Date(createdAt),
                createTime: new Date(createdAt)
            };
            try {
                context.write(() => {
                    context.create("NoteInfoSchema", noteInfo);
                })
            } catch (e) {
                console.error("realm error!", e)
            } finally {
            }
        });
    }

    updateNote() {
        var that = this;
        var createdAt = new Date().getTime();
        realm.current((err, context) => {
            console.log(err, context)
            var res = context.objects("NoteInfoSchema").filtered('id == $0 ', this.note_id);
            if (res && res.length > 0) {
                context.write(() => {
                    res[0].title = this.state.title;
                    res[0].content = this.state.content;
                    res[0].lastTime = new Date(createdAt)
                });
            }
        })

    }

    editorInitializedCallback() {
        // this.richText.current?.registerToolbar(function (items) {
        //     console.log('Toolbar click, selected items (insert end callback):', items);
        // });
        // const editor = this.richText.current;
        // if (editor.isKeyboardOpen) {
        //     editor.dismissKeyboard();
        // } else {
        // editor.focusContentEditor();
        // }
        if (this.autoShare) {
            this.createPDF();
        }
    }

    /**
     * theme change to editor color
     * @param colorScheme
     */
    themeChange({ colorScheme }) {
        const theme = colorScheme;
        const contentStyle = this.createContentStyle(theme);
        this.setState({ theme, contentStyle });
    }

    async save() {
        // Get the data here and call the interface to save the data
        let html = await this.richText.current?.getContentHtml();
        // console.log(html);
        alert(html);
    }

    handlePaste = data => {
        console.log('Paste:', data);
    };

    handleKeyUp = data => {
        // console.log('KeyUp:', data);
    };

    handleKeyDown = data => {
        // console.log('KeyDown:', data);
    };

    handleSnap = (data) => {

        this.richText.current.setContentHTML(this.state.content);
        this.share(data);
    };

    handleMessage = ({ type, id, data }) => {
        let index = 0;
        switch (type) {
            case 'ImgClick':
                index = this.i_tempIndex || 1;
                this.i_tempIndex = index + 1 >= imageList.length ? 0 : index + 1;
                this.richText.current?.commandDOM(`$('#${id}').src="${imageList[index]}"`);
                break;
            case 'TitleClick':
                index = this._tempIndex || 0;
                const color = ['red', 'blue', 'gray', 'yellow', 'coral'][index];
                this._tempIndex = index + 1 >= color.length ? 0 : index + 1;

                // command: $ = document.querySelector
                this.richText.current?.commandDOM(`$('#${id}').style.color='${color}'`);
                break;
            case 'SwitchImage':
                break;
        }
        console.log('onMessage', type, id, data);
    };

    handleFocus = () => {
        this.editorFocus = true;
    };

    handleBlur = () => {
        this.editorFocus = false;
    };

    /**
     * editor change data
     * @param {string} html
     */
    handleChange(html) {
        console.log('editor data:', html);
        this.setState({
            content: html,
        }, () => {
        })
        // if (this.state.editorHeight >= this.state.scrollViewHeight) {
        //     this.scrollRef.scrollToEnd()
        // }
    }

    /**
     * editor height change
     * @param {number} height
     */
    handleHeightChange(height) {
        var that = this;
        this.setState({
            editorHeight: height
        }, () => {
            // if (height >= that.state.scrollViewHeight) {
            console.log('editor height change:', height)
            //         that.state.scrollViewHeight);
            //     that.scrollRef.scrollToEnd()
            // }
        })

    }

    insertEmoji(emoji) {
        this.richText.current?.insertText(emoji);
        this.richText.current?.blurContentEditor();
    }

    handleEmoji() {
        const { emojiVisible } = this.state;
        Keyboard.dismiss();
        this.richText.current?.blurContentEditor();
        this.setState({ emojiVisible: !emojiVisible });
    }

    insertVideo() {
        this.richText.current?.insertVideo(
            'https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4',
        );
    }

    insertHTML() {
        this.richText.current?.insertHTML(`<b onclick="_.sendEvent('TitleClick')" id="title" contenteditable="true">Rich Editor</b>`);
    }

    onPressAddImage() {
        // insert URL
        // this.richText.current?.insertImage(
        //     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png',
        // );
        // alert("The function is coming soon...")
        // insert base64
        // this.richText.current?.insertImage(`data:${image.mime};base64,${image.data}`);
        // this.richText.current?.blurContentEditor();
    }

    onInsertLink() {
        // this.richText.current?.insertLink('Google', 'http://google.com');
        this.linkModal.current?.setModalVisible(true);
    }

    onLinkDone({ title, url }) {
        this.richText.current?.insertLink(title, url);
    }

    onHome() {
        this.props.navigation.push('index');
    }

    createContentStyle(theme) {
        // Can be selected for more situations (cssText or contentCSSText).
        const contentStyle = {
            backgroundColor: '#161819',
            color: '#fff',
            placeholderColor: 'gray',
            cssText: '#editor {background-color: #161819}', // initial valid
            contentCSSText: 'font-size: 18px;background-color:#161819',
            itemBgColor: '#222324', // initial valid
            itemDateColor: '#A5A6A8',
            panelBg: "#272829",
            panelBtnBg: "#373939",
            lineColor: "#343637",

        };
        if (theme === 'light') {
            contentStyle.backgroundColor = '#fff';
            contentStyle.color = '#000';
            contentStyle.placeholderColor = '#a9a9a9';
            contentStyle.itemBgColor = '#F6F6F6';
            contentStyle.itemDateColor = '#A5A6A8';
            contentStyle.panelBg = '#fff';
            contentStyle.panelBtnBg = '#F5F5F5';
            contentStyle.lineColor = '#F3F4F4'
            contentStyle.cssText = '#editor {background-color: #fff}'
            contentStyle.contentCSSText = 'font-size: 18px;background-color:#fff'
        }
        return contentStyle;
    }

    onTheme() {
        let { theme } = this.state;
        theme = theme === 'light' ? 'dark' : 'light';
        let contentStyle = this.createContentStyle(theme);
        this.setState({ theme, contentStyle });
    }

    onDisabled() {
        this.setState({ disabled: !this.state.disabled });
    }

    onContentSizeChange(event) {
        // console.log(event.nativeEvent.contentSize.height)
        this.setState({ inputTitleHeight: event.nativeEvent.contentSize.height });
    }

    _contentViewScroll(e) {
        var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
        var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
        var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
        // console.log('ScrollView', contentSizeHeight, oriageScrollHeight)
        // contentSizeHeight - oriageScrollHeight
        // if (offsetY + oriageScrollHeight >= contentSizeHeight) {
        //     this.scrollRef.scrollToEnd();
        //     console.log('到底部事件')
        // }
    }

    renderFontAction(item) {
        if (item.types == "bold" || item.types == "italic") {
            return (
                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <Image
                        source={item.icon}
                        style={{
                            tintColor: this.state.contentStyle.color,
                            height: 44,
                            width: 44,
                        }}
                    />
                </View>
            )
        } else if (item.types == "h1" || item.types == "h3") {
            return (
                <Text style={[styles.tib, { color: color }]}>{item.icon}</Text>

            )
        }
    }


    render() {
        let that = this;
        const { contentStyle, theme, emojiVisible, disabled } = this.state;
        const { backgroundColor, itemBgColor, color, iconColor, itemDateColor
            , panelBg, panelBtnBg, lineColor, placeholderColor } = contentStyle;
        const themeBg = { backgroundColor };
        return (
            <SafeAreaView style={[styles.container,themeBg]}>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle={theme !== 'dark' ? 'dark-content' : 'light-content'}
                />
                <InsertLinkModal
                    placeholderColor={placeholderColor}
                    color={color}
                    backgroundColor={backgroundColor}
                    onDone={that.onLinkDone.bind(this)}
                    ref={that.linkModal}
                />
                <View style={[styles.scroll, themeBg], { flex: 1 }}>
                    {/* <ScrollView style={[styles.scroll, themeBg]}
                    ref={(ref) => this.scrollRef = ref}
                    keyboardDismissMode={'none'}
                    onMomentumScrollEnd={this._contentViewScroll.bind(this)}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        // 
                        console.log("scrollViewContentHeight:", contentHeight);
                        // this.scrollRef.scrollToEnd()
                        this.setState({
                            scrollViewContentHeight: contentHeight
                        })

                    }}
                    onLayout={(event) => {
                        var that = this;
                        const { x, y, height, width } = event.nativeEvent.layout;
                        console.log("scrollViewHeight:", height);
                        this.setState({
                            scrollViewHeight: height
                        }, () => {

                        });

                    }}>*/}
                    <View style={{ justifyContent: "center", alignItems: "center",}}>
                        {this.state.isTitleEdit ? (<Input
                            containerStyle={{
                                width: "100%",
                                paddingLeft: 15,
                                flexWrap: 'wrap',
                                marginTop: Platform.select({ android: 0, ios: 8 }),
                                ...Platform.select({
                                    ios: {},
                                    android: {}
                                }),
                            }}
                            inputStyle={{
                                fontSize: 26,
                                height: 55,
                                paddingLeft: 0,
                                paddingTop: 0,
                                color: color,
                                alignItems: "center",
                                height: this.state.inputTitleHeight,
                            }}
                            autoFocus={true}
                            onContentSizeChange={this.onContentSizeChange.bind(this)}
                            multiline={true}
                            onKeyPress={(event) => {
                                console.log(event.nativeEvent.key)
                                if (event.nativeEvent.key == 'Enter') {
                                    this.setState({
                                        isTitleEdit: false
                                    })
                                    this.richText?.current?.focusContentEditor();

                                }
                            }}
                            onFocus={(event) => {

                            }}
                            onBlur={(event) => {
                                this.setState({
                                    isTitleEdit: false
                                })
                                this.richText?.current?.focusContentEditor();
                            }}
                            keyboardType={"default"}
                            placeholder="Enter your title...."
                            placeholderTextColor="#a9a9a9"
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            value={this.state.title}
                            onChangeText={(title) => this.setState({ title: title })}
                        />) : (<TouchableOpacity
                            style={{
                                width: "100%",
                                paddingLeft: 15,
                                flexWrap: 'wrap',
                                marginTop: Platform.select({ android: 0, ios: 0 }),
                                ...Platform.select({
                                    ios: {},
                                    android: {}
                                }),
                            }}
                            onPress={() => {
                                this.setState({
                                    isTitleEdit: true
                                })
                            }}>
                            <Text style={{
                                fontSize: 26,
                                height: 45,
                                lineHeight: 45,
                                padding: 0,
                                color: this.state.title == "" ? "#a9a9a9" : color,
                                alignItems: "center",
                            }}>{this.state.title.length > 28 ?
                                this.state.title.substring(0, 16) + "..." : (this.state.title == "" ? "Enter your title...." : this.state.title)}</Text>
                        </TouchableOpacity>)}
                    </View>

                    <RichEditor
                        initialFocus={false}
                        onKeyPress={() => { alert(1) }}
                        disabled={disabled}
                        editorStyle={contentStyle} // default light style
                        containerStyle={[themeBg],{padding:0}}
                        ref={this.richText}
                        style={[styles.rich, themeBg,]}
                        placeholder={'Please input your note'}
                        initialContentHTML={this.state.content}
                        editorInitializedCallback={that.editorInitializedCallback.bind(this)}
                        onChange={that.handleChange.bind(this)}
                        onHeightChange={that.handleHeightChange.bind(this)}
                        onPaste={that.handlePaste.bind(this)}
                        onKeyUp={that.handleKeyUp.bind(this)}
                        onKeyDown={that.handleKeyDown.bind(this)}
                        onMessage={that.handleMessage.bind(this)}
                        onSnapFull={that.handleSnap.bind(this)}
                        onFocus={that.handleFocus.bind(this)}
                        onBlur={that.handleBlur.bind(this)}
                        pasteAsPlainText={true}
                    />
                    {/* </ScrollView> */}
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ marginTop: 0 }} keyboardVerticalOffset={89}>
                    {this.state.showSubRichTool ? (<Animated.View style={[themeBg, {
                        height: 55,
                        position: "absolute",
                        top: 0,
                        alignItems: 'center',
                        width,
                        flexDirection: "row",
                        transform: [{ translateY: this.state.panelViewY }]
                    }]}>
                        <FlatList
                            horizontal
                            keyboardShouldPersistTaps={'always'}
                            keyExtractor={(item, index) => item.action + '-' + index}
                            data={this.state.fontAction}
                            alwaysBounceHorizontal={false}
                            style={{
                                borderBottomColor: lineColor,
                                borderBottomWidth: 1,
                                borderTopColor: lineColor,
                                borderTopWidth: 1,
                                backgroundColor: panelBg
                            }}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                var that = this;
                                return (
                                    <TouchableOpacity
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: "center",
                                            height: 20, width: 20,
                                            backgroundColor: item.bgColor,
                                            margin: 10,
                                            borderRadius: 22
                                        }}
                                        onPress={() => {
                                            if (item.types == "color") {
                                                that.richText.current?.setFontColor(item.bgColor)
                                            } else if (item.types == "bold") {
                                                that.richText.current?.setFontBold()
                                            } else if (item.types == "italic") {
                                                that.richText.current?.setItalic()

                                            }

                                        }}>
                                        {this.renderFontAction(item)}
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </Animated.View>) : null}

                    <RichToolbar
                        style={[styles.richBar, themeBg, { backgroundColor: panelBg }]}
                        editor={this.richText}
                        disabled={disabled}
                        iconTint={color}
                        selectedIconTint={'#2095F2'}
                        disabledIconTint={'#8b8b8b'}
                        onPressAddImage={that.onPressAddImage.bind(this)}
                        onInsertLink={that.onInsertLink.bind(this)}
                        iconSize={40} // default 50
                        actions={[
                            // 'insertVideo',
                            'fontStyle',
                            actions.checkDone,
                            // actions.setStrikethrough,
                            actions.heading1,
                            actions.heading4,
                            actions.removeFormat,
                            // 'insertEmoji',
                            'insertHTML',
                            ...defaultActions,
                        ]} // default defaultActions
                        iconMap={{
                            [actions.removeFormat]: ({ tintColor }) => (
                                <View style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}>
                                    <Image
                                        source={removeFIcon}
                                        style={{
                                            tintColor: tintColor,
                                            height: 20,
                                            width: 20,
                                        }}
                                    />
                                </View>

                            ),
                            insertEmoji: phizIcon,
                            [actions.checkDone]: bulletIcon,
                            fontStyle: ({ tintColor }) => (
                                <Text style={[styles.tib, { color: tintColor, fontSize: 18 }]}>Aa</Text>
                            ),
                            [actions.setStrikethrough]: strikethrough,
                            [actions.heading1]: ({ tintColor }) => (
                                <Text style={[styles.tib, { color: tintColor }]}>H1</Text>
                            ),
                            [actions.heading4]: ({ tintColor }) => (
                                <Text style={[styles.tib, { color: tintColor }]}>H3</Text>
                            ),
                            insertHTML: htmlIcon,
                            insertVideo: videoIcon,
                        }}
                        insertEmoji={that.handleEmoji}
                        insertHTML={that.insertHTML.bind(this)}
                        insertVideo={that.insertVideo}
                        fontStyle={() => {
                            if (!this.state.showSubRichTool) {
                                this.setState({
                                    showSubRichTool: true,
                                    toolMarginTop: 50
                                }, () => {
                                    if (!this.state.isTitleEdit) {
                                        this.richText?.current?.scrollMore(140);
                                    }
                                })
                                this._showAnimatePanelView();
                            } else {
                                this._hideAnimatePanelView();
                                setTimeout(() => {
                                    this.setState({
                                        showSubRichTool: false,
                                        toolMarginTop: 0
                                    }, () => {

                                    })
                                }, 300)
                            }


                        }}
                    />
                    {emojiVisible && <EmojiView onSelect={that.insertEmoji} />}
                </KeyboardAvoidingView>
                { this.renderNavPanel()}
                <Loading />
            </SafeAreaView >
        );
    }
}
export default Add;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
    },
    rich: {
        minHeight: 300,
        paddingStart: 5,
        paddingEnd:5,
        flex: 1,
    },
    richBar: {
        height: 50,
        backgroundColor: '#F5FCFF',
    },
    scroll: {
        backgroundColor: '#ffffff',
    },
    item: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#e8e8e8',
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        paddingHorizontal: 15,
    },

    input: {
        flex: 1,
    },

    tib: {
        textAlign: 'center',
        color: '#515156',
    },
})