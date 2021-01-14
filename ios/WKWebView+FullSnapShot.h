//
//  WKWebView+FullSnapShot.h
//  react-native-webview
//
//  Created by shang on 2020/12/31.
//

#import <WebKit/WebKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface WKWebView (FullSnapShot)
-(void)asyncTakeSnapshotOfFullContent:(void(^)(UIImage*capturedImage))completionHandler;
@end

NS_ASSUME_NONNULL_END
