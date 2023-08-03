---
layout: post
title: 全面了解 Objective-C 语言
categories: iOS
date: 2022-05-24 12:58:33
permalink: ios/objective-c/
---

# 全面了解 Objective-C 语言

到了2022年大多数iOS应用开发都开始用Swift了，不过 Objective-C 仍然是无法完全避开的，尤其是对于一些稍有规模的应用来说，需要用到好多三方库，而有一些三方库并没有Swift版本的。所以掌握 Objective-C 对于iOS开发还是很有必要的。

从基础开始全面了解一个技术的方方面面才能更好的掌握它，而最全面的资料就非官方文档莫属了。

这篇文章就是根据苹果的官方文档[Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html#:~:text=Objective%2DC%20is%20the%20primary,capabilities%20and%20a%20dynamic%20runtime.)写的，其中主要涉及了几个比较重要的知识点。

如果你对下面这几个问题并不确定，强烈建议耐心读完这篇文章：

- Objective-C 中的类也是对象
- 

## Objective-C 语言定义

Objective-C 是 C 语言的超集，除了拥有和 C 语言相似的控制流、基本类型和语法之外，增加了面向对象和动态运行时。

有了这个定义，下面我们来看 Objective-C 的具体语法。

## 定义类

### 类和对象

和其他面向对象语言一样，Objc 中的**对象用来包装数据和行为**。**对象是类的实例**。

每个对象有自己的数据内容，但是它们同享类的行为（方法）。

Objc 的类中有些是不可变的，如 NSString/NSArray等，它们有可变的版本，如 NSMutableString/NSMutableArray

### 继承

如果一个（子）类继承自另一个（父）类那么子类得到父类所有的方法和属性，子类可以增加方法/属性或者重写父类的方法。

Objc 提供了一个基类 `NSObject`，当需要自定义类的时候至少继承自 `NSObject`，尽量继承自更合适的子类或子类的子类。

子类不仅会继承父类中所有的属性和方法，还会把整个继承链中所有类的属性和方法都继承过来。

### 接口和实现

接口是用来定义需要暴露给其他对象的属性和行为的，实现是具体的做法，需要隐藏起来。

Objc 中接口和实现分为不同的文件，接口以 `.h` 接口，实现以 `.m` 结尾。

#### 接口

定义接口的语法：

``` objc
@interface SimpleClass : NSObject
    
@end
```

`SimpleClass` 类的定义中没有提供任何的属性和行为，不过由于它继承自 `NSObject` ，其他对象可以访问它继承过来的属性和方法。下面看一个复杂的接口定义：

``` objc
@interface XYZPerson : NSObject
    
@property (nonatomic, copy, readonly) NSString *name;
@property (nonatomic, assign) int age;

- (void)write;
- (NSString *)say:(NSString *)word volumn:(CGFloat)volumn;
    
@end
```

`XYZPerson`类继承自 `NSObject` 并且它提供了自己的属性和方法。`@property` 用来定义属性，属性可以是对象类型和基本类型的，对象类型的需要使用指针（*）表示，基本类型就和 C 语言的基本类型一样。

属性可以指定修饰符。OC 包含很多修饰符，大体上可以分为线程相关、内存管理相关和访问相关。

| 分类         | 举例                            | 说明                                                         |
| ------------ | ------------------------------- | ------------------------------------------------------------ |
| 线程相关     | `nonatomic` `atomic`            | `atomic` - 原子性<br />`nonatomic` - 非原子性                |
| 内存管理相关 | `copy` `strong` `assign` `weak` | `copy` - 复制<br />`strong` - 强引用<br />`weak` - 弱引用<br />`assign` - 基本数据类型 |
| 访问相关     | `readonly`  `readwrite`         | `readonly` - 只读，不能修改<br />`readwrite` - 可读可写，默认 |

OC 中的方法可以定义比较特性独行，`XYZPerson` 中定义了两个方法`write`和`say:valumn`。

方法以`-`开头，后面是用`()`包围的返回值，再是方法签名。可以有参数也可以没有参数，有参数的话使用`:`分隔，多个参数之间用空格分隔。方法名通常以小写字母开头并且遵守驼峰命名法，如：`thisIsMethod`

#### 实现

类实现的语法：

``` objc
#import "XYZPerson.h"

@implementation
    
- (void)write
{
    // something
}

- (NSString *)say:(NSString *)word volumn:(CGFloat)volumn
{
    // something
}

- (void)internalMethod
{
    // something
}
    
@end
```

实现文件中需要导入接口文件:`#import "XYZPerson.h"` 实现内容在 `@implementation` 和 `@end` 之间，其中**必须包含所有接口中定义的方法和可选任意数量私有方法**。

### 类本身也是对象

OC 中的类本身也是对象，叫做**类对象**。类对象不能定义属性，但是可以定义方法（类方法）接受消息。比如 `NSString` 类对象中就包括很多类方法：

``` objc
+ (id)string;
+ (id)stringWithString:(NSString *)aString;
```

类方法以 `+` 开头，返回值和参数和对象方法相同，类方法使用类名调用 `[NSString string]`。类方法的实现和实力方法相同。

## 对象





## 总结

本文章的内容大多数来自苹果的官方文档[Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html#:~:text=Objective%2DC%20is%20the%20primary,capabilities%20and%20a%20dynamic%20runtime.)，建议通读。
