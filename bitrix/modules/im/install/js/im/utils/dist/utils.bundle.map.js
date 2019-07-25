{"version":3,"sources":["utils.bundle.js"],"names":["this","BX","exports","im_const","Utils","browser","isSafari","navigator","userAgent","toLowerCase","includes","isSafariBased","isChrome","isFirefox","isIe","match","platform","isMac","isLinux","isWindows","isBitrixMobile","isBitrixDesktop","isMobile","isAndroid","isIos","getIosVersion","matches","device","isDesktop","isMobileStatic","orientationHorizontal","orientationPortrait","getOrientation","Math","abs","window","orientation","types","isString","item","String","isArray","Object","prototype","toString","call","isFunction","Function","isDomNode","babelHelpers","typeof","isDate","isPlainObject","nodeType","hasProp","hasOwnProperty","constructor","e","key","isDarkColor","hex","length","replace","darkColor","bigint","parseInt","red","green","blue","brightness","getDateFormatType","type","arguments","undefined","DateFormat","default","localize","message","format","groupTitle","Main","Date","convertBitrixFormat","recentTitle","recentLinesTitle","hashCode","string","hash","JSON","stringify","i","char","charCodeAt","versionCompare","version1","version2","isNumberRegExp","test","NaN","split","push","throttle","callback","wait","context","timeout","callbackArgs","nextCallback","apply","setTimeout","debounce","clearTimeout","htmlspecialchars","htmlspecialcharsback","getLogTrackingParams","params","result","_params$name","name","_params$data","data","_params$dialog","dialog","_params$message","_params$files","files","encodeURIComponent","Array","dataArray","_name","entityId","join","Messenger","Const"],"mappings":"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","file":"utils.bundle.map.js"}