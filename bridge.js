
/**
 * bridgeJs
 * @author: refn
 */
const EMIT_METHOD = 'window.jsBridge.emit',
      EVENT_PREFIX = 'jsBridge_event',
      NAME_SPACE = 'jsBridge',
      PROTOCOL = 'jsBridge'

let appIframe, events = {}

let jsBridge = {
  isMobile:/Mobile/g.test(navigator.userAgent),
  isIOS:(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)),

  /**
   * 调用jsBridge的接口
   * @method function
   * @param api 请求地址
   * @param params 参数包 可选
   * @param callback 回调方法 可选
   */
  call(api, params = {}, callback){
    if(!this.isMobile){
      console.log('非移动端不执行jsBridge')
      return this
    }

    let option

    if(typeof callback === 'function'){
      option = {
        api,
        params,
        eventName: `${EVENT_PREFIX}_${Date.now()}`
      }
      this.on(option.eventName, callback)
    } else {
      option = {
        api,
        params,
      }
    }

    if(this.isIOS){
      this._callInIOS(option)
    } else {
      this._callInAndriod(option)
    }

    return this
  },

  /**
   * 订阅事件
   */
  on(eventName, fn){
    if(!events.hasOwnProperty(eventName)){
      events[eventName] = []
    }

    events[eventName].push(fn)

    return this
  },

  /**
   * 触发事件
   */
  emit(eventName, ...args){
    const fns = events[eventName]

    if(!fns || fns.length === 0) {
      console.log('事件尚未订阅');
      return this
    }

    fns.forEach(fn => {
      fn.apply(this, args)
    })

    //临时事件则触发后删除
    if(new RegExp('^'+EVENT_PREFIX+'(_\\d+)$').test(eventName)){
      this.remove(eventName)
    }

    return this
  },

  /**
   * 删除事件
   */
  remove(eventName, fn){
    let fns = events[eventName]

    if(!fns || fns.length === 0) {
      console.log('事件尚未订阅');
      return this
    }

    if(fn){
      for(let i = fns.length - 1; i >= 0; i--){
        if(fns[i] === fn){
          fns.splice(i, 1)
          break
        }
      }
    } else {
      delete events[eventName]
    }

    return this
  },

  _isEmpty(obj){
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        return false
      }
    }
    return true
  },

  _optionToUrl({ api, params, eventName }){
    //url: "jsBridge://isApp/sect?msg=xxoo&func=window.jsBridge.emit&eventName=jsBridge_event_1472625694972"
    if(this._isEmpty(params)){
      params = ''
    } else {
      let tempStr = ''
      for(let k in params){
        tempStr += `&${k}=${params[k]}`
      }
      params = tempStr.slice(1)
    }
    let url = `${PROTOCOL}:/${api}${(params.length > 0 ? `?${params}&`:'?')}`

    if(eventName !== undefined){
      url += `func=${EMIT_METHOD}&eventName=${eventName}`
    } else {
      url = url.slice(0,-1)
    }
    return url
  },

  _callInIOS({ api, params, eventName }){
    // window.webkit.messageHandlers.<name>.postMessage(obj)
    if(window.webkit && window.webkit.messageHandlers){
      let message = {
        api,
        params,
      }
      if(eventName !== undefined){
        message.func = EMIT_METHOD
        message.eventName = eventName
      }
      window.webkit.messageHandlers[NAME_SPACE].postMessage(JSON.stringify(message))
    } else {
      console.warn('页面非内嵌app的webview，或浏览器不兼容messageHandlers接口')
    }
  },

  _callInAndriod(option){
    let url = this._optionToUrl(option)
    if(!appIframe){
        appIframe = document.createElement('iframe')
        appIframe.id = 'jsBridgeNativeFrame'
        appIframe.style.display = 'none'
        document.body.appendChild(appIframe)
    }
    appIframe.src = url
  }
}

export default jsBridge
