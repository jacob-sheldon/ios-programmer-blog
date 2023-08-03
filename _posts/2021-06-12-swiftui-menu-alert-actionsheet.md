---
layout: post
title: SwiftUI弹窗大全：Menu/Alert/ActionSheet
categories: SwiftUI
date: 2021-06-12 18:31:50
permalink: swiftui/menu-alert-actionsheet/
---

一个iOS应用中必然会有很多的弹窗，UIKit中的弹窗主要是`UIMenuController`、`UIAlertView`和`UIActionController`，到了SwiftUI框架中也有对应的弹窗，它们分别是`contextMenu`、`alert`和`actionSheet`三个[ViewModifier(视图修改器)](https://www.iosprogrammer.tech/swiftui/swiftui-concept-essential/#Modifer)。
<!-- more -->
![](../../images/swiftui-popupview/first.png)

到公众号【iOS开发栈】学习更多SwiftUI、iOS开发相关内容。

# [](#contextMenu "contextMenu")contextMenu

```
/* 下面两种方式是等价的 */  
  
// 第一种方式  
let menu = ContextMenu {   
}  
  
Button("1", action: {})  
 .contextMenu(menu)  
  
// 第二种方式  
Image(systemName: "square.and.arrow.up")  
  .contextMenu {  
    Button("1", action: {})  
 }  
```
`contextMenu`两种初始化方式对应上面例子中的两种方式，第一种`public func contextMenu<MenuItems>(_ contextMenu: ContextMenu<MenuItems>?) -> some View where MenuItems : View`是用一个`ContextMenu`实例作为参数；第二种`public func contextMenu<MenuItems>(@ViewBuilder menuItems: () -> MenuItems) -> some View where MenuItems : View`的参数是一个使用`@ViewBuilder`修饰的闭包。

```
public struct ContextMenu<MenuItems> where MenuItems : View {
  public init(@ViewBuilder menuItems: () -> MenuItems)
}
```
由`ContextMenu`的初始化方法可以看出，要初始化这个类也是需要一个用`@ViewBuilder`修饰的闭包，所以上面的两种`menuContext`使用方式并没有本质区别。或者说第二种是第一种的简便方法，类似于这样的用法在SwiftUI中有很多。

下面是一个完整的例子：

![](../../images/swiftui-popupview/menuview.png)

长按”Context Menu”文本后会弹出一个Menu菜单，其中每个选项都是一个按钮，因为这是一个示例程序所以按钮的事件没有写，在你的项目中可以加上对应的事件。

# [](#alert "alert")alert

![](../../images/swiftui-popupview/alert.png)
```
@State var presentAlert: Bool = false

Button {
 presentAlert = true
} label: {
  Text("Show Alert")
}

.alert(isPresented: $presentAlert) {  
  let alert = Alert(title: Text("Alert Test"), message: Text("This is a test case"),       primaryButton: .default(Text("Sure")), secondaryButton: .destructive(Text("Cancel")))  
   
  return alert  
}
```  

`alert`这个视图修改器接受两个参数，第一个是`Binding<Bool>`类型，我们可以通过在一个被`@State`属性包装器包装的属性前加`$`来作为这个参数，详情可以参考[属性包装器和@State](https://www.iosprogrammer.tech/swiftui/swiftui-concept-essential/#State%E5%92%8C-%E2%80%94%E2%80%94-Binding-Value)

第二个参数是一个返回值是`Alert`类型的闭包，因此我们这里需要创建一个Alert的示例作为返回值。

# [](#actionSheet "actionSheet")actionSheet

![](../../images/swiftui-popupview/actionSheet.png)
```
@State var presentAlert: Bool = false  
  
Button {  
  presentAlert = true  
} label: {  
  Text("Show Alert")  
}  

.actionSheet(isPresented: $presentAlert) {  
  let actionSheet = ActionSheet(title: Text("Test ActionSheet"), message: Text("This is a test") , buttons: [.default(Text("Sure Item")), .default(Text("Sure Item2")), .destructive(Text ("Cancel"))])  
  return actionSheet  
}  
```
`actionSheet`和上面的`alert`用法非常相似，第一个参数是一个`Binding<Bool>`类型的变量，`presentAlert`是一个被`@State`属性包装器包装的Bool类型变量，在这个变量前面加`$`可以生成一个Binding类型的变量。

第一个参数是一个返回值是`ActionSheet`类型的闭包，因此需要创建这个类型的实例并将它作为返回值。`buttons`参数是一个`ActionSheet.Button`类型的数组，因为这是一个实例程序，Button并没有添加任何的事件，如果需要可以自行添加。

到公众号【iOS开发栈】学习更多SwiftUI、iOS开发相关内容。

# [](#总结 "总结")总结

这篇文章对SwiftUI框架中的`contextMenu`、`alert`和`actionSheet`做了全面的说明，你现在对这3种弹窗肯定有了全面的认识，那就在项目中用起来吧。👍