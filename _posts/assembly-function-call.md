---
layout: post
title: 汇编分析函数调用
categories: 计算机基础
date: 2021-12-18 17:33:37
permalink: cs/analyse-function-call-using-assembly/
---

通过对汇编的分析可以了解程序的执行本质，对分析问题有很大的帮助，尤其在无法阅读源码的情况下更加有用。最近我刚阅读了《深入理解计算机系统（CSAPP）》的第三章，这一章主要讲解汇编的知识。为了对自己的学习有一个总结，并且给对汇编不甚了解的同学一点启发，所以有了这篇关于汇编的文章。

通过分析函数调用过程可以了解整个汇编的全貌，并且对实际的编程工作也有最大的作用。所以，让我们从一个简单的递归调用函数进入汇编的世界吧。
<!-- more -->
通过对汇编的分析可以了解程序的执行本质，对分析问题有很大的帮助，尤其在无法阅读源码的情况下更加有用。最近我刚阅读了《深入理解计算机系统（CSAPP）》的第三章，这一章主要讲解汇编的知识。为了对自己的学习有一个总结，并且给对汇编不甚了解的同学一点启发，所以有了这篇关于汇编的文章。

通过分析函数调用过程可以了解整个汇编的全貌，并且对实际的编程工作也有最大的作用。所以，让我们从一个简单的递归调用函数进入汇编的世界吧。

> 到公众号【iOS开发栈】学习更多SwiftUI、iOS开发相关内容。

![](../../images/first/assemb-recurse-call.png)

# [](#C语言表示 "C语言表示")C语言表示

用C语言计算0到20的整数之和： 

```
#include <stdio.h>  
  
int add(int start, int max) {  
 if (start == max) {  
 return max;  
 }  
 return start + add(start + 1, max);  
}  
  
int main(int argc, char const *argv[])  
{  
 int result = add(0, 20);  
 printf("result = %d\n", result);  
 return 0;  
}
```

`add`是一个递归函数，用来计算`start`到`max`的整数之和。`main`函数中调用`add`函数计算0到20的和，并输出到控制台。

把上面的代码保存到文件`recursion.c`文件。

# [](#生成汇编 "生成汇编")生成汇编

通过gcc生成汇编:
```
gcc -S recursion.c  
```
执行上面命令，获取到的汇编如下： 

```
_add:                                   ## @add  
pushq%rbp  
movq%rsp, %rbp  
subq$16, %rsp  
movl%edi, -8(%rbp)  
movl%esi, -12(%rbp)  
movl-8(%rbp), %eax  
cmpl-12(%rbp), %eax  
jneLBB0_2  
movl-12(%rbp), %eax  
movl%eax, -4(%rbp)  
jmpLBB0_3  
LBB0_2:  
movl-8(%rbp), %eax  
movl%eax, -16(%rbp)                 ## 4-byte Spill  
movl-8(%rbp), %edi  
addl$1, %edi  
movl-12(%rbp), %esi  
callq_add  
movl%eax, %ecx  
movl-16(%rbp), %eax                 ## 4-byte Reload  
addl%ecx, %eax  
movl%eax, -4(%rbp)  
LBB0_3:  
movl-4(%rbp), %eax  
addq$16, %rsp  
popq%rbp  
retq  
_main:                                  ## @main  
pushq%rbp  
movq%rsp, %rbp  
subq$32, %rsp  
movl%edi, %eax  
xorl%edi, %edi  
movl$0, -4(%rbp)  
movl%eax, -8(%rbp)  
movq%rsi, -16(%rbp)  
movl$20, %esi  
callq_add  
movl%eax, -20(%rbp)  
movl-20(%rbp), %esi  
leaqL_.str(%rip), %rdi  
movb$0, %al  
callq_printf  
xorl%eax, %eax  
addq$32, %rsp  
popq%rbp  
retq
```

上面的内容是精简过的，去掉了一些说明性的内容，对实际的效果没有任何影响。

`_add`和`_main`标签表示函数段开始，`LBB0_2`和`LBB0_3`是汇编语言生成的标签，用来进行跳转；剩下的都是汇编指令。

# [](#main函数 "main函数")main函数

`main`函数我们只看和`add`函数有关的部分：
```
_main:  
...  
xorl%edi, %edi  
movl$0, -4(%rbp)  
movl$20, %esi  
callq_add  
...  
```
`xorl %edi, %edi`用来把edi寄存器的值设为0，其中`xor`表示异或操作，而两个相同的数异或的值等于0，而`xorl`中的`l`表示整数。

`movl $0, -4(%rbp)`——rbp-4表示一个内存地址，`movl`表示把整数0移动到内存rbp-4。

`movl $20, %esi`——把20放到esi寄存器中。

`call`表示函数调用，`_add`是C语言中add函数的汇编标签。

# [](#add函数 "add函数")add函数
```
movl%edi, -8(%rbp)  
movl%esi, -12(%rbp)  
movl-8(%rbp), %eax  
```
通过上面main函数的分析得知edi寄存器中保存的整数0，esi寄存器中放的是整数20。而通过1、3行`movl`操作后，把0放到了eax寄存器中；第2行中把20放到了内存地址rbp-12。
```
cmpl-12(%rbp), %eax  
jneLBB0_2  
```
`cmp`是英文单词compare的缩写，也就是比较的意思。因此第1行是比较内存地址rbp-12和寄存器eax中的值。`j`是`jump`的缩写，`ne`是`not equal`的缩写，`jne`表示如果不想等就跳转，而跳转的目的是`LBB0_2`标签。

而在整个`add`函数的递归过程中，之前几次都是不想等的，那我们继续看不相等的时候跳转到`LBB0_2`段。
```
movl-8(%rbp), %eax  
movl%eax, -16(%rbp)                 ## 4-byte Spill  
movl-8(%rbp), %edi  
addl$1, %edi  
movl-12(%rbp), %esi  
callq_add  
```
第6行的又调用了`add`函数，而第4行、第5行是准备函数参数。

`addl $1, %edi`——edi寄存器中的值加1后放回edi寄存器。

从上面的分析可以看出edi和esi两个寄存器用做参数传递。

整个递归过程是通过使用`jne`命令比较两个整数的大小，如果不想等就跳转到`LBB0_2`标签，而在这个标签中又重新回到了`add`函数最开始的地方。直到edi和esi中保存的两个整数相等为止。
```
movl-12(%rbp), %eax  
movl%eax, -4(%rbp)  
jmpLBB0_3  
```
esi和edi的值相等时，取出rbp-12内存地址中的值放入eax寄存器，再把eax寄存器的值放入rbp-4内存中。之后跳转到`LBB0_3`标签处。

```
movl-4(%rbp), %eax  
addq$16, %rsp  
popq%rbp  
retq  
```
第2行和第3行是还原函数调用栈——为了控制文章篇幅，省略这个知识点，有兴趣的话可以留言，以后再讲。

第1行是把rbp-4内存中保存的内容放入eax，也就是把函数的返回值放入eax。——eax寄存器通常用来保存函数返回值。

上面提到，edi寄存器存放start变量值，esi存放max变量值。这样就很容易可以得到，内存地址ebp-8和ebp-16中存放的是start变量，其中ebp-16只用来保存最新的start值；ebp-12存放的是max变量。

这里有一个地方需要注意：ebp中存放的内存地址在整个递归过程中是不断变化的。递归过程实际是在不断的进行函数调用，每次进行函数调用都会产生新的调用栈，那就会更新ebp中存放的地址值。随着ebp中存放的地址值改变，每一个新的start值都被放到了不同的内存地址中。

当结束条件（start == max）得到满足，递归结束。此时start的值等于max，调用跳转到LBB0_3中遇到了`ret`命令，当前的调用栈被返回，也就是继续执行`callq _add`下面的汇编代码。

```
movl%eax, %ecx  
movl-16(%rbp), %eax                 ## 4-byte Reload  
addl%ecx, %eax  
movl%eax, -4(%rbp)  
```
这里进行一些内容的交换之外，主要把最新的start值加上之前得到的start+max的和。而在这里由于没有跳转命令，所以会继续执行`LBB0_3`中的内容，进而不断的`ret`出栈。

最终，把所有递归调用栈都ret完以后，最后一次的LBB0_3中的ret会返回到main函数中对add函数的调用处。

整个递归调用完成。

> 到公众号【iOS开发栈】学习更多SwiftUI、iOS开发相关内容。

# [](#总结 "总结")总结

这篇文章通过对C语言中一个简单的递归调用过程的汇编代码进行分析，了解到递归调用的本质是jmp跳转命令和函数调用栈的结合使用。由于篇幅有限对函数栈、内存以及寄存器进行过多的分析，有兴趣的小伙伴可以直接去看《深入理解计算机系统》第三章，如果有兴趣可以留言，以后继续分析这方面的内容。
