const HTTPStatus = {'1XX':'Information','2XX':'Successful','3XX':'Redirection','4XX':'Client Error','5XX':'Server Error','100':'Continue','101':'Switching Protocols','103':'Checkpoint','200':'OK','201':'Created',202:'Accepted',203:'Non-Authoritative Information','204':'No Content','205':'Reset Content','206':'Partial Content','300':'Multiple Choices','302':'Found','303':'See Other','304':'Not Modified','306':'Switch Proxy','307':'Temporary Redirect','308':'Resume Incomplete','400':'Bad Request','401':'Unauthorized','402':'Payment Required','403':'Forbidden','404':'Not Found','405':'Method Not Allowed','406':'Not Acceptable','407':'Proxy Authentication Required','408':'Request Timeout','409':'Conflict','410':'Gone','411':'Length Required','412':'Precondition Failed','413':'Request Entity Too Large','414':'Request-URI Too Long','415':'Unsupported Media Type','416':'Requested Range Not Satisfiable','417':'Expectation Failed','500':'Internal Server Error','501':'Not Implemented','502':'Bad Gateway','503':'Service Unavailable','504':'Gateway Timeout','505':'HTTP Version Not Supported','511':'Network Authentication Required',
UNINITIALIZED:0,LOADING:1,LOADED:2,INTERACTIVE:3,COMPLETED:4};


$ZF.extends(ZObject,ZURLRequest,'zf.net');
function ZURLRequest( $url, $type )
{
    $ZF.super(this);
    this.url = $url||'';
    this.type = $type||'POST';
    this.async = true;
    this.cache = false;
    this.timeout = 30000;
    this.data = '';
    this.dataType = 'text';
    this.content = '';
    this.contentType = 'text';
    this.responseURL = '';
    this.responseText = '';
    this.responseType = '';
    
    this.regular = function(){
        this.async = (this.async)?true:false;
        this.cache = (this.cache)?true:false;
        switch(this.type.toUpperCase()){
            case'POST':case'GET':break;
            default:this.type='POST';}
        switch(this.dataType.toUpperCase()){
            case'JSON':case'XML':case'HTML':case'TEXT':break;
            default:this.dataType='JSON';}
        switch(this.contentType.toUpperCase()){
            case'JSON':case'XML':case'HTML':case'TEXT':break;
            default:this.contentType='JSON';}
    }
    this.copy = function( target ){
        this.url = target.url;
        this.type = target.type;
        this.async = target.async;
        this.cache = target.cache;
        this.timeout = target.timeout;
        this.dataType = target.dataType;
        this.contentType = target.contentType;
        this.regular();
        return this;
    }
    this.clone = function(){return new ZURLRequest().copy(this);}
}


$ZF.extends(ZEventDispatcher,ZURLLoader,'zf.net',
    ['request','data','url']);
function ZURLLoader()
{
    var $super = $ZF.super(this);
//    new ZDebug(this,'ZURLLoader',true);
    
    this.name = '';
    var _request = null;
    
    $super.override('getProp',function(prop){
        switch(prop){
            case'request':return _request;
            case'url':return (_request)?_request.url:'';
            case'data':return (_request)?_request.content:'';
            default: return $super.getProp(prop);
        }
    });
    
    this.loadUrl = function( $url, $type ){
        var request = new ZURLRequest( $url, $type );
        this.load( request );
        return this;
    }
    this.load = function( $request ){
        if( $request instanceof ZURLRequest == false ){
            $Z.throw('',ErrorCode.DATA_TYPE,'','ZURLLoader.load');
            return;}
        this.debug('load');
        _request = $request.clone();
        _sendRequest.call(this,_request);
        return this;
    }
    this.getHTTPRequest = function(){
        if(window.XMLHttpRequest){return new XMLHttpRequest();}
        else if(window.ActiveXObject){
            try{return new ActiveXObject("Msxml2.XMLHTTP");}
            catch(e){
                try{ return new ActiveXObject("Microsoft.XMLHTTP");}
                catch(e2){ return null;}}};
        return null;
    }
    
    this.onComplete;this.onSuccess;this.onError;this.onData;this.onOpen;
    this.open = function( $func ){this.onOpen = $func; return this; }
    this.done = function( $func ){this.onSuccess = $func; return this;}
    this.fail = function( $func ){this.onError = $func; return this;}
    this.complete = function( $func ){this.onComplete = $func; return this;}
    this.progress = function( $func ){this.onData = $func; return this;}
    
    var _http;
    var _sendRequest = function( request ){
        this.debug('sendRequest');
        
        var type = request.type;
        var url = request.url;
        var async = request.async;
        
        _http = this.getHTTPRequest();
        _http.timeout = request.timeout;
        _http.onreadystatechange = _onReadyStateChange.bind(this);
        
        _http.open( type, url, async );
        _http.setRequestHeader(
            'Content-Type','application/x-www-form-urlencoded');
        _http.send( 'sendData' );
    }
    
    var _onReadyStateChange = function(){
//        console.log( '## onReadyStateChange' );
//        console.log( 'readyState: ' + _http.readyState );
//        console.log( 'status: ' + _http.status );
        switch( _http.readyState ){
            case HTTPStatus.LOADING: _open.call(this); break;
            case HTTPStatus.INTERACTIVE: _progress.call(this); break;
            case HTTPStatus.COMPLETED: _complete.call(this); break;
        }
    }
    
    var _open = function(){
//        console.log(0,'open');
        var event = new ZDataEvent(ZEvent.OPEN);
        this.dispatchEvent( event );
    }
    var _progress = function(){
//        console.log(1,'progress');
        var event = new ZDataEvent(ZEvent.PROGRESS);
        this.dispatchEvent( event );
    }
    var _complete = function(){
//        console.log(2,'complete');
        _request.responseText = _http.responseText;
        _request.responseType = _http.responseType;
        _request.content = _request.responseText;
        
        var event = new ZDataEvent(ZEvent.COMPLETE,_request.content);
        this.dispatchEvent( event );
//        console.log(_http);
    }
    var _success = function( data ){
        console.log(3,'success');
    }
    var _error = function( data, status ){
        console.log(4,'error');
    }
}



$ZF.extends(ZEventDispatcher,ZAjax,'zf.net');
function ZAjax( $url )
{
    $ZF.super(this);
    new ZDebug(this,'ZAjax',true);
    
    this.onComplete;this.onSuccess;this.onError;this.onData;this.onOpen;
    this.open = function( $func ){this.onOpen = $func; return this; }
    this.done = function( $func ){this.onSuccess = $func; return this;}
    this.fail = function( $func ){this.onError = $func; return this;}
    this.complete = function( $func ){this.onComplete = $func; return this;}
    this.progress = function( $func ){this.onData = $func; return this;}
    
    
    var loader;
    
    this.load = function( $request, $data, $type ){
        var request;
        if( $request instanceof ZURLRequest ){
            request = $request;
        }else{
            request = new ZURLRequest;
            request.url = $request;
            if( $data ) request.data = $data;
            if( $type ) request.type = $type;
        }
        if( !loader ){
            loader = new ZURLLoader;
        }
        loader.load( request );
        return this;
    }
    
    var _open = function(){
        
    }
    var _progress = function(){
        
    }
    var _success = function( data ){
        
    }
    var _error = function( data, status ){
        
    }
    var _complete = function(){
        
    }
}


















