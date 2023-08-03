---
layout: post
title: 掌握KeyPaths的用法（从理论到实践），极大提高Swift开发效率
categories: Swift
date: 2021-07-05 19:30:17
permalink: swift/swift-keypaths/
---

作为一门非常强调类型安全的语言，为了让程序员尽量少犯错误，Swift在编译时会进行尽量多的类型检查，因此在设计之初就决定了Swift不能像其他某些语言（比如Objective-C）一样具有很强的动态特性。这篇文章要说的`KeyPath`就是为了类型安全而生的特性之一。

下面主要包括这几个方面的内容：

1.  Keypath是什么
2.  KeyPath的作用，也就是为什么要使用Keypath
3.  KeyPath的使用示例
<!-- more -->
作为一门非常强调类型安全的语言，为了让程序员尽量少犯错误，Swift在编译时会进行尽量多的类型检查，因此在设计之初就决定了Swift不能像其他某些语言（比如Objective-C）一样具有很强的动态特性。这篇文章要说的`KeyPath`就是为了类型安全而生的特性之一。

下面主要包括这几个方面的内容：

1.  Keypath是什么
2.  KeyPath的作用，也就是为什么要使用Keypath
3.  KeyPath的使用示例

![](../images/first/swift-keypath.png)

> 到公众号【iOS开发栈】学习更多Swift、SwiftUI、iOS开发相关内容。

# [](#KeyPath是什么 "KeyPath是什么")KeyPath是什么

首先来看`KeyPath`的定义：

```
class KeyPath<Root, Value>  
```
根据这个定义可以得知`KeyPath`实际是一个类，也就是说当我们看到某个函数参数声明类似`func test(param: KeyPath<Any, Any>)`时，其实只是说`param`参数是`KeyPath`类型的。

具体来说，`KeyPath`类型是一个包含两个范型的类型，这两个范型可能用在类的变量里，也可能用在方法的参数里，至于这两个范型具体是怎么使用的我们由于看不到源码就不得而知了。

> A key path from a specific root type to a specific resulting value type.

这是Apple官方文档给的定义，key path从根类型到结果值类型。

单从这个定义理解是挺晦涩的，下面让我们理解一下它的意思。

# [](#KeyPath的作用 "KeyPath的作用")KeyPath的作用

让我们写一个公众号的类并且创建iOS开发栈的实例：

```
struct OfficialAccount {  
 var name: String  
 var fans: Int  
}  
  
let iosDev = OfficialAccount(name: "ios开发栈", fans: 500)  
```
上面新建了一个名为`OfficialAccount`的公众号类，并创建了一个`iosDev`的实例。

如果我要获取iosDev有多少个粉丝，第一种方法是通过`iosDev.fans`，除此之外还可以用KeyPath来获取属性值：

```
iosDev[keyPath: OfficialAccount.fans]  
```
熟悉OC的同学应该对这个用法很熟悉，在OC中是这样使用的：`[iosDev valueForKey:@"fans"]`，如果经常这样用肯定也遇到过这个用法导致的程序崩溃[ valueForUndefinedKey:]: this class is not key value coding-compliant for the key fans1。

没错Swift中的KeyPath正是为了解决OC这个问题的，正因为有了KeyPath，在Swift中就不需要使用一个字符串来直接访问一个对象，也就避免了UndefinedKey问题。

另外，`KeyPath`也支持链式调用：

```
struct Person {  
 var nickName: String  
 var age: Int  
}  
  
struct OfficialAccount {  
 var name: String  
 var fans: Int  
 var owner: Person  
}  
  
var sza = Person(nickName: "施治昂", age: 30)  
var iosDev = OfficialAccount(name: "ios开发栈", fans: 500, owner: sza)  
iosDev[keyPath: .owner.nickName]  
```
新建一个`Person`类，它拥有姓名、年龄两个属性，公众号类增加`owner`拥有者属性。新建`Person`类示例sza作为iosDev公众号的拥有者。

之后就可以通过`iosDev[keyPath: .owner.nickName]`来获取公众号拥有者的名字了，结果是施治昂。

# [](#KeyPath实践 "KeyPath实践")KeyPath实践

Swift库提供了数组的排序方法`sorted`，比如:

```
let arr = [3, 6, 5, 1]  
let sortedArr = arr.sorted(by: >)  
print(sortedArr) // [6, 5, 3, 1]  
```
有了这个方法确实给开发者提供了很大的便利，但是如果要对`OfficialAccount`的数组排序这个方法就无能为力了。

下面我们利用`KeyPath`给数组`Array`增加一个方法，来给`OfficialAccount`类型的数组排序：

```
extension Array {  
 func sorted<Value>(keyPath: KeyPath<Element, Value>, by areInIncreasingOrder: (Value, Value) throws -> Bool) rethrows -> [Element] {  
 try sorted {  
 try areInIncreasingOrder($0[keyPath: keyPath] , $1[keyPath: keyPath])  
 }  
 }  
}  
  
var sza = Person(nickName: "施治昂", age: 30)  
var iosDev = OfficialAccount(name: "ios开发栈", fans: 500, owner: sza)  
var iosDev2 = OfficialAccount(name: "ios开发栈2", fans: 30, owner: sza)  
let sorted = [iosDev, iosDev2].sorted(keyPath: .fans, by: >)  
print(sorted) // [__lldb_expr_32.OfficialAccount(name: "ios开发栈", fans: 500, owner: __lldb_expr_32.Person(nickName: "施治昂", age: 30)), __lldb_expr_32.OfficialAccount(name: "ios开发栈2", fans: 30, owner: __lldb_expr_32.Person(nickName: "施治昂", age: 30))]  
```
利用扩展给`Array`增加一个`sorted(keyPath:by areInIncreasingOrder:)`方法，这个方法中用到了两个范型类型，其中`Element`是标准库`Array`定义的表示数组中的元素类型（在Swift中数组元素类型相同）；另外新定义了一个范型`Value`用在`KeyPath`中。

新增方法的实现完全是利用Swift标准库中的`sorted(by areInIncreasingOrder:)`方法，与上面对整数排序不同的是这里的两个元素用的是`$0[keyPath: keyPath]`和`$1[keyPath: keyPath]`。

$0和$1表示的是用来比较的两个元素，这两个元素都是实例对象，通过`keyPath`把对象中的属性值取出来之后就满足了标准库中`sorted`函数定义。

同理，我们也可以利用这个方法来进行嵌套类型的排序，比如按照公众号拥有着的年龄对多个公众号排序。

> 到公众号【iOS开发栈】学习更多Swift、SwiftUI、iOS开发相关内容。

# [](#总结 "总结")总结

这篇文章从概念到实战对`KeyPath`做了一个全面的讲解，相信你已经对这个概念有了一定的认识，其实这是Swift中一个非常强大功能，以后遇到了合适的场景就用起来吧。👍