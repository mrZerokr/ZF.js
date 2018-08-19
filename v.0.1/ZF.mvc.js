const $ZMVCPK = 'zf.mvc';

$ZF.extends(ZSystemModule,ZMVC,{P:$ZMVCPK,F:true,O:true});
function ZMVC()
{
    var $super = $ZF.super(this,['ZMVC','0.1.0']);
    if(!$super) return;
    new ZDebug(this,'ZMVC');
    
    var _facade = $Z.facade = new ZFacade();
    this.getFacade = function(){ return _facade };
    this.initialize = function(){
        _facade.initialize();
    }
    this.dispose = function(){
        $Z.throw("ZMVC is can't be dispose",
                 ErrorCode.DISABLE_FUNC,this,'ZMVC.dispose');
    }
}

$ZF.extends(ZObject,ZFacade,{P:$ZMVCPK,F:true,O:true},
    ['facade','model','view','control','inited']);
ZFacade.STARTUP = 'startup';
function ZFacade()
{
    var $super = $ZF.super(this,false);
    if(!$super) return;
    new ZDebug(this,'ZFacade');
    
    var _inited = false;
    var _model = new ZModel(this),
        _view = new ZView(this),
        _control = new ZControl(this);
    
    $super.override('getProp',function(prop){
        switch(prop){
            default:return $super.getProp(prop);
            case'facade':return this;
            case'model':return _model;
            case'view':return _view;
            case'control':return _control;
            case'inited':return _inited;
        }
    });
    
    this.dispose = function(){
        $Z.throw("ZFacade is can't be dispose",
                 ErrorCode.DISABLE_FUNC,this,'ZFacade.destroy');
    }
    this.initialize = function(){
        _model.initialize();
        _view.initialize();
        _inited = true;
        _model.onReady();
        _view.onReady();
        this.sendNotify( ZFacade.STARTUP );
    }
    this.getFacade = function(){ return this };
    this.getModel = function(){ return _model };
    this.getView = function(){ return _view };
    this.getControl = function(){ return _control };
    
    this.regiProxy = function($ZProxy){
        _model.registerAgent($ZProxy)};
    this.removeProxy = function(name){_model.removeAgent(name)};
    this.hasProxy = function(name){return _model.hasAgent(name)};
    this.getProxy = function(name){return _model.getAgent(name)};
    
    this.regiMediator = function($ZMediator){
        _view.registerAgent($ZMediator)};
    this.removeMediator = function(name){_view.removeAgent(name)};
    this.hasMediator = function(name){return _view.hasAgent(name)};
    this.getMediator = function(name){return _view.getAgent(name)};
    
    this.hasCommand = function(name){return _control.hasAgent(name)};
    this.removeCommand = function(name){_control.removeAgent(name)};
    this.regiCommand = function($noti,$Class){
        if( !$ZF.typeOf( $Class, 'ZCommand' ) ){
            $Z.error('',ErrorCode.DATA_TYPE,this, 
                     'ZFacade.regiCommand',1 ); return; };
        _control.registerAgent( new ZCommandQue( $noti, $Class ) );
    }
    
    this.useTrace = true;
    this.sendNotify = function( $ZNotify, d,t){
//        this.debug('NOTIFY:',$ZNotify);
        if( typeof($ZNotify) == 'string' ){
            $ZNotify = new ZNotify( $ZNotify, d, t ); }
        if( this.useTrace ){
            switch( $ZNotify.name ){
                case 'ZMVCAction':break;
                default:
                    var s = '- - - - - - - -';
                    console.log(0,s+'\n| NOTIFY: '+$ZNotify.getName()+'\n'+s);
                    break;
            }
            
        }
        _control.notify( $ZNotify );
        _view.notify( $ZNotify );
    }
}

$ZF.extends(ZObject,ZMVCCore,{P:$ZMVCPK,L:3},{
    facade:{get:function(){return this.getFacade()}},
    inited:{get:function(){return this.getInited()}}
});
function ZMVCCore( $facade, $name )
{
    var $super = $ZF.super(this);
    new ZDebug(this,$name);
    var _facade = $facade;
    var _name = $name;
    var _stack = [];
    var _listeners = {};
    var _inited = false;
    
    $super.disable('dispose',_name+" is can't be dispose.");
    
    this.getFacade = function(){return _facade};
    this.registerAgent = function( $agent ){
        if( !$ZF.extendsOf($agent,'ZMVCAgent') ){
            $Z.error( ErrorCode.DATA_TYPE, '', this, 
                     'ZMVCCore.registerAgent' ); return null; }
        var arr = $agent.notifyList();
        var noti, n = arr.length;
        while( n-- ){
            noti = arr[n];
            if( !_listeners.hasOwnProperty(noti)){
                _listeners[noti] = [$agent];}
            else{
                _listeners[noti].push($agent);}}
        _stack.push( $agent );
        $agent.onRegister();
        if( _inited ){
            $agent.onInit();
            $agent.onReady();};
        return $agent;
    }
    this.removeAgent = function( $name ){
        var agent, list, arr, a, b, n = _stack.length;
        while( n-- ){
            if( _stack[n].name == $name ){
                agent = _stack[n];
                list = agent.notifyList();
                a = list.length;
                while( a-- ){
                    arr = _listeners[ list[a] ];
                    b = arr.length;
                    while( b-- ){
                        if( arr[b] == agent ) arr.splice(b,1);}}
                _stack.splice(n,1);
                agent.onRemove();}}
    }
    this.hasAgent = function( $name ){
        return (this.getAgent($name))?true:false;
    }
    this.getAgent = function( $name ){
        var n = _stack.length;
        while( n-- ){
            if( _stack[n].name == $name ) return _stack[n]; }
        return null;
    }
    this.notify = function( $ZNotify ){
        var name = $ZNotify.name;
        if( _listeners.hasOwnProperty(name) ){
            var arr = _listeners[name];
            for( var n = 0; n < arr.length; n++ ){
                arr[n].notifyHandler.call( arr[n], $ZNotify );}}
    }
    this.initialize = function(){
        if( _inited ) return;
        for( var n = 0; n < _stack.length; n++ ){
            _stack[n].onInit();}
    }
    this.onReady = function(){
        if( _inited ) return;
        for( var n = 0; n < _stack.length; n++ ){
            _stack[n].onReady();}
        _inited = true;
    }
}



$ZF.extends(ZMVCCore,ZModel,{P:$ZMVCPK,F:true,O:true});
function ZModel( $facade )
{
    var $super = $ZF.super(this,[$facade,'ZModel']);
    $super.disable('notify');
}

$ZF.extends(ZMVCCore,ZView,{P:$ZMVCPK,F:true,O:true});
function ZView( $facade )
{
    $ZF.super(this,[$facade,'ZView']);
}

$ZF.extends(ZMVCCore,ZControl,{P:$ZMVCPK,F:true,O:true});
function ZControl( $facade )
{
    var $super = $ZF.super(this,[$facade,'ZControl']);
    $super.disable('getAgent');
    $super.disable('initialize');
    $super.disable('onReady');
}




$ZF.extends(ZObject,ZMVCAgent,$ZMVCPK,{
    facade:function(){return this.getFacade()},
    name:function(){return this.getName()}});
function ZMVCAgent( $name )
{
    $ZF.super(this,false);
    var _name = $name;
    this.getName = function(){ return _name };
    this.notifyList = function(){return []};
    this.notifyHandler = function( $ZNotify ){};
    this.onRegister = function(){};
    this.onRemove = function(){};
    this.onInit = function(){};
    this.onReady = function(){};
    this.dispose = function(){};
    
    this.getFacade = function(){
        return $Z.MVC.getFacade();
    }
    this.sendNotify = function( $ZNotify, d,t){
        this.getFacade().sendNotify( $ZNotify, d, t );
    }
}

$ZF.extends(ZMVCAgent,ZCommandQue,{P:$ZMVCPK,F:true});
function ZCommandQue( $noti, $Class )
{
    if( !$ZF.classOf( $Class, 'ZCommand' ) ){
            $Z.error( ErrorCode.DATA_TYPE, '', $Class, 
                     'ZCommandQue.CONSTRUCTOR' ); return; };
    $ZF.super(this,$noti);
    new ZDebug(this,'ZCommandQue',true);
    
    var _noti = $noti;
    var _class = $Class;
    this.notifyList = function(){return [_noti]};
    this.notifyHandler = function( $ZNotify ){
        var cmd = new _class();
        if(!cmd.run( $ZNotify )) cmd.destroy();
    };
}

$ZF.extends(ZMVCAgent,ZProxy,$ZMVCPK,{
    proxyName:function(){return this.getName()}
});
function ZProxy( $name )
{
    $ZF.super(this,[$name]);
    
    var _data;
    this.getData = function(){ return _data };
    this.setData = function( $data ){ _data = $data };
}

$ZF.extends(ZMVCAgent,ZMediator,$ZMVCPK,{
    mediatorName:function(){return this.getName()}
});
function ZMediator( $name )
{
    $ZF.super(this,[$name]);
    var _viewComponent;
    this.getViewComponent = function(){ return _viewComponent };
    this.setViewComponent = function( $view ){ _viewComponent = $view };
}

$ZF.extends(ZObject,ZCommand,$ZMVCPK);
function ZCommand( $name )
{
    $ZF.super(this);
    this.run = function( $ZNotify ){};
}

$ZF.extends(ZObject,ZNotify,$ZMVCPK,
    ['name','body','type']);
function ZNotify( $name, $body, $type )
{
    var $super = $ZF.super(this);
    var _name = $name;
    var _body = $body || null;
    var _type = $type || '';
    this.getName = function(){return _name};
    this.getBody = function(){return _body};
    this.getType = function(){return _type};
    
    $super.override('dispose',function(){
        _name = _body = _type = null;
        $super.dispose();$super=null;
    });
    $super.override('getProp',function(prop){
        switch(prop){
            case 'name':return _name;
            case 'body':return _body;
            case 'type':return _type;
            default:return $super.getProp(prop);}
    });
}

//console.log( $Z );

//$Z.mvc = {
//    core:new ZMVC()
//};
$ZF.addModule( new ZMVC(), 'MVC' );


//$(document).ready(function(e) {
//    $Z.mvc.core.initialize();
//});




