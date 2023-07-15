---
layout: post
title: 解密SwiftUI中@ViewBuilder的黑暗魔法
categories: SwiftUI
date: 2021-07-03 17:02:04
permalink: swiftui/viewbuilder/
---

在SwiftUI框架中使用很多的注解，虽然使语法看上去非常简洁，但是增加了初学者的理解难度，这篇文章我们来看一下`@ViewBuilder`的相关知识。主要包括以下内容：

1.  `resultBuilder`/`functionBuilder`是什么以及用法
2.  `ViewBuilder`结构体
3.  `@ViewBuilder`修饰符的用法
4.  使用`@ViewBuilder`完成一个自定义视图
<!-- more -->
在SwiftUI框架中使用很多的注解，虽然使语法看上去非常简洁，但是增加了初学者的理解难度，这篇文章我们来看一下`@ViewBuilder`的相关知识。主要包括以下内容：

1.  `resultBuilder`/`functionBuilder`是什么以及用法
2.  `ViewBuilder`结构体
3.  `@ViewBuilder`修饰符的用法
4.  使用`@ViewBuilder`完成一个自定义视图

到公众号【iOS开发栈】学习更多SwiftUI、iOS开发相关内容。

# [](#resultBuilder注解 "@resultBuilder注解")`@resultBuilder`注解

`@resultBuilder`是在Swift5.4添加的，之前是叫`@_functionBuilder`，在这里我们可以简单了解一下它的作用。

一个类、结构体添加`@resultBuilder`注解时必须包含至少一个`buildBlock`方法，并且这个方法是`static`静态的。这个方法可以接收0个或多个参数，在函数内部确定了参数的组成形式。

比如下面这个例子：

```
@resultBuilder struct StringBuilder {  
  static func buildBlock(_ string1: String, _ string2: String, _ string3: String) -> String {  
    string1 + " - " + string2 + " - " + string3  
  }  
}  
  
func test(@StringBuilder strings: () -> String) {  
  print(strings())  
}  
  
test {  
  "1"  
  "2"  
  "3"  
}  
```
`StringBuilder`是一个字符串构建者结构体，里面的`buildBlock`方法接收3个参数，并且在3个参数中间插入” - “作为函数的返回值。

`test`函数接收一个使用`@StringBuilder`修饰的名为`strings`的闭包作为参数，函数体是调用这个闭包并打印到控制台。

最后使用3个字符串作为参数调用`test`函数，执行这段代码后会得到”1 - 2 - 3”的输出结果

# [](#ViewBuilder定义 "@ViewBuilder定义")`@ViewBuilder`定义

先来看`ViewBuilder`的定义：
```
@resultBuilder struct ViewBuilder  
```
`ViewBuilder`本质上是一个结构体，并且被`@resultBuilder`注解，也就是说`ViewBuilder`是一个reult builder（结果建造者）类型了。

`ViewBuilder`结构体有11个名为`buildBlock`的函数，分别接收从0到10个`View`类型的参数，因此在SwiftUI中一个接收`@ViewBuilder`类型参数的视图容器最多能接收10个子视图，如果不能满足需求可以通过拆分来增加子视图的个数。

# [](#ViewBuilder的用法 "@ViewBuilder的用法")`@ViewBuilder`的用法

使用`@resultBuilder`注解`ViewBuilder`结构体后，就可以用`@ViewBuilder`修饰闭包，这个闭包可以接收多个指定类型的对象，而这些对象会按照`buildBlock`函数的实现进行组织。

> A custom parameter attribute that constructs views from closures.

这是Apple的官方文档对ViewBuilder的定义，简单来说ViewBuilder就是一个包含多个视图的闭包。

在SwiftUI框架中，所有的容器视图都是使用`@ViewBuilder`来修饰最后一个参数，因此这些容器视图可以接受多个子视图作为参数。比如`HStack`/`VStack`/`ScrollView`等。

```
// HStack  
public struct HStack<Content> : View where Content : View {  
 ...  
  
  @inlinable public init(alignment: VerticalAlignment = .center, spacing: CGFloat? = nil, @ViewBuilder content: () -> Content)  
  
  ...  
}  
```
这是`HStack`的初始化方法，其中前面的几个参数都是可选项，它们不在本篇文章的讨论范围内。

它的最后一个参数`content`的类型是一个返回值为Content的闭包，单看`()->Content`是一个没有参数的闭包，但是前面使用了`@ViewBuilder`修饰，这就是一个可以接收多个视图的闭包了，最终看起来像是这样的：`(view1: Content, view2: Content....) -> Content`。

下面我们通过自定义一个视图来看`@ViewBuilder`的用法。

# [](#实践 "实践")实践

下面通过实现一个自定义的容器视图来展示`@ViewBuilder`的用法：

![@ViewBuilder示例](../../images/viewbuilder/containerview.png)

自定义一个继承自`View`名为`CustomContainerView`的视图，它仅有一个接收`@ViewBuilder`类型参数的初始化方法，并使用常量`content`接收这个参数。

在`body`中构建当前视图：`@ViewBuilder`中可能包含多个子视图，因此使用`VStack`把这些子视图纵向排列，之后使用多个[视图修改器](https://www.iosprogrammer.tech/swiftui/swiftui-concept-essential/#Modifer)自定义子视图的外观。

在源文件的第29行，`ContentView`中创建了`CustomContainerView`并给它传递了3个`Text`子视图。通过Xcode右侧的即时预览可以看到这三个子视图正是以我们在`CustomContainerView`中要求的方式展现出来——纵向排列、绿色的背景色、红色的文字颜色等。

到公众号【iOS开发栈】学习更多SwiftUI、iOS开发相关内容。

# [](#总结 "总结")总结

至此，关于`@ViewBuilder`的相关知识基本都涉及到了，相信通过本篇文章的学习你一定也对它有了一个非常全面的掌握，那么赶快到实战项目中用起来吧👍。