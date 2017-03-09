# 基于react+Mobx(使用decorators)的demo


前几日一篇文章[Mobx 思想的实现原理，及与 Redux 对比](https://zhuanlan.zhihu.com/p/25585910)吸引了很多前端开发的目光，使饱受react组件通讯之苦、同时又对redux函数式编程方式雨里雾里的人们看到了一丝新的曙光。

介绍Mobx的文章，百度一下还是挺多的，虽然本质上很多就是翻译老外的文章...最推荐看的是官方的[gitbook](https://mobx.js.org/index.html)。在此我就不造轮子再长篇大论地重新介绍一番了。

虽然谈理论的文章很多，但是如何真正使用，特别是搭配连ES6也不支持的decorators特性，好像还是没那么简单。

所以我写了一个demo([github地址](https://github.com/yaojijiayou/React-Mobx-ReactRouter-Webpack-Decorators-Demo))。这个demo用到了react、Mobx、react router、webpack、express4。看了此react、Mobx、react router、webpack、express4分分钟一步到位学会!

具体如何使用、如何读源码，请参看readme。

除此之外，我想补充几点写demo时使我感到困惑的点:

### 1 如何使用decorators

decorators是未来的js特性，如果有用到babel，那么需要安装transform-decorators-legacy插件

、、、
npm i --save-dev babel-plugin-transform-decorators-legacy
、、、

同时需要配置.babelrc/webpack配置文件如下：
、、、
{
  "presets": [
    "es2015",
    'react',
    "stage-1"
  ],
  "plugins": ["transform-decorators-legacy"]
}
、、、
需要注意的是transform-decorators-legacy需要放在插件列表的首位。

如果webpack打包的时候报与“stage-1”相关的错误，那么需要执行:
、、、
npm install babel-preset-stage-1
、、、


### 2 如何理解Derivations

如果要我翻译的话，我会把它翻成“衍生物”。

在mobx中，存在两种Derivations：computed value和Reactions。

computed value就是基于observable state衍生出的值。它会随着observable state改变而自动改变。

比如observable state是一个数组，里面存放了全校同学的档案。那么computed value可以是:全校所有男生的人数、全校同学的最大年龄、全校最高同学的身高等等。

Reactions与computed value的不同之处是：computed value只是一个单纯的值，而Reaction是根据这个值来搞事情。

它接受两个参数，这两个参数都是函数形式。第一个用来获取‘computed value’，第二个函数则是根据第一个函数产出的值来“搞事情”。

举个例子：第一个函数计算出全校最胖同学的体重，第二个函数可以实现当最胖体重超过某个阈值的时候，向校长报告的功能。

官方文档中有句话我觉得讲的特别好,自己感受一下:
```
Reaction is roughly speaking sugar for: computed(expression).observe(action(sideEffect)) or autorun(() => action(sideEffect)(expression)
```


### 3 狗日的！！竟然发现了中文文档

[官方文档中文翻译版](https://github.com/gismanli/MobX-ZH)