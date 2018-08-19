$PK = 'zf.scm';
$ZF.extends(ZSystemModule,ZSCM,{P:$PK,F:true,O:true},{
    VERSION:function(){return this.getVersion()}});
function ZSCM()
{
    var self = $ZF.self(this,['ZSCM','0.0.1']);
    
    self.override('startup',function(){
        self.super.startup();
    });
};

$ZF.addModule( new ZSCM(), 'SCM' );



$ZF.extends(ZObject,ZAction,$PK,
    ['name','data','to','from','target']);
// ZAction( name:String, data:Object=null, to:String='', from:String='', target=null ):void
function ZAction( N, D, T, F, TG, O )
{
    var self = $ZF.self(this);
    var n=N||'',d=D||null,f=F||'',t=T||'',tg=TG||null,ob=O||'';
    
    self.override('getProp',function(prop){
        switch(prop){
            case'name':return n;
            case'data':return d;
            case'from':return f;
            case'to':return t;
            case'target':return tg;
            case'observer':return ob;
            default: return self.super.getProp(prop);}
    });
}


$ZF.extends(ZObject,ZDirector,$PK);
function ZDirector( name, parent )
{
    var $super = $ZF.super(this);
    var $cs=[],$ss=[],$ms=[],$as=[];
    var $cnt=1,$rn=false;
    
    // register( target:ZSCMAgent ):uint
    this.register = function(T){
        
    }
}


















/*
function ZSCM()
{
    var $super = $ZF.super(this,['ZSCM','0.0.1'],ZDebug);
    
    var $O = new ZSCMObserver('');
    var $H = {'':$O};
    
    $super.override('startup',function(){
        this.debug('startup');
        $super.startup();
        for( var s in $H ){
            $H[s].startup();
        }
    });
    // addObserver( observer:ZSCMObserver ):void
    this.addObserver = function(O){
        if(O instanceof ZSCMObserver)$H[O.name]=O;
    }
    // getObserver( name:String ):ZSCMObserver
    this.getObserver = function(N){
        if(!N)N='';
        if(!$H.hasOwnProperty(N))$H[N]=new ZSCMObserver(N);
        return $H[N];
    }
    // sendAction( action:ZAction, observer:ZSCMObserver ):void
    this.sendAction = function(A,O){
        if(!O) $O.sendAction(A);
        else this.getObserver(O).sendAction(A);
    }
    // register( target:ZSCMObj, observer:ZSCMObserver ):void
    this.register = function(T,O){
        this.getObserver(O).register(T);
    }
    // unregister( target:ZSCMObj, observer:ZSCMObserver ):void
    this.unregister = function(T,O){
        this.getObserver(O).unregister(T);
    }
}



$ZF.extends(ZObject,ZAction,$PK,
    ['name','data','to','from','target']);
// ZAction( name:String, data:Object=null, to:String='', from:String='', target=null ):void
function ZAction( N, D, T, F, TG, O )
{
    var $super=$ZF.super(this);
    var n=N||'',d=D||null,f=F||'',t=T||'',tg=TG||null,ob=O||'';
    
    $super.override('getProp',function(prop){
        switch(prop){
            case'name':return n;
            case'data':return d;
            case'from':return f;
            case'to':return t;
            case'target':return tg;
            case'observer':return ob;
            default: return $super.getProp(prop);}
    });
}


$ZF.extends(ZObject,ZDirector,$PK);
function ZDirector( name, parent )
{
    var $super = $ZF.super(this);
    var $cs=[],$ss=[],$ms=[],$as=[];
    var $cnt=1,$rn=false;
    
    // register( target:ZSCMAgent ):uint
    this.register = function(T){
        
    }
}




$ZF.extends(ZObject,ZSCMObserver,{P:$PK,F:true});
ZSCMObserver.getInstance = function(){
    if($Z&&$Z.SCM) return $Z.SCM.getObserver();
    else $Z.getModule('ZSCM').getObserver();}
function ZSCMObserver(name)
{
    this.name = name;
    var $super = $ZF.super(this);
    var _components=[],_storages=[],_macros=[],_stack=[];
    var _count = 1, _running = false;
    if($Z.SCM)$Z.SCM.addObserver(this);
    $super.disable('dispose',"ZSCMObserver is can't be dispose");
    new ZDebug(this,'ZSCMObserver');
    
    this.startup = function(){
        if(_running)return;
        _running = true;
        for( var n = 0; n < _stack.length; n++ ){
            _stack[n].onStartup();
        }
    }
    this.sendAction = function( $action ){
        var list, n, to = $action.to;
        this.debug('sendAction','TO:'+to);
        switch( to ){
            case 'component':list=_components;to='';break;
            case 'storage':list=_storages;to='';break;
            case 'macro':list=_macros;to='';break;
            default:list=_stack;break;
        }
        console.log(0,'A:'+this.name,$action.name);
        if( to == '' ){
            for(n=0;n<list.length;n++){
                list[n].onAction( $action );}}
        else{
            for(n=0;n<list.length;n++){
                if(list[n].name == to ){
                    list[n].onAction( $action );}}}
    }
    this.getComponent = function( target ){
        var tg, n = _components.length;
        while( n-- ){
            tg = _components[n];
            if(tg.name==target||tg.key==target){return tg;}}
        return null;
    }
    this.getStorage = function( target ){
        var tg, n = _storages.length;
        while( n-- ){
            tg = _storages[n];
            if(tg.name==target||tg.key==target){return tg;}}
        return null;
    }
    this.getMacro = function( target ){
        var tg, n = _macros.length;
        while( n-- ){
            tg = _macros[n];
            if(tg.name==target||tg.key==target){return tg;}}
        return null;
    }
    
    this.register = function( target ){
        if(!$ZF.isZObject(target))return 0;
        this.debug('register',target.dataType);
        if( target instanceof ZComponent ){
            _components.push(target);
        }else if( target instanceof ZStorage ){
            _storages.push(target);
        }else if( target instanceof ZMacro ){
            _macros.push(target);
        }else{
            return 0;
        }
        _stack.push(target);
        target.__init();
        return _count++;
    }
    this.unregister = function( target ){
        if(!$ZF.isZObj(target))return;
        this.debug('unregister',target.dataType);
        var n, list;
        if( target instanceof ZComponent ){
            list = _components;
        }else if( target instanceof ZStorage ){
            list = _storages;
        }else if( target instanceof ZMacro ){
            list = _macros;
        }else{return;}
        n = list.length;
        while( n-- ){
            if(list[n]==target){list.splice(n,1);}}
        n = _stack.length;
        while( n-- ){
            if(_stack[n]==target){_stack.splice(n,1);}}
    }
}


$ZF.extends(ZEventDispatcher,ZSCMObj,$PK,
            ['key','observer','registered']);
function ZSCMObj( $name, $opt )
{
    this.name = $name;
    this.zopt = $ZF.zobj($opt);
    this.opt = this.zopt.getObj();
    var $super = $ZF.super(this);
    var _observer, _key = 0;
//    new ZDebug(this,$name);
    
    // sendAction( action:ZAction, observer:String='' ):Self
    // sendAction( name:String, data:Object=null, to:String='', observer:String='' ):Self
    this.sendAction = function( N, D, T, O ){
        if(_observer){
            var tg;
            if( N instanceof ZAction ){
                tg = (D)?$Z.SCM.getObserver(D):_observer;
                tg.sendAction( N );
            }else{
                tg = (O)?$Z.SCM.getObserver(O):_observer;
                tg.sendAction(new ZAction(N,D,T,this.name,this));
            }
        }
        return this;
    }
    
    this.__init = function(){this.onInit();}
    this.__ready = function(){this.onReady();}
    this.__startup = function(){this.onStartup();}
    this.onInit = function(){}
    this.onReady = function(){}
    this.onStartup = function(){}
    this.onAction = function( $action ){}
    // register( observer:String='' ):Self
    this.register = function(O){
        if(_observer)return;
        if(!$Z||!$Z.SCM)return this;
        this.debug('register');
        _observer = $Z.SCM.getObserver(O);
        console.log(88,_observer);
        _key = _observer.register(this);
        if(!this.name) this.name = this.dataType+_key;
        return this;
    }
    this.unregister = function(){
        if(!_observer) return;
        _observer.unregister(this);
        _observer = null; _key = 0;
        return this;
    }
    $super.override('getProp',function(prop){
        switch(prop){
            case'key':return _key;
            case'observer':return _observer;
            case'registered':return (_observer)?true:false;
            default: return $super.getProp(prop);}
    });
    $super.override('dispose',function(){
        if(_observer){
            _observer.unregister(this);
            _observer=null;
        }
        $super.dispose();$super=null;
    });
}


$ZF.extends(ZSCMObj,ZComponent,$PK);
function ZComponent( $name, $opt )
{
    var $super = $ZF.super(this,[$name,$opt]);
    
    var _body = this.zopt.get('body','#'+this.name);
    this.body = function( selector ){
        if(!selector) selector = '';
        return $(_body+' '+selector);
    }
    this.loadSkin = function( url ){
        this.sendAction('loadSkin',url,'ZComponentSkin');
    }
    this.__init = function(){
        this.onInit();
        if(!this.zopt.has('skinUrl')) this.__ready();
        else this.loadSkin(this.opt.skinUrl);
    }
    this.__setSkin = function( html ){
        this.body().html( html );
        this.onReady();
    }
}

$ZF.extends(ZSCMObj,ZStorage,$PK);
function ZStorage( $name, $opt )
{
    var $super = $ZF.super(this,[$name,$opt]);
    
    this.setData = function( data ){};
    this.getData = function(){return null};
    this.loadData = function( url ){
        this.debug('loadData',url);
        var loader = new ZURLLoader();
        loader.addEvent([ZEvent.COMPLETE,ZEvent.PROGRESS,ZEvent.OPEN],
                       _onLoaderEvent,this);
        loader.loadUrl(url);
    };
    this.onLoadComplete = function(loader){this.setData(loader.data);}
    var _onLoaderEvent = function(event){
        this.debug('onLoaderEvent: '+event.type);
        var loader = event.target;
        switch( event.type ){
            case ZEvent.COMPLETE:
                this.onLoadComplete( loader );break;
        }
    };
}

$ZF.extends(ZSCMObj,ZMacro,$PK);
function ZMacro( $name, $opt, $observerName )
{
    if(!$name)$name='ZMacro';
    var $super = $ZF.super(this,[$name,$opt]);
    var _stack=[],_wait=[]
    ,_current=0,_rule=null,_autoKill=true;
    this.observerName = ($observerName)?$observerName:'';
    
    new ZDebug(this,$name);
    
    $super.override('dispose',function(){
        $super.dispose();$super=null;
    });
    
    this.action = function($name, $data, $to, $from, $target){
        _stack.push({
            type:'action',n:$name,d:$data,
            t:$to,f:$from,tg:$target});
        return this;
    }
    this.onAction = function($action){
        console.log('####',_wait);
        if($action.to==this.name){
            switch($action.name){
                case'start':this.start();break;
            }
        }
        if(_wait&&_wait.length){
            var name = $action.name;
            var n = _wait.length;
            while( n-- ){
                if(_wait[n].n==name){
                    if(_wait[n].t==''||_wait[n].t==$action.from){
                        _wait.splice(n,1);
                    }
                }
            }
            if(_wait.length==0) this.__next();
        }
    }
    this.wait = function($actions){
        var data, act, arr = [];
        for( var n = 0; n < arguments.length; n++ ){
            act = arguments[n];
            if(!Array.isArray(act))act=[act];
            if(typeof act[0]!='string')continue;
            data = {n:act[0]};
            data['t']=(act[1])?act[1]:'';
            arr.push(data);
        }
        _stack.push({type:'wait',wait:arr});
        return this;
    }
    this.func = function($func,$props,$target){
        if(!Array.isArray($props))$props=[$props];
        _stack.push({type:'func',func:$func,props:$props,tg:$target});
        return this;
    }
    this.delay = function( $msecond ){
        if(!$msecond||$msecond<1)$msecond=1;
        _stack.push({type:'delay',delay:$msecond});
        return this;
    }
    this.start = function( autoKill ){
        this.register(this.observerName);
        console.log(99,this.observer.name);
        this.debug('start');
        _autoKill = autoKill;
        _current = -1;
        this.__next();
    }
    this.finish = function(){
        this.debug('finish');
        if(_autoKill) this.dispose();
    }
    this.__next = function(){
        _current++;
        if( _current >= _stack.length ) return this.finish();
        _rule = _stack[_current];
        _wait = [];
        switch(_rule.type){
            case 'action':
                this.observer.sendAction(new ZAction(
                    _rule.n,_rule.d,_rule.t,_rule.f,_rule.tg));
                this.__next();
                break;
            case 'func':
                _rule.func.apply(_rule.target,_rule.props);
                this.__next();
                break;
            case 'wait':
                _wait = _rule.wait.concat();
                break;
            case 'delay':
                setTimeout(this.__next.bind(this),_rule.delay);
                break;
        }
    }
}

ZComponentSkin.NAME = 'ZComponentSkin';
$ZF.extends(ZStorage,ZComponentSkin,$PK);
function ZComponentSkin()
{
    const EMPTY = 0, LOADING = 1, LOADED = 2, ERROR = -1;
    var $super = $ZF.super(this,[ZComponentSkin.NAME]);
    var _hash = {'test':1};
    var _awaiter = {};
    this.onAction = function(action){
        if(action.name=='loadSkin'&&action.to==ZComponentSkin.NAME){
            this.loadSkin(action.data,action.from);
        }
    }
    this.loadSkin = function( url, awaiter ){
        this.debug('loadSkin',url);
        
        if( _hash.hasOwnProperty(url) ){
            var data = _hash[url];
            if( data.state < LOADED ){
                data.awaiter.push( awaiter );}
            else if( data.state == LOADED ){
                var comp = this.observer.getComponent(awaiter);
                if(comp) comp.__setSkin( data.html );}
            return;}
        var data = {url:url,state:0,awaiter:[],html:''};
        data.awaiter.push( awaiter );
        _hash[url] = data;
        this.loadData( url );
    }
    this.onLoadComplete = function( loader ){
        this.debug('onLoadComplete');
        var data = _hash[loader.url];
        data.html = loader.data;
        data.state = LOADED;
        console.log( _hash );
        var comp;
        for( var n = 0; n < data.awaiter.length; n++ ){
            comp = this.observer.getComponent( data.awaiter[n] );
            if(comp) comp.__setSkin( data.html );
        }
    }
}
*/



//$ZF.addModule( new ZSCM(), 'SCM' );






/*
$Z.registerModule( new ZSCM(), 'SCM' );
$Z.scm = {
    componentSkin:new ZComponentSkin().register()
};

$(document).ready(function(e) {
    $Z.SCM.startup();
});
*/









