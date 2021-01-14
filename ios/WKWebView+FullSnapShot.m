//
//  WKWebView+FullSnapShot.m
//  react-native-webview
//
//  Created by shang on 2020/12/31.
//

#import "WKWebView+FullSnapShot.h"

@implementation WKWebView (FullSnapShot)
-(void) asyncTakeSnapshotOfFullContent:(void (^)(UIImage * _Nonnull))completionHandler
{
    CGPoint originalOffset = self.scrollView.contentOffset;
    float pageNum = 1;
    if(self.scrollView.contentSize.height > self.scrollView.bounds.size.height)
    {
        pageNum = (floorf(self.scrollView.contentSize.height / self.scrollView.bounds.size.height));
    }
    UIGraphicsBeginImageContextWithOptions(self.scrollView.contentSize,true,0);
    UIGraphicsGetCurrentContext();
    [[UIColor whiteColor] setFill];
    [[UIColor whiteColor] setStroke];
    [self loadPageContent:0 maxIndex:pageNum drawCallback:^{
        UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        self.scrollView.contentOffset = originalOffset;
        completionHandler(image);
    }];
    
}
-(void) loadPageContent:(int)index maxIndex:(int)maxIndex drawCallback:(void(^)(void))drawCallback
{
    [self.scrollView setContentOffset:CGPointMake(0, (index*self.frame.size.height)) animated:false];
    CGRect pageFrame = CGRectMake(0, (CGFloat)(index)*self.frame.size.height, self.scrollView.bounds.size.width, self.scrollView.bounds.size.height);
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self.scrollView drawViewHierarchyInRect:pageFrame afterScreenUpdates:YES];
        
        if(index<maxIndex){
            [self loadPageContent:index + 1 maxIndex:maxIndex drawCallback:drawCallback];
        }else{
            drawCallback();
        }
    });
}
@end
