$ZF.extends(ZObj,ZList,{CLASS:'ZList',PACKAGE:'zf.utils'},{
    length:function(){return this.getLength()}
});
function ZList( $type ){
    $ZF.super(this);
    var _type = $type;
    var _list = [], v;
    
    this.get = function(idx){return _list[idx]};
    this.shift = function(){return _list.shift()};
    this.pop = function(){return _list.pop()};
    this.indexOf = function( obj ){return _list.indexOf(obj)};
    this.join = function( separator ){return _list.join(separator)};
    this.splice = function(){return _list.splice.apply(_list,arguments)};
    this.slice = function( s, e ){
        s = parseInt(s)||0; e = parseInt(e)||_list.length;
        var list = new ZList(_type);
        for(var n = s; n < e; n++ ) list.push( _list[n] );
        return list;
    }
    this.concat = function(){
        var n,list = new ZList( _type );
        list.pushList( this );
        for( n = 0; n < arguments.length; n++ ){
            list.pushList( arguments[n] );}
        return list;
    }
    this.push = function(){
        for( var n=0,len=arguments.length; n < len; n++ ){
            v = arguments[n];
            if($ZF.typeOf(v,_type)) _list.push( v ); }
        return _list.length;
    }
    this.pushList = function( list ){
        if( !$ZF.typeOf(list,'ZList') ) return 0;
        if( _type != list.getType() ) return 0;
        _list.push.apply( _list, list.getData() );
        return _list.length;
    }
    this.unshift = function(){
        var n = arguments.length;
        while( n-- ){
            v = arguments[n];
            if($ZF.typeOf(v,_type)) _list.unshift( v ); }
        return _list.length;
    }
    
    this.toString = function(){
        var arr = [];
        var n = _list.length;
        while( n-- ) arr.unshift( _list[n].toString() );
        return arr.join(',');
    }
    this.getLength = function(){return _list.length};
    this.getType = function(){return _type};
    this.getData = function(){return _list.slice()};
    
    var _destroy = this.destroy.bind(this);
    this.destroy = function(){
        _list.splice(0,_list.length);
        _list = null;
        _destroy();
    }
}













$ZF.extends(ZObj,ZAjaxRequest,{
    CLASS:'ZAjaxRequest',PACKAGE:'zf.utils',FINAL:true},
    ['url','type','async','cache','timeout','dataType',
     'contentType','requestData','responseData','content'],
    ['url','type','async','cache','timeout','dataType','contentType']);
function ZAjaxRequest()
{
    $ZF.super(this);
    var _url=' ',_async=true,_cache=false,_timeout=30000,
        _type=ZAjax.POST,_dataType=ZAjax.JSON,_contentType=ZAjax.JSON,
        _requestData,_responseData;
    
    var _getProp = this.getProp.bind(this);
    this.getProp = function(prop){
        switch(prop){
            case'url':return _url;
            case'type':return _type;
            case'async':return _async;
            case'cache': return _cache;
            case'timeout':return _timeout;
            case'dataType':return _dataType;
            case'contentType':return _contentType;
            case'requestData':return _requestData;
            case'responseData':return _responseData;
            case'content':return _responseData;
            default:return _getProp(prop); }
    }
    var _setProp = this.setProp.bind(this);
    this.setProp = function(prop,value){
        switch(prop){
            case 'url': _url = value; break;
            case 'async': _async = (value)?true:false; break;
            case 'cache': _cache = (value)?true:false; break;  
            case 'timeout': _timeout = (value>0)?value:30000; break;
            case 'type':
                switch(value){
                    default: _type = ZAjax.POST; break;
                    case ZAjax.POST:case ZAjax.GET:
                        _type = value; break;} break;
            case 'dataType':
                switch(value){
                    default: _dataType = ZAjax.TEXT; break;
                    case ZAjax.JSON:case ZAjax.HTML:case ZAjax.XML:
                        _dataType = value; break;} break;
            case 'contentType':
                switch(value){
                    default: _contentType = ZAjax.TEXT; break;
                    case ZAjax.JSON:case ZAjax.HTML:case ZAjax.XML:
                        _contentType = value; break;} break;
            default: _setProp(prop,value); break; }
    }
    
    this.getRequestData = function(){return _requestData};
    this.setRequestData = function(v){_requestData = v};
    this.getResponseData = function(){return _responseData};
    this.setResponseData = function(v){_responseData = v};
    
    this.clone = function(){
        return new ZAjaxRequest().copy( this );
    }
    this.copy = function( target ){
        this.url = target.url||'';
        this.async = target.async;
        this.cache = target.cache;
        this.timeout = target.timeout;
        this.type = target.type;
        this.dataType = target.dataType;
        this.contentType = target.contentType;
        this.setRequestData( target.getRequestData() );
        this.setResponseData( target.getResponseData() );
        return this;
    }
}

$ZF.extends(ZDataEvent,ZAjaxEvent,{
    CLASS:'ZAjaxEvent',PACKAGE:'zf.utils'},{
    data:function(){return this.getData()}
});
ZAjaxEvent.OPEN = 'open';
ZAjaxEvent.PROGRESS = 'progress';
ZAjaxEvent.COMPLETE = 'complete';
ZAjaxEvent.SUCCESS = 'success';
ZAjaxEvent.IO_ERROR = 'ioError';
ZAjaxEvent.PARSE_ERROR = 'parseError';
function ZAjaxEvent( $type, $ajaxRquest )
{
    if( $ajaxRquest instanceof ZAjaxRequest == false ){
        $Z.error('',ErrorCode.DATA_TYPE,$ajaxRquest,'ZAjaxEvent',1);
        return;}
    $ZF.super(this,[$type,$ajaxRquest]);
    this.destroy = function(){
        _destroy();
        _data = null; _destroy = null;
    }
}



ZAjax.POST = 'post';
ZAjax.GET = 'get';
ZAjax.JSON = 'json';
ZAjax.XML = 'xml';
ZAjax.HTML = 'html';
ZAjax.TEXT = 'text';
ZAjax.OPEN = 'open';
ZAjax.PROGRESS = 'progress';
ZAjax.COMPLETE = 'complete';



$ZF.extends(ZEventDispatcher,ZAjax,{
    CLASS:'ZAjax',PACKAGE:'zf.utils'
},{
    request:function(){return this.getRequest()},
    response:function(){return this.getResponse()},
    content:function(){return this.getResponse().getResponseData()}
});
function ZAjax( $url )
{
    $ZF.super(this);
    new ZDebug(this,'ZAjax');
    
    var http,
        _response = new ZAjaxRequest(),
        _request = new ZAjaxRequest();
    this.url = _request.url;
    this.type = _request.type;
    this.dataType = _request.dataType;
    this.contentType = _request.contentType;
    this.async = _request.async;
    this.cache = _request.cache;
    this.timeout = _request.timeout;
    this.getRequest = function(){return _request.clone()};
    this.getResponse = function(){return _response.clone()};
    
    this.onComplete;this.onSuccess;this.onError;this.onData;this.onOpen;
    this.open = function( $func ){this.onOpen = $func; return this; }
    this.done = function( $func ){this.onSuccess = $func; return this;}
    this.fail = function( $func ){this.onError = $func; return this;}
    this.complete = function( $func ){this.onComplete = $func; return this;}
    this.progress = function( $func ){this.onData = $func; return this;}
    
    var _open = function(){
        var request = this.getRequest();
        this.dispatchEvent( new ZAjaxEvent(ZAjaxEvent.OPEN,request) );
        if( $ZF.isFunc(this.onOpen) ) this.onOpen(request);
    }
    var _progress = function(){
        var request = this.getRequest();
        this.dispatchEvent( new ZAjaxEvent(ZAjaxEvent.PROGRESS,request) );
        if( $ZF.isFunc(this.onData) ) this.onData(request);
    }
    var _success = function( data ){
        var response = this.getResponse();
        this.dispatchEvent( new ZAjaxEvent(ZAjaxEvent.SUCCESS,response) );
        if( $ZF.isFunc(this.onSuccess) ){
            this.onSuccess( data );
        }
    }
    var _error = function( data, status ){
        var response = this.getResponse();
//        this.dispatchEvent( new ZAjaxEvent(ZAjaxEvent,response) );
        if( $ZF.isFunc(this.onError) ){
            this.onError( data, status );
        }
    }
    var _complete = function(){
        var header = http.getResponseHeader("Content-Type");
//        console.log( '$responseType', http.responseType );
//        console.log( '$getResponseHeader', header );
//        console.log( '@@contentType:', _request.contentType );
        
//        if( _response ) _response.destroy();
//        _response = _request.clone();
        _response.copy( _request );
        switch( _request.contentType ){
            case ZAjax.JSON: parseJson.call(this); break;
            case ZAjax.XML: parseXml.call(this); break;
            case ZAjax.HTML: parseHtml.call(this); break;
            case ZAjax.TEXT: parseText.call(this); break;
        }
        var response = this.getResponse();
        this.dispatchEvent( new ZAjaxEvent(ZAjaxEvent.COMPLETE,response) );
        if($ZF.isFunc(this.onComplete)){
            this.onComplete( response.getResponseData() );
        }
    }
    
    var parseText = function(){
        this.debug( 'ZAjax.parseText' );
        _response.setResponseData( http.responseText );
    }
    var parseXml = function(){
        this.debug( 'ZAjax.parseXml' );
        try{
            var xml = $ZF.parseXML( http.responseText );
            _success.apply(this,[xml]);
        }catch(e){
            _error.apply(this,[http.responseText]);
        }
        
    }
    var parseHtml = function(){
        this.debug( 'ZAjax.parseHtml' );
        try{
            var html = $ZF.parseHTML( http.responseText );
            _success.apply(this,[html]);
        }catch(e){
            _error.apply(this,[http.responseText]);
        }
    }
    var parseJson = function(){
        this.debug( 'ZAjax.parseJson' );
        try{
            var json = $ZF.parseJSON( http.responseText );
            _response.setResponseData( json );
            _success.apply(this,[json]);
        }catch(e){
            _error.apply(this,[http.responseText]);
        }
    }
    
    
    
    
    
    /*
    * load( request:ZAjaxRequest );
    * load( url:String, data:Object );
    * load( ajaxObj:Object );
    */
    this.load = function( $request, $data, $type ){
        var request;
        
        if( $request instanceof ZAjaxRequest ){
            request = $request;
        }else{
            request = this.getRequest();
            if( $ZF.isStr($request) ) request.url = $request;
            request.type = this.type;
            request.dataType = this.dataType;
            request.contentType = this.contentType;
            request.async = this.async;
            request.cache = this.cache;
            request.timeout = this.timeout;
        }
        if( $data ) request.setRequestData( $data );
        if( $type ) request.setType( $type );
        
        this.sendRequest( request );
        return this;
    }
    
    
    
    
    this.close = function(){
        if( http ){
            http.onreadystatechange = null;
            var handler = this.onRequestEvent.bind(this);
            http.removeEventListener("loadstart",handler);
            http.removeEventListener("progress",handler);
            http.removeEventListener("error",handler);
            http.removeEventListener("abort",handler);
            http.removeEventListener("timeout",handler);
            http.removeEventListener("load",handler);
            http.removeEventListener("loadend",handler);
        }
    }
    this.getHttpRequest = function(){
        if( http ) return http;
        if(window.XMLHttpRequest){return new XMLHttpRequest();}
        else if(window.ActiveXObject){
            try{return new ActiveXObject("Msxml2.XMLHTTP");}
            catch(e){
                try{ return new ActiveXObject("Microsoft.XMLHTTP");}
                catch(e2){ return null;}}};
        return null;
    }
    this.sendRequest = function( $request ){
        if( $request instanceof ZAjaxRequest == false ){
            $Z.error( "DataType miss [ZAjaxRequest]", 
                 ErrorCode.DATA_TYPE,this,'ZAjax.sendRequest');
            return;};
        this.debug('sendRequest');
        _request.copy( $request );
        if( !http ){
            http = this.getHttpRequest();
            http.onreadystatechange = this.onReadyStateChange.bind(this);
            var handler = this.onRequestEvent.bind(this);
            http.addEventListener("loadstart",handler);
            http.addEventListener("progress",handler);
            http.addEventListener("error",handler);
            http.addEventListener("abort",handler);
            http.addEventListener("timeout",handler);
            http.addEventListener("load",handler);
            http.addEventListener("loadend",handler);
        };
        http.open( _request.type, _request.url, _request.async );
//        http.responseType = _request.contentType;
        http.setRequestHeader(
            'Content-Type','application/x-www-form-urlencoded');
//        http.responseType = 'json';
//        http.overrideMimeType("text/plain; charset=x-user-defined");
        
        switch( _request.contentType ){
            case ZAjax.XML:
                http.overrideMimeType('text/xml');
                break;
        }
        
        http.send( 'sendData' );
    };
    this.onRequestEvent = function(e){
//        console.log( '@@ onRequestEvent: ' + e.type );
    };
    this.onReadyStateChange = function(){
        console.log( '## onReadyStateChange' );
        console.log( 'readyState: ' + http.readyState );
        console.log( 'status: ' + http.status );
        
        switch( http.readyState ){
            case ZAjaxStatus.LOADING:
//                console.log('-LOADING');
                _open.call(this);
                break;
            case ZAjaxStatus.LOADED:
//                console.log('-LOADED');
                break;
            case ZAjaxStatus.INTERACTIVE:
//                console.log('-INTERACTIVE');
                _progress.call(this);
                break;
            case ZAjaxStatus.COMPLETED:
//                console.log('-COMPLETED');
                _complete.call(this);
                break;
        };
    };
}
const ZAjaxStatus = {
    UNINITIALIZED:0,LOADING:1,LOADED:2,INTERACTIVE:3,COMPLETED:4,
    SUCCESS:200,FORBIDDEN:403,NOT_FOUND:404,
    INTERNAL_SERVER_ERROR:500
};