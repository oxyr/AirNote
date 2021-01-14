//
//  WKWebView+CTMViewCapture_h.h
//  CocoaAsyncSocket
//
//  Created by shang on 2020/12/31.
//

#import <WebKit/WebKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface WKWebView (CTMViewCapture_h)
-(void)CTMContentCaptureCompletionHandler:(void(^)(UIImage*capturedImage))completionHandler;

-(void)CTMContentCaptureWithoutOffsetCompletionHandler:(void(^)(UIImage *capturedImage))completionHandler;

- (void)ZFJContentCaptureCompletionHandler:(void(^)(UIImage *capturedImage))completionHandler;

- (void)ZFJContentCaptureWithoutOffsetCompletionHandler:(void(^)(UIImage *capturedImage))completionHandler;

- (void)CTMContentPageDrawTargetView:(UIView *)targetView index:(int)index maxIndex:(int)maxIndex drawCallback:(void(^)())drawCallback;

@end

NS_ASSUME_NONNULL_END
