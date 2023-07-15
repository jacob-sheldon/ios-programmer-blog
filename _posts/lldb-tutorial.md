---
layout: post
title: lldb 启动、添加断点、调试、终止
date: 2022-03-27 19:42:43
categories: 计算机基础
permalink: cs/lldb-tutorial/
---

开发过程中基本都是在使用 IDE（Xcode）软件，IDE 里面集成了一整套开发工具链，虽然用起来非常方便，但是也让开发者丧失了接触具体工具的机会，而且 IDE 在很多的情况下都是阉割了工具的一些功能来达到方便的目的。因此直接学习某个工具可以让我们更好的了解整个开发过程，也可以更深入的利用工具的能力。

本文就学习 LLDB 这个调试工具的用法，主要包括这几个部分：

1. 使用 LLDB 启动程序
2. 打断点和分步调试
3. 设置监测点（watch point)

<!-- more -->

<iframe src="//player.bilibili.com/player.html?bvid=BV1Ar4y1p7J3&page=1" style="width:100%;height: 400px" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

# 启动程序

要想对一个程序进行调试就必须在 debug 模式下编译该程序，不同的编译工具命令也不同，下面是 gcc 和 clang 命令行：

```
gcc(clang) -g 
```

编译之后就可以使用 lldb 启动程序了：

```
lldb  a.out
```

这样就进入了 lldb 命令中，要运行程序可以使用：

```
(lldb) run
(lldb) r
```

上面的第 2 行是第 1 行的快捷方式，下面还有类似用法不再进行说明。

# 设置断点

设置断点的方式可以分为在源码的某一行加断点和根据符号（方法名）加断点。

```
// 某行加断点
// # 表示行号
(lldb) breakpoint set -f lldb_sample.c -l #
(lldb) br s -f lldb_sample.c -l #
(lldb) b lldb_sample.c : #

// 给方法名加断点
(lldb) b [方法名]
```

# 操作断点

列出所有已添加断点

```
// br 是 breakpoint 的简写
(lldb) br list
```

删除断点

```
// 删除某个断点，# 可以从列出断点中查到
(lldb) br del #

// 删除所有断点
(lldb) br del
```

# 分步调试

跳过，是指跳过对其他方法的调用
```
(lldb) next
(lldb) n
```

进入，进入被调用方法内部
```
(lldb) step
(lldb) s
```

继续执行，直到下一个断点处或程序末尾
```
(lldb) c
```

# 查看变量

打印变量内容
```
(lldb) p varName
```

列出当前栈帧变量
```
(lldb) frame variable
(lldb) fr v
```

切换栈帧
```
(lldb) frame select #
(lldb) fr s
```

调用栈
```
(lldb) bt
```

# 使用监视断点

！只有在程序运行过程中才能使用监视断点。

给全局变量设置监视断点
```
(lldb) watchpoint set variable [some globalVariable]
(lldb) watchpoint set variable -w read | write | read_write [some globalVariable]
```

给局部变量（自动变量）设置监视断点
```
(lldb) b main
(lldb) w s v d.memberVar
```

# 终止调试

终止当前进行，强制结束程序执行，但是仍保留在 lldb 中
```
(lldb) kill
```

退出 LLDB
```
(lldb) quit (cmd-d)
```
