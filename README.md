# bridgeJs
## 基于ES6的轻量级，以广播-订阅模式封装的JSBridge，沟通原生端与webview。兼容iOS9+以及安卓4.0+。

 ```text
  * [bridgeJs]
  * 基于ES6的轻量级，以广播-订阅模式封装的JSBridge。沟通原生端与webview，兼容iOS9+以及安卓4.0+。
  * @Author  refn
 ```

### 使用方法：


  1.全局引用jsBridge:

  ```JavaScript
  //在入口模块引用bridge
  import jsBridge from './bridge';
  //挂载与全局对象
  window.jsBridge = jsBridge;
  ```

  2.web端发起请求语法:

  语法

  ```JavaScript
  jsBridge.call(url, params[, callback])
  ```

  参数

  ```
  url //此次向原生端发起请求的url
  ```
  ```
  params //此次向原生端发起请求所带的参数包
  ```
  ```
  callback //可选，此次请求的回调函数
  ```

  示例

  ```JavaScript
  //web端以该url'/common/getToken'为索引，以{userId: 1}为参数包发起iframe请求

  jsBridge.call('/common/getToken', {userId: 1}, function(data){ console.log(data) })
  ```

 3.安卓端接收请求的处理方法：

  协议规范：

  ```JavaScript
  //规范

  const protocal = `jsBridge://${url}?${params}&func=${jsFunction}&eventName=${jsEventName}`

  //示例

  const target  = "jsBridge://isApp/sect?msg=xxoo&func=window.jsBridge.emit&eventName=jsBridge_event_1472625694972"
  ```

  调用方法：

  ```text
  安卓端通过监听url规范如上的iframe请求，即可获参数包，在这个例子中指的是{ msg: 'xxoo' }；
  同时，只有当webview端添加了**事件的回调函数**时，参数包会带有**func参数**与**eventName参数**。安卓端通过执行以func的值为方法名，以eventName的值为第一参数，第二及后续参数将转化为参数包。由此即可执行回调函数。
  ```

  ```JavaScript
  webView.loadUrl("window.jsBridge.emit(jsBridge_event_1472625694972, {name:1111})");
  ```
  4.iOS端接收请求的处理方法：

  调用方法：

  ```JavaScript
  window.webkit.messageHandlers.<name>.postMessage(<messageBody>)
  ```

  ```text
  iOS端使用的是messageHandlers接口，因此只兼容iOS9+。执行js的方法同安卓端：以func的值为方法名，以eventName的值为第一参数，第二及后续参数将转化为参数包。
  ```

  >[具体可参考这篇文章](http://www.jianshu.com/p/433e59c5a9eb)
