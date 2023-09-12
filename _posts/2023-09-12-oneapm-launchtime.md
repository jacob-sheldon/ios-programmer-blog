---
layout: post
title: 监控 iOS 应用的启动耗时
date: 2023-09-12
permalink: ios/oneapm-launchtime/
---

> 本人找工作中，有iOS坑的话麻烦联系我，微：happy7591

启动过程可以分为 `main` 函数之前，main函数到 `application:didLaunchFinishWithOptions:` ，第一个页面的 `viewDidAppear:` 这三个阶段，为了能够做针对性的优化，我们就需要分别统计这三个阶段的耗时。

## main 函数之前

统计 `main` 函数之前的耗时涉及到两个时间点：应用进程启动、`main` 函数执行。

### 获取 iOS 应用进程创建时间

```
long processStartTime;

/// 进程创建时间
void oneapm_get_process_start_time(void) {
    struct kinfo_proc proc;
    int pid = [[NSProcessInfo processInfo] processIdentifier];
    int cmd[4] = {CTL_KERN, KERN_PROC, KERN_PROC_PID, pid};
    size_t size = sizeof(proc);
    if (sysctl(cmd, sizeof(cmd)/sizeof(*cmd), &proc, &size, NULL, 0) == 0) {
        long seconds =  proc.kp_proc.p_un.__p_starttime.tv_sec;
        processStartTime = seconds;
    }
}
```

这里主要是通过 `sysctl` 函数获取到进程信息并存放在 `proc` 变量中，然后就可以从这个变量中获取到进程的 `starttime` 了。

这里的 `tv_sec` 是精确到秒的时间戳，还有一个具体的微妙，我认为意义不大，就没有使用。

把进程创建时间的秒数存放在 `processStartTime` 中，便于下面的计算。

### 获取 main 函数执行时间

```
int (*oneapm_origin_applicationMain)(int argc, char * _Nullable argv[_Nonnull], NSString * _Nullable principalClassName, NSString * _Nullable delegateClassName);

int oneapm_myApplicationMain(int argc, char * _Nullable argv[_Nonnull], NSString * _Nullable principalClassName, NSString * _Nullable delegateClassName) {
    NSTimeInterval interval = [[NSDate date] timeIntervalSinceDate:[NSDate dateWithTimeIntervalSince1970:processStartTime]];
    NSLog(@"pre-main阶段耗时 = %f", interval);
    return oneapm_origin_applicationMain(argc, argv, principalClassName, delegateClassName);
}

__attribute__((constructor))
void oneapm_hookMain(void) {
    oneapm_get_process_start_time();
    oam_rebind_symbols((struct oam_rebinding[1]){ {"UIApplicationMain", oneapm_myApplicationMain, (void **)&oneapm_origin_applicationMain}}, 1);
}
```

首先创建一个使用 `__attribute__((constructor))` 修饰的函数 `oneapm_hookMain`，这个函数会在 `main` 之前执行。
之后使用 `fishhook` 这个开源库来 hook `UIApplicationMain` 函数，把它的函数实现地址换成自定义的 `oneapm_myApplicationMain`，这样当 `UIApplicationMain` 执行的时候，实际被调用的就是自己实现的这个函数了。

> 关于 `fishhook` 是怎么做到能够替换 C 函数的，这里不做详细说明。简单来说 `fishhook` 利用了动态库的链接需要用到内存中两个 _section 段中存储的函数地址，然后它根据函数名把内存地址换乘了自定义的函数所在的地址。相关源码分析的文章也有很多，可以去搜一下，这个项目的代码很少，也可以自己看源码，不懂的地方可以直接问 ChatGPT。

这里还需要注意的是，我们修改了 `UIApplicationMain` 函数的执行，所以就不会调用到 UIKit 中的实现了，这显然是不行的，所以还需要在执行完自己的逻辑（这里就是统计时间）以后再去调用原来的函数。

`oam_rebind_symbols` 的 `oneapm_origin_applicationMain` 参数就是记录了原来的函数地址，然后在 `oneapm_myApplicationMain` 最后面调用它。

然后就是计算从进程启动到执行到 `UIApplicationMain` 所用的时间了，我自己在一个空项目里面测试的时间大概在 0.5s 到 1s 之间。其实这个时间还是挺长的，这也许就是 Apple 不断优化项目启动耗时的原因了。点击应用图标之后的那个动画也确实很大程度上掩盖了这个问题。

如果项目中这个耗时比较长，那就需要对动态库、`+load` 方法、类/分类 等内容进行处理了。

> 这里我用的是 hook `UIApplicationMain`，其实如果能直接 hook `main` 函数更好，但是我没有成功。还有一个办法是通过分析 MachOView 可以得到项目的入口点 `LC_MAIN`，然后可以通过修改 `entry_point_command` 的 `entryoff` 来让它执行我们自定义的函数，我也没有成功。所以最后就采用了现在的方案。

### 统计 +load 方法的耗时

这段代码可以统计项目中所有类和分类的 `+load` 方法耗时。

```
#import <Foundation/Foundation.h>
#import <objc/runtime.h>

typedef void (*ClassMethodIMP)(Class, SEL);

// 递归遍历所有类及其子类
static void oneapm_hookAllLoadMethods(void) {
    // 递归遍历子类
    Class *subclasses = NULL;
    int numSubclasses = objc_getClassList(NULL, 0);
    if (numSubclasses > 0) {
        subclasses = (__unsafe_unretained Class *)malloc(sizeof(Class) * numSubclasses);
        numSubclasses = objc_getClassList(subclasses, numSubclasses);
        for (int i = 0; i < numSubclasses; i++) {
            Class class = subclasses[i];
            NSString *className = NSStringFromClass(class);
            Class metaClass = objc_getMetaClass(object_getClassName(class));
            
            // 这样来区分是自己的类
            if ([className hasPrefix:@"XYZ"]) {
                unsigned int outCnt = 0;
                Method *methods = class_copyMethodList(metaClass, &outCnt);
                for (int i = 0; i < outCnt; i++) {
                    Method m = methods[i];
                    SEL methodSelector = method_getName(m);
                    NSString *methodName = NSStringFromSelector(methodSelector);
                    if ([methodName isEqualToString:@"load"]) {
                        ClassMethodIMP methodIMP = (ClassMethodIMP)method_getImplementation(m);
                        // 记录方法执行前的时间戳
                        NSDate *start = [NSDate date];
                        methodIMP(metaClass, methodSelector);
                        // 计算耗时
                        NSTimeInterval executeTime = -[start timeIntervalSinceNow];
                        NSLog(@"Class %@ +load method took %.4f seconds to execute", NSStringFromClass(class), executeTime);
                    }
                }
            }
        }
        free(subclasses);
    }
}

__attribute__((constructor))
static void oneapm_hook_all_load(void) {
    oneapm_hookAllLoadMethods();
}
```

主要的思路就是通过获取项目中所有的类的元类，然后拿到元类中的 `+load` 方法，通过在直接调用方法的实现前后统计时间，就能得到耗时了。

因为获取所有的类里面会包含所有的系统类，直接把系统类的 `+load` 方法也进行统计的话没有意义，而且会增加很多的耗时，系统类大概会有2300多个。所以我这里通过类的前缀 "XYZ" 来区分自己的类。*这只是一个临时的办法，我暂时没有找到怎么获取系统中自定义类的方式，如果你知道麻烦告诉我。*

在调用 `+load` 方法时需要用元类调用，并且需要循环元类的所有方法，因为可能有分类重写了 `+load` 方法，并且实际项目启动时所有的 `+load` 方法都会执行，所以分类中的也需要被统计。

## Hook AppDelegate

在项目启动阶段，大多数项目中都会把一些全项目都会用到的东西放到 `application:willFinishLaunchingWithOptions:` 或者 `application:didFinishLaunchingWithOptions:` 中，而这很可能会导致启动速度变慢，所以这两个方法的耗时应该被统计。

### 使用 `Aspects` 

> 这种方式我们成功

要使用 `Aspects` hook 一个实例方法需要使用类的一个实例，而 `AppDelegate` 的创建是在 `main` 函数中通过调用 `UIApplicationMain` 函数来完成的，当这个函数执行时，整个项目就开始了 runloop，所以没有办法在这个函数执行结束后拿到 `AppDelegate` 的实例。

如果采用在 `AppDelegate` 类中重写 `init` 的方式来使用 `Aspects` hook 这两个实例方法的话，应该是可行的。但是对项目就有侵入了，不太优雅。

### runtime 修改方法实现

目前我采用的是通过 runtime 修改这两个方法的实现。

```
IMP _oam_willFinishOriginalImp;
IMP _oam_didFinishOriginalImp;

NSDate *_oam_before_willFinish_time;
extern NSDate *_oam_after_DidFinish_time;

static void __OAM_Application_WillFinishLaunchingWithOptions(id self, SEL selector, UIApplication *application, NSDictionary *launchOptions) {
    _oam_before_willFinish_time = [NSDate date];
    // 调用原始方法的实现
    ((void (*)(id, SEL, UIApplication *, NSDictionary *))_oam_willFinishOriginalImp)(self, selector, application, launchOptions);
}

// Hook before willFinishLaunchingWithOptions and after didFinishLaunchingWithOptions to calculate this time used in this two methods
__attribute__((constructor))
void oam_hook_appdelegate(void) {
    // willFinish
    Class appDelegate = NSClassFromString(@"AppDelegate");
    SEL willFinish = @selector(application:willFinishLaunchingWithOptions:);
    _oam_willFinishOriginalImp = class_getMethodImplementation(appDelegate, willFinish);
    
    Method willFinishMethod = class_getInstanceMethod(appDelegate, willFinish);
    const char *willFinishTypeEncoding = method_getTypeEncoding(willFinishMethod);
    class_replaceMethod(appDelegate, willFinish, (IMP)__OAM_Application_WillFinishLaunchingWithOptions, willFinishTypeEncoding);
}
```

为了缩小篇幅，这里只展示了处理 `willFinish`，另外一个同样的逻辑。

其实原理很简单，通过 `class_replaceMethod` 把方法的实现修改成自定义的函数实现，然后在自定义的实现中再调用原来的实现。

需要注意的就是自定义的实现也需要接收同样的参数，包括 `self`；在调用原来的实现时就使用代码中的格式就可以了。

## Hook 第一个页面的 viewDidAppear

这一步也很简单，通过在 `UIViewController` 的 `+load` 方法中把 `viewDidAppear` 跟自定义的方法进行交换实现就可以了。

```
static BOOL _oam_firstPageShow;

+ (void)load {
    // ... 此处省略交换实现的代码
}

- (void)oam_viewDidAppear:(BOOL)animated {
    // 在这里可以添加你的自定义逻辑
    if (_oam_firstPageShow) return;
    NSTimeInterval interval = [[NSDate date] timeIntervalSinceDate:_oam_after_DidFinish_time];
    NSLog(@"first page show time: %f", interval);
    
    // 调用原始的viewDidAppear方法
    [self oam_viewDidAppear:animated];

    _oam_firstPageShow = YES;
}
```

这里统计的是从 `application:didFinishLaunchWithOptions` 到第一个页面的 `viewDidAppear` 的时间。

需要注意的就是只需要统计第一个页面，所以用了一个 `_oam_firstPageShow` 来进行记录。

## 总结

上面包括了统计 ios 项目的启动阶段耗时的三大阶段，在其中用到了 runtime 和对 Mach-O 文件的理解，要做到灵活应用还是挺难的。
有很多文章讲这方面的东西，但是基本都是只有思路，我这里直接贴出来了代码，更方便讨论学习。

我目前打算把 iOS APM 性能监控相关的功能都集成到一个库里面，目前是完成了这个启动时长统计的部分，代码放在了 [OneAPM 的 Github 仓库](https://github.com/jacob-sheldon/OneAPM)里面。如果对你有帮助的话，请不要吝惜你的点赞。

> 本人找工作中，有iOS坑的话麻烦联系我，微：happy7591