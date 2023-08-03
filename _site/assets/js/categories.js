const categories = { iOS: [{ url: `/ios/objective-c/`, date: `24 May 2022`, title: `全面了解 Objective-C 语言`},{ url: `/ios/what-is-runtime/`, date: `27 Feb 2022`, title: `鸟瞰 Objective-C Runtime`},{ url: `/ios/Opaque-View-Clear-Graphics-Context/`, date: `17 Jul 2021`, title: `iOS开发细节！Opaque View和Clear Graphics Context`},{ url: `/ios/project-entry-point-history/`, date: `06 May 2021`, title: `iOS项目入口的演变过程（2021）`},],本地化: [{ url: `/ios/handle-localization-file/`, date: `22 Jul 2021`, title: `iOS国际化手动管理localization文件`},{ url: `/ios/international-noun/`, date: `15 May 2021`, title: `iOS项目国际化对【名词复数】的处理方法`},],SwiftUI: [{ url: `/swiftui/viewbuilder/`, date: `04 Jul 2021`, title: `解密SwiftUI中@ViewBuilder的黑暗魔法`},{ url: `/swiftui/menu-alert-actionsheet/`, date: `13 Jun 2021`, title: `SwiftUI弹窗大全：Menu/Alert/ActionSheet`},{ url: `/swiftui/tabview/`, date: `20 May 2021`, title: `全面掌握！SwiftUI2.0中TabView的知识和用法`},],读书: [{ url: `/other/becoming-steve-jobs/`, date: `27 Jun 2021`, title: `程序员读《成为乔布斯》`},],Swift: [{ url: `/swift/swift-ArraySlice-in-Swift/`, date: `15 Mar 2022`, title: `理解 Swift 的 ArraySlice`},{ url: `/swift/swift-keypaths/`, date: `06 Jul 2021`, title: `掌握KeyPaths的用法（从理论到实践），极大提高Swift开发效率`},],其他: [{ url: `/other/iOS-future/`, date: `08 Nov 2021`, title: `iOS开发前景和发展方向`},{ url: `/other/clibre/`, date: `06 Aug 2021`, title: `使用clibre一键将网站转换成PDF`},],源码分析: [{ url: `/ios/copy-vs-strong/`, date: `08 Aug 2021`, title: `深度好文！深入汇编、源码搞懂Copy和Strong的实现原理`},],性能优化: [{ url: `/xcode/use-instruments-proj-launch-time/`, date: `22 Aug 2021`, title: `使用Instruments了解iOS应用启动时长（Xcode13）`},],XCTest: [{ url: `/xcode/unit-test-know/`, date: `13 Sep 2021`, title: `单元测试-高级iOS的必修课`},],UI: [{ url: `/ios/iOS-responder-chain/`, date: `21 Nov 2021`, title: `iOS事件传递链，巧用nextResponder跨层传递`},{ url: `/ios/HitTest-UIScrollView-panGestureRecognizer/`, date: `09 Oct 2021`, title: `HitTest+UIScrollView panGestureRecognizer（竖直滚动上层ScrollView，水平滚动下层CollectionView）`},],计算机基础: [{ url: `/cs/lldb-tutorial/`, date: `28 Mar 2022`, title: `lldb 启动、添加断点、调试、终止`},{ url: `/cs/analyse-function-call-using-assembly/`, date: `19 Dec 2021`, title: `汇编分析函数调用`},],广告集成: [{ url: `/ios/integrate-Admob-Native/`, date: `03 Jan 2022`, title: `iOS集成Admob的Native广告`},],Xcode: [{ url: `/xcode/xcode-check-memory-graph/`, date: `09 Jan 2022`, title: `使用Xcode检测对象内存，处理循环引用`},],系统设计: [{ url: `/ios/cracking-the-mobile-system-design-interview/`, date: `01 Mar 2022`, title: `搞定移动端系统设计面试`},], }

window.onload = function () {
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", function (e) {
      const posts = categories[e.target.innerText];
      let html = ``
      posts.forEach(post=>{
        html += `
        <a class="modal-article" href="${post.url}">
          <h4>${post.title}</h4>
          <small class="modal-article-date">${post.date}</small>
        </a>
        `
      })
      document.querySelector("#category-modal-title").innerText = e.target.innerText;
      document.querySelector("#category-modal-content").innerHTML = html;
      document.querySelector("#category-modal-bg").classList.toggle("open");
      document.querySelector("#category-modal").classList.toggle("open");
    });
  });

  document.querySelector("#category-modal-bg").addEventListener("click", function(){
    document.querySelector("#category-modal-title").innerText = "";
    document.querySelector("#category-modal-content").innerHTML = "";
    document.querySelector("#category-modal-bg").classList.toggle("open");
    document.querySelector("#category-modal").classList.toggle("open");
  })
};