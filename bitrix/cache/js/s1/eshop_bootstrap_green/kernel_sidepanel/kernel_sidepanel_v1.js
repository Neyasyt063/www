; /* /bitrix/js/main/sidepanel/manager.min.js?156407647914553*/
; /* /bitrix/js/main/sidepanel/slider.min.js?156407647921602*/

; /* Start:"a:4:{s:4:"full";s:56:"/bitrix/js/main/sidepanel/manager.min.js?156407647914553";s:6:"source";s:36:"/bitrix/js/main/sidepanel/manager.js";s:3:"min";s:40:"/bitrix/js/main/sidepanel/manager.min.js";s:3:"map";s:40:"/bitrix/js/main/sidepanel/manager.map.js";}"*/
(function(){"use strict";BX.namespace("BX.SidePanel");var e=null;Object.defineProperty(BX.SidePanel,"Instance",{enumerable:false,get:function(){if(window.top!==window){return window.top.BX.SidePanel.Instance}if(e===null){e=new BX.SidePanel.Manager({})}return e}});BX.SidePanel.Manager=function(e){this.anchorRules=[];this.openSliders=[];this.lastOpenSlider=null;this.opened=false;this.hidden=false;this.hacksApplied=false;this.pageUrl=this.getCurrentUrl();this.handleAnchorClick=this.handleAnchorClick.bind(this);this.handleDocumentKeyDown=this.handleDocumentKeyDown.bind(this);this.handleWindowResize=BX.throttle(this.handleWindowResize,300,this);this.handleWindowScroll=this.handleWindowScroll.bind(this);this.handleTouchMove=this.handleTouchMove.bind(this);this.handleSliderOpen=this.handleSliderOpen.bind(this);this.handleSliderOpenComplete=this.handleSliderOpenComplete.bind(this);this.handleSliderClose=this.handleSliderClose.bind(this);this.handleSliderCloseComplete=this.handleSliderCloseComplete.bind(this);this.handleSliderLoad=this.handleSliderLoad.bind(this);this.handleSliderDestroy=this.handleSliderDestroy.bind(this);this.handleEscapePress=this.handleEscapePress.bind(this);BX.addCustomEvent("SidePanel:open",this.open.bind(this));BX.addCustomEvent("SidePanel:close",this.close.bind(this));BX.addCustomEvent("SidePanel:closeAll",this.closeAll.bind(this));BX.addCustomEvent("SidePanel:destroy",this.destroy.bind(this));BX.addCustomEvent("SidePanel:hide",this.hide.bind(this));BX.addCustomEvent("SidePanel:unhide",this.unhide.bind(this));BX.addCustomEvent("SidePanel:postMessage",this.postMessage.bind(this));BX.addCustomEvent("SidePanel:postMessageAll",this.postMessageAll.bind(this));BX.addCustomEvent("SidePanel:postMessageTop",this.postMessageTop.bind(this));BX.addCustomEvent("BX.Bitrix24.PageSlider:close",this.close.bind(this));BX.addCustomEvent("Bitrix24.Slider:postMessage",this.handlePostMessageCompatible.bind(this))};var t=null;BX.SidePanel.Manager.registerSliderClass=function(e){if(BX.type.isNotEmptyString(e)){t=e}};BX.SidePanel.Manager.getSliderClass=function(){var e=t!==null?BX.getClass(t):null;return e!==null?e:BX.SidePanel.Slider};BX.SidePanel.Manager.prototype={open:function(e,t){if(!BX.type.isNotEmptyString(e)){return false}e=this.refineUrl(e);if(this.isHidden()){this.unhide()}var i=this.getTopSlider();if(i){if(i.isOpen()&&i.getUrl()===e){return false}}var n=null;if(this.getLastOpenSlider()&&this.getLastOpenSlider().getUrl()===e){n=this.getLastOpenSlider()}else{var r=BX.SidePanel.Manager.getSliderClass();n=new r(e,t);var s=i?i.getZindex()+1:n.getZindex();var l=null;if(n.getWidth()===null&&n.getCustomLeftBoundary()===null){l=0;var o=this.getLastOffset();if(i&&o!==null){l=Math.min(o+this.getMinOffset(),this.getMaxOffset())}}n.setZindex(s);n.setOffset(l);BX.addCustomEvent(n,"SidePanel.Slider:onOpen",this.handleSliderOpen);BX.addCustomEvent(n,"SidePanel.Slider:onBeforeOpenComplete",this.handleSliderOpenComplete);BX.addCustomEvent(n,"SidePanel.Slider:onClose",this.handleSliderClose);BX.addCustomEvent(n,"SidePanel.Slider:onBeforeCloseComplete",this.handleSliderCloseComplete);BX.addCustomEvent(n,"SidePanel.Slider:onLoad",this.handleSliderLoad);BX.addCustomEvent(n,"SidePanel.Slider:onDestroy",this.handleSliderDestroy);BX.addCustomEvent(n,"SidePanel.Slider:onEscapePress",this.handleEscapePress)}if(!this.isOpen()){this.applyHacks(n)}var d=n.open();if(!d){this.resetHacks(n)}return d},isOpen:function(){return this.opened},close:function(e,t){var i=this.getTopSlider();if(i){i.close(e,t)}},closeAll:function(e){var t=this.getOpenSliders();for(var i=t.length-1;i>=0;i--){var n=t[i];var r=n.close(e);if(!r){break}}},hide:function(){if(this.hidden){return false}var e=this.getTopSlider();this.getOpenSliders().forEach(function(e){e.hide()});this.hidden=true;this.resetHacks(e);return true},unhide:function(){if(!this.hidden){return false}this.getOpenSliders().forEach(function(e){e.unhide()});this.hidden=false;setTimeout(function(){this.applyHacks(this.getTopSlider())}.bind(this),0);return true},isHidden:function(){return this.hidden},destroy:function(e){if(!BX.type.isNotEmptyString(e)){return}e=this.refineUrl(e);var t=this.getSlider(e);if(this.getLastOpenSlider()&&(t||this.getLastOpenSlider().getUrl()===e)){this.getLastOpenSlider().destroy()}if(t!==null){var i=this.getOpenSliders();for(var n=i.length-1;n>=0;n--){var r=i[n];r.destroy();if(r===t){break}}}},getTopSlider:function(){var e=this.openSliders.length;return this.openSliders[e-1]?this.openSliders[e-1]:null},getPreviousSlider:function(e){var t=null;var i=this.getOpenSliders();e=e||this.getTopSlider();for(var n=i.length-1;n>=0;n--){var r=i[n];if(r===e){t=i[n-1]?i[n-1]:null;break}}return t},getSlider:function(e){e=this.refineUrl(e);var t=this.getOpenSliders();for(var i=0;i<t.length;i++){var n=t[i];if(n.getUrl()===e){return n}}return null},getSliderByWindow:function(e){var t=this.getOpenSliders();for(var i=0;i<t.length;i++){var n=t[i];if(n.getFrameWindow()===e){return n}}return null},getOpenSliders:function(){return this.openSliders},getOpenSlidersCount:function(){return this.openSliders.length},addOpenSlider:function(e){if(!(e instanceof BX.SidePanel.Slider)){throw new Error("Slider is not an instance of BX.SidePanel.Slider")}this.openSliders.push(e)},removeOpenSlider:function(e){var t=this.getOpenSliders();for(var i=0;i<t.length;i++){var n=t[i];if(n===e){this.openSliders.splice(i,1);return true}}return false},getLastOpenSlider:function(){return this.lastOpenSlider},setLastOpenSlider:function(e){if(this.lastOpenSlider!==e){if(this.lastOpenSlider){this.lastOpenSlider.destroy()}this.lastOpenSlider=e}},resetLastOpenSlider:function(){if(this.lastOpenSlider&&this.getTopSlider()!==this.lastOpenSlider){this.lastOpenSlider.destroy()}this.lastOpenSlider=null},adjustLayout:function(){this.getOpenSliders().forEach(function(e){e.adjustLayout()})},getLastOffset:function(){var e=this.getOpenSliders();for(var t=e.length-1;t>=0;t--){var i=e[t];if(i.getOffset()!==null){return i.getOffset()}}return null},refineUrl:function(e){return BX.util.remove_url_param(e,["IFRAME","IFRAME_TYPE"])},getPageUrl:function(){return this.pageUrl},getCurrentUrl:function(){return window.location.pathname+window.location.search+window.location.hash},postMessage:function(e,t,i){var n=this.getSliderFromSource(e);if(!n){return}var r=null;var s=this.getOpenSliders();for(var l=s.length-1;l>=0;l--){var o=s[l];if(o===n){r=s[l-1]?s[l-1]:null;break}}var d=r&&r.getWindow()||window;d.BX.onCustomEvent("Bitrix24.Slider:onMessage",[o,i]);var a=new BX.SidePanel.MessageEvent({sender:n,slider:r?r:null,data:i,eventId:t});if(r){r.firePageEvent(a);r.fireFrameEvent(a)}else{BX.onCustomEvent(window,a.getFullName(),[a])}},postMessageAll:function(e,t,i){var n=this.getSliderFromSource(e);if(!n){return}var r=null;var s=this.getOpenSliders();for(var l=s.length-1;l>=0;l--){var o=s[l];if(o===n){continue}r=new BX.SidePanel.MessageEvent({sender:n,slider:o,data:i,eventId:t});o.firePageEvent(r);o.fireFrameEvent(r)}r=new BX.SidePanel.MessageEvent({sender:n,slider:null,data:i,eventId:t});BX.onCustomEvent(window,r.getFullName(),[r])},postMessageTop:function(e,t,i){var n=this.getSliderFromSource(e);if(!n){return}var r=new BX.SidePanel.MessageEvent({sender:n,slider:null,data:i,eventId:t});BX.onCustomEvent(window,r.getFullName(),[r])},getMinOffset:function(){return 63},getMaxOffset:function(){return this.getMinOffset()*3},bindAnchors:function(e){e=e||{};if(BX.type.isArray(e.rules)&&e.rules.length){if(this.anchorRules.length===0){window.document.addEventListener("click",this.handleAnchorClick,true)}if(!(e.rules instanceof Object)){console.error("BX.SitePanel: anchor rules were created in a different context. "+"This might be a reason for a memory leak.");console.trace()}this.anchorRules=this.anchorRules.concat(e.rules)}},handleSliderOpen:function(e){if(!e.isActionAllowed()){return}var t=e.getSlider();if(this.getTopSlider()){this.getTopSlider().hideOverlay();this.getTopSlider().hideCloseBtn();this.getTopSlider().hidePrintBtn()}else{t.setOverlayAnimation(true)}this.addOpenSlider(t);this.losePageFocus();if(!this.opened){this.pageUrl=this.getCurrentUrl()}this.opened=true;this.resetLastOpenSlider()},handleSliderOpenComplete:function(e){this.setBrowserHistory(e.getSlider())},handleSliderClose:function(e){var t=this.getPreviousSlider();var i=this.getTopSlider();if(t){t.unhideOverlay();i&&i.hideOverlay()}},handleSliderCloseComplete:function(e){var t=e.getSlider();if(t===this.getTopSlider()){this.setLastOpenSlider(t)}this.cleanUpClosedSlider(t)},handleSliderDestroy:function(e){var t=e.getSlider();BX.removeCustomEvent(t,"SidePanel.Slider:onOpen",this.handleSliderOpen);BX.removeCustomEvent(t,"SidePanel.Slider:onBeforeOpenComplete",this.handleSliderOpenComplete);BX.removeCustomEvent(t,"SidePanel.Slider:onBeforeCloseComplete",this.handleSliderCloseComplete);BX.removeCustomEvent(t,"SidePanel.Slider:onLoad",this.handleSliderLoad);BX.removeCustomEvent(t,"SidePanel.Slider:onDestroy",this.handleSliderDestroy);BX.removeCustomEvent(t,"SidePanel.Slider:onEscapePress",this.handleEscapePress);var i=e.getSlider().getFrameWindow();if(i){i.document.removeEventListener("click",this.handleAnchorClick,true)}if(t===this.getLastOpenSlider()){this.lastOpenSlider=null}this.cleanUpClosedSlider(t)},handleEscapePress:function(e){if(this.isOnTop()&&this.getTopSlider()){if(this.getTopSlider().canCloseByEsc()){this.getTopSlider().close()}}},cleanUpClosedSlider:function(e){this.removeOpenSlider(e);e.unhideOverlay();if(this.getTopSlider()){this.getTopSlider().showCloseBtn();if(this.getTopSlider().isPrintable()){this.getTopSlider().showPrintBtn()}this.getTopSlider().focus()}else{window.focus()}if(!this.getOpenSlidersCount()){this.resetHacks(e);this.opened=false}this.resetBrowserHistory()},handleSliderLoad:function(e){var t=e.getSlider().getFrameWindow();if(t){t.document.addEventListener("click",this.handleAnchorClick,true)}this.setBrowserHistory(e.getSlider())},handlePostMessageCompatible:function(e,t){this.postMessage(e,"",t)},getSliderFromSource:function(e){if(e instanceof BX.SidePanel.Slider){return e}else if(BX.type.isNotEmptyString(e)){return this.getSlider(e)}else if(e!==null&&e===e.window&&window!==e){return this.getSliderByWindow(e)}return null},applyHacks:function(e){if(this.hacksApplied){return false}e&&e.applyHacks();this.disablePageScrollbar();this.bindEvents();e&&e.applyPostHacks();this.hacksApplied=true;return true},resetHacks:function(e){if(!this.hacksApplied){return false}e&&e.resetPostHacks();this.enablePageScrollbar();this.unbindEvents();e&&e.resetHacks();this.hacksApplied=false;return true},bindEvents:function(){BX.bind(document,"keydown",this.handleDocumentKeyDown);BX.bind(window,"resize",this.handleWindowResize);BX.bind(window,"scroll",this.handleWindowScroll);if(BX.browser.IsMobile()){BX.bind(document.body,"touchmove",this.handleTouchMove)}},unbindEvents:function(){BX.unbind(document,"keydown",this.handleDocumentKeyDown);BX.unbind(window,"resize",this.handleWindowResize);BX.unbind(window,"scroll",this.handleWindowScroll);if(BX.browser.IsMobile()){BX.unbind(document.body,"touchmove",this.handleTouchMove)}},disablePageScrollbar:function(){var e=window.innerWidth-document.documentElement.clientWidth;document.body.style.paddingRight=e+"px";BX.addClass(document.body,"side-panel-disable-scrollbar");this.pageScrollTop=window.pageYOffset||document.documentElement.scrollTop},enablePageScrollbar:function(){document.body.style.removeProperty("padding-right");BX.removeClass(document.body,"side-panel-disable-scrollbar")},losePageFocus:function(){if(BX.type.isDomNode(document.activeElement)){document.activeElement.blur()}},handleDocumentKeyDown:function(e){if(e.keyCode!==27){return}e.preventDefault();if(this.isOnTop()&&this.getTopSlider()){if(this.getTopSlider().canCloseByEsc()){this.getTopSlider().close()}}},handleWindowResize:function(){this.adjustLayout()},handleWindowScroll:function(){window.scrollTo(0,this.pageScrollTop);this.adjustLayout()},handleTouchMove:function(e){e.preventDefault()},isOnTop:function(){var e=document.documentElement.clientWidth/2;var t=document.documentElement.clientHeight/2;var i=document.elementFromPoint(e,t);return BX.hasClass(i,"side-panel")||BX.findParent(i,{className:"side-panel"})!==null},extractLinkFromEvent:function(e){e=e||window.event;var t=e.target;if(e.which!==1||!BX.type.isDomNode(t)||e.ctrlKey||e.metaKey){return null}var i=t;if(t.nodeName!=="A"){i=BX.findParent(t,{tag:"A"},1)}if(!BX.type.isDomNode(i)){return null}var n=i.getAttribute("href");if(n){return{url:n,anchor:i,target:i.getAttribute("target")}}return null},handleAnchorClick:function(e){var t=this.extractLinkFromEvent(e);if(!t||BX.data(t.anchor,"slider-ignore-autobinding")){return}var i=this.getUrlRule(t.url,t);if(!i){return}if(i.allowCrossDomain!==true&&BX.ajax.isCrossDomain(t.url)){return}if(i.mobileFriendly!==true&&BX.browser.IsMobile()){return}var n=BX.type.isFunction(i.validate)?i.validate(t):this.isValidLink(t);if(!n){return}if(BX.type.isFunction(i.handler)){i.handler(e,t)}else{e.preventDefault();var r=BX.type.isPlainObject(i.options)?i.options:{};if(!BX.type.isNotEmptyString(r.loader)&&BX.type.isNotEmptyString(i.loader)){r.loader=i.loader}this.open(t.url,r)}},getUrlRule:function(e,t){if(!BX.type.isNotEmptyString(e)){return null}for(var i=0;i<this.anchorRules.length;i++){var n=this.anchorRules[i];if(!BX.type.isArray(n.condition)){continue}for(var r=0;r<n.condition.length;r++){if(BX.type.isString(n.condition[r])){n.condition[r]=new RegExp(n.condition[r],"i")}var s=e.match(n.condition[r]);if(s&&!this.hasStopParams(e,n.stopParameters)){if(t){t.matches=s}return n}}}return null},isValidLink:function(e){return true},setBrowserHistory:function(e){if(!(e instanceof BX.SidePanel.Slider)){return}if(e.canChangeHistory()&&e.isOpen()&&e.isLoaded()){window.history.replaceState({},"",e.getUrl())}},resetBrowserHistory:function(){var e=null;var t=this.getOpenSliders();for(var i=t.length-1;i>=0;i--){var n=t[i];if(n.canChangeHistory()&&n.isOpen()&&n.isLoaded()){e=n;break}}var r=e?e.getUrl():this.getPageUrl();if(r){window.history.replaceState({},"",r)}},hasStopParams:function(e,t){if(!t||!BX.type.isArray(t)||!BX.type.isNotEmptyString(e)){return false}var i=e.indexOf("?");if(i===-1){return false}var n=e.substring(i);for(var r=0;r<t.length;r++){var s=t[r];if(n.match(new RegExp("[?&]"+s+"=","i"))){return true}}return false},getLastOpenPage:function(){return this.getLastOpenSlider()},getCurrentPage:function(){return this.getTopSlider()}}})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:55:"/bitrix/js/main/sidepanel/slider.min.js?156407647921602";s:6:"source";s:35:"/bitrix/js/main/sidepanel/slider.js";s:3:"min";s:39:"/bitrix/js/main/sidepanel/slider.min.js";s:3:"map";s:39:"/bitrix/js/main/sidepanel/slider.map.js";}"*/
(function(){"use strict";BX.namespace("BX.SidePanel");BX.SidePanel.Slider=function(t,e){this.url=BX.util.remove_url_param(t,["IFRAME","IFRAME_TYPE"]);e=BX.type.isPlainObject(e)?e:{};this.options=e;this.contentCallback=BX.type.isFunction(e.contentCallback)?e.contentCallback:null;this.contentCallbackInvoved=false;this.zIndex=3e3;this.offset=null;this.width=BX.type.isNumber(e.width)?e.width:null;this.cacheable=e.cacheable!==false;this.autoFocus=e.autoFocus!==false;this.printable=e.printable===true;this.allowChangeHistory=e.allowChangeHistory!==false;this.data=new BX.SidePanel.Dictionary(BX.type.isPlainObject(e.data)?e.data:{});this.customLeftBoundary=null;this.setCustomLeftBoundary(e.customLeftBoundary);this.iframe=null;this.iframeSrc=null;this.iframeId=null;this.requestMethod=BX.type.isNotEmptyString(e.requestMethod)&&e.requestMethod.toLowerCase()==="post"?"post":"get";this.requestParams=BX.type.isPlainObject(e.requestParams)?e.requestParams:{};this.opened=false;this.hidden=false;this.destroyed=false;this.loaded=false;this.handleFrameKeyDown=this.handleFrameKeyDown.bind(this);this.handleFrameFocus=this.handleFrameFocus.bind(this);this.layout={overlay:null,container:null,loader:null,content:null,closeBtn:null,printBtn:null};this.loader=BX.type.isNotEmptyString(e.loader)?e.loader:BX.type.isNotEmptyString(e.typeLoader)?e.typeLoader:"default-loader";this.animation=null;this.animationDuration=BX.type.isNumber(e.animationDuration)?e.animationDuration:200;this.startParams={translateX:100,opacity:0};this.endParams={translateX:0,opacity:40};this.currentParams=null;this.overlayAnimation=false;if(this.url.indexOf("crm.activity.planner/slider.php")!==-1&&e.events&&BX.type.isFunction(e.events.onOpen)&&e.events.compatibleEvents!==false){var i=e.events.onOpen;delete e.events.onOpen;e.events.onLoad=function(t){i(t.getSlider())}}if(e.events){for(var n in e.events){if(BX.type.isFunction(e.events[n])){BX.addCustomEvent(this,BX.SidePanel.Slider.getEventFullName(n),e.events[n])}}}};BX.SidePanel.Slider.getEventFullName=function(t){return"SidePanel.Slider:"+t};BX.SidePanel.Slider.prototype={open:function(){if(this.isOpen()){return false}if(!this.canOpen()){return false}this.createLayout();this.adjustLayout();this.opened=true;this.animateOpening();return true},close:function(t,e){if(!this.isOpen()){return false}if(!this.canClose()){return false}this.opened=false;if(this.animation){this.animation.stop()}if(t===true||BX.browser.IsMobile()){this.currentParams=this.startParams;this.completeAnimation(e)}else{this.animation=new BX.easing({duration:this.animationDuration,start:this.currentParams,finish:this.startParams,transition:BX.easing.transitions.linear,step:BX.delegate(function(t){this.currentParams=t;this.animateStep(t)},this),complete:BX.delegate(function(){this.completeAnimation(e)},this)});this.animation.animate()}return true},getUrl:function(){return this.url},focus:function(){this.getWindow().focus()},isOpen:function(){return this.opened},setZindex:function(t){if(BX.type.isNumber(t)){this.zIndex=t}},getZindex:function(){return this.zIndex},setOffset:function(t){if(BX.type.isNumber(t)||t===null){this.offset=t}},getOffset:function(){return this.offset},setWidth:function(t){if(BX.type.isNumber(t)){this.width=t}},getWidth:function(){return this.width},getData:function(){return this.data},isSelfContained:function(){return this.contentCallback!==null},isPostMethod:function(){return this.requestMethod==="post"},getRequestParams:function(){return this.requestParams},getFrameId:function(){if(this.iframeId===null){this.iframeId="iframe_"+BX.util.getRandomString(10).toLowerCase()}return this.iframeId},getWindow:function(){return this.iframe?this.iframe.contentWindow:window},getFrameWindow:function(){return this.iframe?this.iframe.contentWindow:null},isHidden:function(){return this.hidden},isCacheable:function(){return this.cacheable},isFocusable:function(){return this.autoFocus},isPrintable:function(){return this.printable},isDestroyed:function(){return this.destroyed},isLoaded:function(){return this.loaded},canChangeHistory:function(){return this.allowChangeHistory&&!this.isSelfContained()&&!this.getUrl().match(/^\/bitrix\/(components|tools)\//i)},setCacheable:function(t){this.cacheable=t!==false},setAutoFocus:function(t){this.autoFocus=t!==false},setPrintable:function(t){this.printable=t!==false;this.printable?this.showPrintBtn():this.hidePrintBtn()},getLoader:function(){return this.loader},showLoader:function(){var t=this.getLoader();if(!this.layout.loader||this.layout.loader.dataset.loader!==t){this.createLoader(t)}this.layout.loader.style.opacity=1;this.layout.loader.style.display="block"},closeLoader:function(){this.layout.loader.style.display="none";this.layout.loader.style.opacity=0},showCloseBtn:function(){this.getCloseBtn().style.removeProperty("opacity")},hideCloseBtn:function(){this.getCloseBtn().style.opacity=0},showPrintBtn:function(){this.getPrintBtn().classList.add("side-panel-print-visible")},hidePrintBtn:function(){this.getPrintBtn().classList.remove("side-panel-print-visible")},applyHacks:function(){},applyPostHacks:function(){},resetHacks:function(){},resetPostHacks:function(){},getTopBoundary:function(){return 0},calculateLeftBoundary:function(){var t=this.getCustomLeftBoundary();if(t!==null){return t}return this.getLeftBoundary()},getLeftBoundary:function(){var t=BX.browser.IsMobile()?window.innerWidth:document.documentElement.clientWidth;return t<1160?this.getMinLeftBoundary():300},getMinLeftBoundary:function(){return 65},setCustomLeftBoundary:function(t){if(BX.type.isNumber(t)||t===null){this.customLeftBoundary=t}},getCustomLeftBoundary:function(){return this.customLeftBoundary},getRightBoundary:function(){return-window.pageXOffset},destroy:function(){this.firePageEvent("onDestroy");this.fireFrameEvent("onDestroy");var t=this.getFrameWindow();if(t){t.removeEventListener("keydown",this.handleFrameKeyDown);t.removeEventListener("focus",this.handleFrameFocus)}BX.remove(this.layout.overlay);this.layout.container=null;this.layout.overlay=null;this.layout.content=null;this.layout.closeBtn=null;this.layout.printBtn=null;this.layout.loader=null;this.iframe=null;this.destroyed=true;if(this.options.events){for(var e in this.options.events){BX.removeCustomEvent(this,BX.SidePanel.Slider.getEventFullName(e),this.options.events[e])}}return true},hide:function(){this.hidden=true;this.getContainer().style.display="none";this.getOverlay().style.display="none"},unhide:function(){this.hidden=false;this.getContainer().style.removeProperty("display");this.getOverlay().style.removeProperty("display")},adjustLayout:function(){var t=window.pageYOffset||document.documentElement.scrollTop;var e=BX.browser.IsMobile()?window.innerHeight:document.documentElement.clientHeight;var i=this.getTopBoundary();var n=i-t>0;i=n?i:t;var a=n>0?e-i+t:e;var s=this.getOffset()!==null?this.getOffset():0;var r=Math.max(this.calculateLeftBoundary(),this.getMinLeftBoundary())+s;this.getOverlay().style.left=window.pageXOffset+"px";this.getOverlay().style.top=i+"px";this.getOverlay().style.right=this.getRightBoundary()+"px";this.getOverlay().style.height=a+"px";this.getContainer().style.width="calc(100% - "+r+"px)";this.getContainer().style.height=a+"px";if(this.getWidth()!==null){this.getContainer().style.maxWidth=this.getWidth()+"px"}},createLayout:function(){if(this.layout.overlay!==null&&this.layout.overlay.parentNode){return}if(this.isSelfContained()){this.getContentContainer().style.overflow="auto";document.body.appendChild(this.getOverlay());this.setContent()}else{this.getContentContainer().appendChild(this.getFrame());document.body.appendChild(this.getOverlay());this.setFrameSrc()}},getFrame:function(){if(this.iframe!==null){return this.iframe}this.iframe=BX.create("iframe",{attrs:{src:"about:blank",frameborder:"0"},props:{className:"side-panel-iframe",name:this.getFrameId(),id:this.getFrameId()},events:{load:this.handleFrameLoad.bind(this)}});return this.iframe},getOverlay:function(){if(this.layout.overlay!==null){return this.layout.overlay}this.layout.overlay=BX.create("div",{props:{className:"side-panel side-panel-overlay"},events:{click:this.handleOverlayClick.bind(this)},style:{zIndex:this.getZindex()},children:[this.getContainer()]});return this.layout.overlay},unhideOverlay:function(){this.getOverlay().classList.remove("side-panel-overlay-hidden")},hideOverlay:function(){this.getOverlay().classList.add("side-panel-overlay-hidden")},setOverlayAnimation:function(t){if(BX.type.isBoolean(t)){this.overlayAnimation=t}},getOverlayAnimation:function(){return this.overlayAnimation},getContainer:function(){if(this.layout.container!==null){return this.layout.container}this.layout.container=BX.create("div",{props:{className:"side-panel side-panel-container"},style:{zIndex:this.getZindex()+1},children:[this.getContentContainer(),this.getCloseBtn(),this.getPrintBtn()]});return this.layout.container},getContentContainer:function(){if(this.layout.content!==null){return this.layout.content}this.layout.content=BX.create("div",{props:{className:"side-panel-content-container"}});return this.layout.content},getCloseBtn:function(){if(this.layout.closeBtn!==null){return this.layout.closeBtn}this.layout.closeBtn=BX.create("span",{props:{className:"side-panel-close",title:BX.message("MAIN_SIDEPANEL_CLOSE")},children:[BX.create("span",{props:{className:"side-panel-close-inner"}})],events:{click:this.handleCloseBtnClick.bind(this)}});return this.layout.closeBtn},getPrintBtn:function(){if(this.layout.printBtn!==null){return this.layout.printBtn}this.layout.printBtn=BX.create("span",{props:{className:"side-panel-print",title:BX.message("MAIN_SIDEPANEL_PRINT")},events:{click:this.handlePrintBtnClick.bind(this)}});return this.layout.printBtn},setContent:function(){if(this.contentCallbackInvoved){return}this.contentCallbackInvoved=true;this.showLoader();var t=new BX.Promise;t.then(this.contentCallback).then(function(t){if(this.isDestroyed()){return}if(BX.type.isDomNode(t)){this.getContentContainer().appendChild(t)}else if(BX.type.isNotEmptyString(t)){this.getContentContainer().innerHTML=t}this.loaded=true;this.firePageEvent("onLoad");this.closeLoader()}.bind(this),function(t){this.destroy();BX.debug("error",t)});t.fulfill(this)},setFrameSrc:function(){if(this.iframeSrc===this.getUrl()){return}var t=BX.util.add_url_param(this.getUrl(),{IFRAME:"Y",IFRAME_TYPE:"SIDE_SLIDER"});if(this.isPostMethod()){var e=document.createElement("form");e.method="POST";e.action=t;e.target=this.getFrameId();e.style.display="none";BX.util.addObjectToForm(this.getRequestParams(),e);document.body.appendChild(e);e.submit();BX.remove(e)}else{this.iframeSrc=this.getUrl();this.iframe.src=t}this.showLoader()},createLoader:function(t){BX.remove(this.layout.loader);t=BX.type.isNotEmptyString(t)?t:"default-loader";var e=["task-new-loader","task-edit-loader","task-view-loader","crm-entity-details-loader","crm-button-view-loader","crm-webform-view-loader","create-mail-loader","view-mail-loader"];var i=null;if(BX.util.in_array(t,e)&&this.loaderExists(t)){this.layout.loader=this.createOldLoader(t)}else if(t.charAt(0)==="/"){this.layout.loader=this.createSvgLoader(t)}else if(i=t.match(/^([a-z0-9-_.]+):([a-z0-9-_.]+)$/i)){var n=i[1];var a=i[2];var s="/bitrix/images/"+n+"/slider/"+a+".svg";this.layout.loader=this.createSvgLoader(s)}else{t="default-loader";this.layout.loader=this.createDefaultLoader()}this.layout.loader.dataset.loader=t;this.getContentContainer().appendChild(this.layout.loader)},createSvgLoader:function(t){return BX.create("div",{props:{className:"side-panel-loader-container"},style:{backgroundImage:'url("'+t+'")'}})},createDefaultLoader:function(){return BX.create("div",{props:{className:"side-panel-default-loader-container"},html:'<svg class="side-panel-default-loader-circular" viewBox="25 25 50 50">'+"<circle "+'class="side-panel-default-loader-path" '+'cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"'+"/>"+"</svg>"})},createOldLoader:function(t){if(t==="crm-entity-details-loader"){return BX.create("div",{props:{className:"side-panel-loader "+t},children:[BX.create("img",{attrs:{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BMVEX"+"///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"},props:{className:"side-panel-loader-mask top"}}),BX.create("div",{props:{className:"side-panel-loader-bg left"},children:[BX.create("img",{attrs:{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1B"+"MVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"},props:{className:"side-panel-loader-mask left"}})]}),BX.create("div",{props:{className:"side-panel-loader-bg right"},children:[BX.create("img",{attrs:{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BM"+"VEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"},props:{className:"side-panel-loader-mask right"}})]})]})}else{return BX.create("div",{props:{className:"side-panel-loader "+t},children:[BX.create("img",{attrs:{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BMVEX"+"///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"},props:{className:"side-panel-loader-mask left"}}),BX.create("img",{attrs:{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA"+"1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"},props:{className:"side-panel-loader-mask right"}})]})}},loaderExists:function(t){if(!BX.type.isNotEmptyString(t)){return false}for(var e=0;e<document.styleSheets.length;e++){var i=document.styleSheets[e];if(!BX.type.isNotEmptyString(i.href)||i.href.indexOf("sidepanel")===-1){continue}var n=i.rules||i.cssRules;for(var a=0;a<n.length;a++){var s=n[a];if(BX.type.isNotEmptyString(s.selectorText)&&s.selectorText.indexOf(t)!==-1){return true}}}return false},animateOpening:function(){BX.addClass(this.getOverlay(),"side-panel-overlay-open side-panel-overlay-opening");if(this.isPrintable()){this.showPrintBtn()}if(this.animation){this.animation.stop()}if(BX.browser.IsMobile()){this.currentParams=this.endParams;this.animateStep(this.currentParams);this.completeAnimation();return}this.currentParams=this.currentParams?this.currentParams:this.startParams;this.animation=new BX.easing({duration:this.animationDuration,start:this.currentParams,finish:this.endParams,transition:BX.easing.transitions.linear,step:BX.delegate(function(t){this.currentParams=t;this.animateStep(t)},this),complete:BX.delegate(function(){this.completeAnimation()},this)});this.animation.animate()},animateStep:function(t){this.getContainer().style.transform="translateX("+t.translateX+"%)";if(this.getOverlayAnimation()){this.getOverlay().style.backgroundColor="rgba(0, 0, 0, "+t.opacity/100+")"}},completeAnimation:function(t){this.animation=null;if(this.isOpen()){this.currentParams=this.endParams;BX.removeClass(this.getOverlay(),"side-panel-overlay-opening");this.firePageEvent("onBeforeOpenComplete");this.fireFrameEvent("onBeforeOpenComplete");this.firePageEvent("onOpenComplete");this.fireFrameEvent("onOpenComplete");if(this.isFocusable()){this.focus()}}else{this.currentParams=this.startParams;BX.removeClass(this.getOverlay(),"side-panel-overlay-open side-panel-overlay-opening");this.getContainer().style.removeProperty("width");this.getContainer().style.removeProperty("right");this.getContainer().style.removeProperty("max-width");this.getContainer().style.removeProperty("min-width");this.getCloseBtn().style.removeProperty("opacity");this.firePageEvent("onBeforeCloseComplete");this.fireFrameEvent("onBeforeCloseComplete");this.firePageEvent("onCloseComplete");this.fireFrameEvent("onCloseComplete");if(BX.type.isFunction(t)){t(this)}if(!this.isCacheable()){this.destroy()}}},firePageEvent:function(t){var e=this.getEvent(t);if(e===null){throw new Error("'eventName' is invalid.")}BX.onCustomEvent(this,e.getFullName(),[e]);if(BX.util.in_array(t,["onClose","onOpen"])){BX.onCustomEvent("BX.Bitrix24.PageSlider:"+t,[this]);BX.onCustomEvent("Bitrix24.Slider:"+t,[this])}return e},fireFrameEvent:function(t){var e=this.getEvent(t);if(e===null){throw new Error("'eventName' is invalid.")}var i=this.getFrameWindow();if(i&&i.BX){i.BX.onCustomEvent(this,e.getFullName(),[e]);if(BX.util.in_array(t,["onClose","onOpen"])){i.BX.onCustomEvent("BX.Bitrix24.PageSlider:"+t,[this]);i.BX.onCustomEvent("Bitrix24.Slider:"+t,[this])}}return e},getEvent:function(t){var e=null;if(BX.type.isNotEmptyString(t)){e=new BX.SidePanel.Event;e.setSlider(this);e.setName(t)}else if(t instanceof BX.SidePanel.Event){e=t}return e},canOpen:function(){return this.canAction("open")},canClose:function(){return this.canAction("close")},canCloseByEsc:function(){return this.canAction("closeByEsc")},canAction:function(t){if(!BX.type.isNotEmptyString(t)){return false}var e="on"+t.charAt(0).toUpperCase()+t.slice(1);var i=this.firePageEvent(e);var n=this.fireFrameEvent(e);return i.isActionAllowed()&&n.isActionAllowed()},handleFrameLoad:function(t){var e=this.iframe.contentWindow;var i=e.location;if(i.toString()==="about:blank"){return}e.addEventListener("keydown",this.handleFrameKeyDown);e.addEventListener("focus",this.handleFrameFocus);if(BX.browser.IsMobile()){e.document.body.style.paddingBottom=window.innerHeight*2/3+"px"}var n=i.pathname+i.search+i.hash;this.iframeSrc=BX.util.remove_url_param(n,["IFRAME","IFRAME_TYPE"]);this.url=this.iframeSrc;if(this.isPrintable()){this.injectPrintStyles()}if(this.loaded){this.firePageEvent("onLoad");this.fireFrameEvent("onLoad");this.firePageEvent("onReload");this.fireFrameEvent("onReload")}else{this.loaded=true;this.firePageEvent("onLoad");this.fireFrameEvent("onLoad")}if(this.isFocusable()){this.focus()}this.closeLoader()},handleFrameKeyDown:function(t){if(t.keyCode!==27){return}var e=BX.findChildren(this.getWindow().document.body,{className:"popup-window"},false);for(var i=0;i<e.length;i++){var n=e[i];if(n.style.display==="block"){return}}var a=this.getWindow().document.documentElement.clientWidth/2;var s=this.getWindow().document.documentElement.clientHeight/2;var r=this.getWindow().document.elementFromPoint(a,s);if(BX.hasClass(r,"bx-core-dialog-overlay")||BX.hasClass(r,"bx-core-window")){return}if(BX.findParent(r,{className:"bx-core-window"})){return}this.firePageEvent("onEscapePress");this.fireFrameEvent("onEscapePress")},handleFrameFocus:function(t){this.firePageEvent("onFrameFocus")},handleOverlayClick:function(t){if(t.target!==this.getOverlay()||this.animation!==null){return}this.close();t.stopPropagation()},handleCloseBtnClick:function(t){this.close();t.stopPropagation()},handlePrintBtnClick:function(t){if(this.isSelfContained()){var e=document.createElement("iframe");e.src="about:blank";e.name="sidepanel-print-frame";e.style.display="none";document.body.appendChild(e);var i=e.contentWindow;var n=i.document;n.open();n.write("<html><head>");var a="";var s=document.head.querySelectorAll("link, style");for(var r=0;r<s.length;r++){var o=s[r];a+=o.outerHTML}a+="<style>html, body { background: #fff !important; height: 100%; }</style>";n.write(a);n.write("</head><body>");n.write(this.getContentContainer().innerHTML);n.write("</body></html>");n.close();i.focus();i.print();setTimeout(function(){document.body.removeChild(e);window.focus()},1e3)}else{this.focus();this.getFrameWindow().print()}},injectPrintStyles:function(){var t=this.getFrameWindow().document;var e="";var i=t.body.classList;for(var n=0;n<i.length;n++){var a=i[n];e+="."+a}var s="@media print { body"+e+" { "+"background: #fff !important; "+"-webkit-print-color-adjust: exact;"+"color-adjust: exact; "+"} }";var r=t.createElement("style");r.type="text/css";if(r.styleSheet){r.styleSheet.cssText=s}else{r.appendChild(t.createTextNode(s))}t.head.appendChild(r)}};BX.SidePanel.Event=function(){this.slider=null;this.action=true;this.name=null};BX.SidePanel.Event.prototype={allowAction:function(){this.action=true},denyAction:function(){this.action=false},isActionAllowed:function(){return this.action},getSliderPage:function(){return this.slider},getSlider:function(){return this.slider},setSlider:function(t){if(t instanceof BX.SidePanel.Slider){this.slider=t}},getName:function(){return this.name},setName:function(t){if(BX.type.isNotEmptyString(t)){this.name=t}},getFullName:function(){return BX.SidePanel.Slider.getEventFullName(this.getName())}};BX.SidePanel.MessageEvent=function(t){BX.SidePanel.Event.apply(this);t=BX.type.isPlainObject(t)?t:{};if(!(t.sender instanceof BX.SidePanel.Slider)){throw new Error("'sender' is not an instance of BX.SidePanel.Slider")}this.setName("onMessage");this.setSlider(t.slider);this.sender=t.sender;this.data="data"in t?t.data:null;this.eventId=BX.type.isNotEmptyString(t.eventId)?t.eventId:null};BX.SidePanel.MessageEvent.prototype={__proto__:BX.SidePanel.Event.prototype,constructor:BX.SidePanel.MessageEvent,getSlider:function(){return this.slider},getSender:function(){return this.sender},getData:function(){return this.data},getEventId:function(){return this.eventId}};BX.SidePanel.Dictionary=function(t){if(t&&!BX.type.isPlainObject(t)){throw new Error("The argument must be a plain object.")}this.data=t?t:{}};BX.SidePanel.Dictionary.prototype={set:function(t,e){if(!BX.type.isNotEmptyString(t)){throw new Error("The 'key' must be a string.")}this.data[t]=e},get:function(t){return this.data[t]},delete:function(t){delete this.data[t]},has:function(t){return t in this.data},clear:function(){this.data={}},entries:function(){return this.data}}})();
/* End */
;
//# sourceMappingURL=kernel_sidepanel.map.js