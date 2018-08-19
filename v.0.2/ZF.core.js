/*
 * ZFramework v2.0.0 (http://zfjs.mrzero.kr)
 * Copyright 2016-2018 mrZero.kr
 * Licensed under the MIT license
 */


/* - - - - - - - - - -
ZF.core
*/
if(!ZF) var ZF = function(v){
    return ZF.prototype.wrap(v);
};
if(!Z) var Z = ZF;


(function(){
    var VERSION = '2.0.0';
    if( ZF.hasOwnProperty('VERSION') ){
        throw new Error('ZF('+ZF.VERSION+') is Created. this('+VERSION+')');
        return;
    }
    ZF.VERSION = VERSION;
    ZF.define = Object.defineProperty;
    ZF.defines = Object.defineProperties;
    ZF.typeCheck = function(V,T,E){
        if(!Array.isArray(T))T=[T];
        for(var s='',n=0;n<T.length;n++){
            if((V instanceof T[n])||
               (T[n]==String&&typeof(V)=='string')||
               (T[n]==Number&&typeof(V)=='number')
              ) return true;
            T[n]=T[n].name;}
        if(E) throw TypeError(E+" is must be a '"+T.join("','")+"'");
        return false;
    }
    ZF.isArr = Array.isArray;
    ZF.isObj = function(T,pure){
        if(!pure) return typeof(T)=='object';
        else return T.constructor.name=='Object';
    }
    ZF.paramArray = function(A){
        if(!A)A=arguments.callee.caller.arguments;
        return (A.length==1)?[A[0]]:Array.apply(null,A);
    }
    ZF.paramCheck = function(V,T,E){
        var n,v;
        if(!ZF.isArr(V))V=[V];
        if(!ZF.isArr(T))T=[T];
        for(n=T.length,v=T[n-1];n<V.length;n++) T.push(v);
        for(n=0;n<V.length;n++)
            ZF.typeCheck(V[n],T[n],E+' params['+n+']');
        return true;
    }
    if(!(function f(){}).name){
        ZF.define(Function.prototype,'name',{
            get:function(){
                var s=(this.toString().match(/^function\s*([^\s(]+)/)||[])[1];
                ZF.define(this,'name',{value:s});
                return s;}});}
    var _times = [Date.now()];
    ZF.time = function(k){
        if(!k)k = 0;
        else if(k==-1)k = _times.length-1;
        var n = Date.now();
        return n-_times[k];
    }
    ZF.timePoint = function(){
        return _times.push(Date.now())-1;
    }
    ZF.timeCheck = function(m,k){
        if(isNaN(k)||k<0)k = _times.length-1;
        if(!m)m = 'TimeCheck';
        var n = Date.now();
        console.log('\t| '+m,(n-_times[k])/1000,'sec');
        return _times.push(n)-1;
    }
    
    ZF.define(ZF,'CONST',{value:{}});
    ZF.define(ZF,'STATIC',{value:{}});
    ZF.define(ZF,'PUBLIC',{value:{}});
    ZF.define(ZF,'PRIVATE',{value:{}});
    ZF.define(window,'CONST',{value:ZF.CONST});
    
    var Z=ZF,
        _GB = false,
        _CD = [],
        _CP = '',
        // Get Class Data
        _GC = function(C){
            var n = _CD.length;
            if(typeof(C)=='string'){
                while(n--){
                    if(_CD[n].CS==C)
                        return _CD[n];}
                n = _CD.length;
                while(n--){
                    if(_CD[n].CN==C)
                        return _CD[n];}}
            else{
                while(n--){
                    if(_CD[n].C==C)
                        return _CD[n];}}
            return null;
        },
        // toString
        toStr = function(n){return function(){return '[ZF '+n+']'}},
        // Register Class
        _RC = function(D){
            var s,n,d,len,
            proto=D.C.prototype=Object.create(D.E.prototype);
            if(D.C.name){
                D.CN=D.C.name;
                s = D.CP+'.'+D.CN;
                ZF.define(proto,'$classes',{value:s});
                ZF.define(proto,'$class',{value:D.CN});
                if(D.P!=''){
                    var n,o=ZF,a=D.CP.split('.');
                    for(n=0;n<a.length;n++){
                        if(!o[a[n]])o[a[n]]={};
                        o=o[a[n]];}
                    o[D.C.name]=D.C;}
                ZF[D.C.name]=D.C;}
            if(D.GB) window[D.C.name]=D.C;
            if(D.PT) _RPT( D.C, D.PT );
            if(len=D.ST.length){
                for(n=0;n<len;n++){
                    _RST(D.C,D.ST[n]); } }
            if(len=D.PB.length){
                for(n=0;n<len;n++){
                    _RPB(D.C,D.PB[n]); } }
            if(len=D.OV.length){
                for(n=0;n<len;n++){
                    _ROV(D.C,D.OV[n]); } }
            D.CS = D.CP+'.'+D.CN;
            D.CC = _GC(D.E).CC.concat();
            D.CC.push( D.C );
            _CD.push(D);
        },
        // register prototype
        _RPT = function(C,O){
            var p = C.prototype;
            for( var s in O )
                p[s] = O[s];
        },
        // Props Get/Set Function
        _FPG = function(p){return function(){return this.getProp(p);}},
        _FPS = function(p,v){return function(v){this.setProp(p,v);}},
        // register public
        _RPB = function(C,A){
            var f,n,
                t1 = (typeof A[0]).charAt(0),
                t2 = (typeof A[1]).charAt(0),
                t3 = (typeof A[2]).charAt(0);
            if(t1 == 's'){
                C.prototype[A[0]] = A[1]; }
            if(t1=='f'||t2=='f'){
                f = (t1=='f')?A[0]:A[1];
                n = f.name||A[0];
                C.prototype[n] = f;
            }
        },
        // register static
        _RST = function(C,A){
            var f,n,s,v={},
                t1 = (typeof A[0]).charAt(0),
                t2 = (typeof A[1]).charAt(0),
                t3 = (typeof A[2]).charAt(0);
            if(A[0]===ZF.CONST){
                if(typeof(A[1])=='string') v[A[1]] = A[2];
                else v = A[1];
                for( s in v )
                    ZF.define(C,s,{value:v[s]});}
            else if(t1=='o'){
                //TODO: Object
                for(s in A[0]){
                    v = A[0][s];
                    t2 = (typeof v).charAt(0);
                    if(t2=='f') ZF.define(C,s,{value:v});}}
            else if(t1=='f'){
                f = (t1=='f')?A[0]:A[1];
                n = f.name||A[0];
                ZF.define(C,n,{value:f});
            }
            //TODO: static property
        },
        // register override
        _ROV = function(C,V){
            C.prototype[V[0]] = V[1];
        },
        // ZF Wrap Function
        _WR = function(v){
            if( v && v.class ){
                var cc = Z.package( v.package ? v.package:_CP );
                if(v.dynamic)   cc.dynamic();
                if(v.global)    cc.global(v.global);
                if(v.extends)   cc.extends( v.extends );
                if(v.proto)     cc.proto( v.proto );
                if(v.public)    cc.public( v.public );
                if(v.override)  cc.override(v.override);
                if(v.reads)     cc.reads(v.reads);
                if(v.props)     cc.props(v.props);
                if(v.prop)      cc.prop(v.prop);
                return cc.class( v.class );
            }
        },
        _getSuper = function(O,A){
            if(!A) return null;
            var n, m, p, k = A.name;
            var D = _GC(O.__proto__.$classes);
            function find(proto){
                var ss = O.$$._vals().__ss__, n = ss.length;
                while(n--){
                    if( ss[n]._proto == proto ) return ss[n];}}
            for( n = 0; n < D.CC.length; n++ ){
                p = D.CC[n].prototype;
                if( p.hasOwnProperty(k) && p[k] == A ){
                    return find(p);}}
            return find(O.__proto__);
        },
        _destroy = function(T){
//            console.log('** ZF.Object.DESTROY **');
            var n,s, obj = T.$$._vals();
            for(s in T){
                T[s] = null;
                delete T[s];}
            n = obj.__ss__.length;
            while(n--){
                obj.__ss__[n]._dispose();
                obj.__ss__.splice(n,1);}
            for(s in obj){
                obj[s] = null;
                delete obj[s];}
            obj = T.$$;
            for(s in obj){
                obj[s] = null;
                delete obj[s];}
            T.$$ = null;
            delete T.$$;
//            console.log( 'this', T );
        }
    ;
    
    
    ZF.prototype.wrap = _WR;
    
    // Class Creator
    /*
    C: Class
    CC: class chain
    CN: class name
    CS: classes
    OV: function override
    PR: property
    PG: property getter
    PS: property setter
    GB: Global
    */
    function _CC(){
        this.D = {E:Z.ZObject,GB:_GB,CP:_CP,PR:{},PB:[],PG:[],PS:[],OV:[],CC:[],ST:[]};
    }
    _CC.prototype = {
        package:function(v){if(v)this.D.CP=v;return this;},
        extends:function(v){if(v)this.D.E=v;return this;},
        dynamic:function(){this.D.DN=true;return this;},
        global:function(v){this.D.GB=(v!=false)?true:false;return this;},
        class:function(C){
            if(typeof C=='string')
                C=eval('(function '+C+'(){ZF.init(this);})');
            this.D.C = C; _RC(this.D);
            return this;},
        reads:function(V){
            var a = (Array.isArray(V))?V:V.split(',');
            this.D.PG = this.D.PG.concat(a);
            return this;},
        props:function(V){
            var a = (Array.isArray(V))?V:V.split(',');
            this.D.PG = this.D.PG.concat(a);
            this.D.PS = this.D.PS.concat(a);
            return this;},
        prop:function(P,V){
            if(typeof P == 'object' ){
                for(var s in P)
                    this.D.PR[s]=P[s];
                return this;}
            this.D.PR[P]=V;
            return this;},
        proto:function(O){
            if(this.D.C)_RPT(this.D.C,O);
            else this.D.PT=O;
            return this;},
        public:function(a,b,c){
            if(typeof a == 'object' ){
                for( var s in a )
                    this.public(s,a[s]);
                return this;}
            if(this.D.C)_RPB(this.D.C,[a,b,c]);
            else this.D.PB.push([a,b,c]);
            return this;},
        override:function(P,F){
            if(typeof P == 'object' ){
                for( var s in P )
                    this.override(s,P[s]);
                return this;}
            if(typeof(P)=='function'){
                F = P; P = F.name;}
            this.D.OV.push([P,F])
            if(this.D.C)_ROV(this.D.C,[P,F]);
            return this;},
        static:function(a,b,c){
            this.D.ST.push([a,b,c]);
            if(this.D.C)_RST(this.D.C,[a,b,c]);
            return this;
        }
    };
    
    
    
    Z.packages = function(p){_CP=p;Z[p]={}}
    Z.global = function(v){return new _CC().global(v)}
    Z.extends = function(v){return new _CC().extends(v)}
    Z.package = function(v){return new _CC().package(v)}
    Z.class = function(v){return new _CC().class(v)}
    Z.dynamic = function(){return new _CC().dynamic()}
    Z.init = function(o,p,v,f){
        var s,val,sp,D = _GC( arguments.callee.caller );
        if(!o.$)    o.$ = {c:1,g:[],s:[]};
        else        o.$.c++;
        D.E.apply(o,(Array.isArray(p))?p:[p]);
        
        if(D.DN) o.$.D = true;
        if(D.PG) o.$.g = o.$.g.concat(D.PG);
        if(D.PS) o.$.s = o.$.s.concat(D.PS);
        for(s in D.PR){
            val = D.PR[s];
            if(typeof(val)=='object'){
                ZF.define(o,s,val);
            }else{
                ZF.define(o,s,{value:val,writable:true,enumerable:true});
            }
        }
        
        if( typeof(v) == 'object' ){
            for(s in v) o.$$._val(s,v[s]);}
        sp = new ZSelf(o,D);
        o.$$._vals().__ss__.push(sp);
        if(--o.$.c>0)return sp;
        
        var opt={C:D.C}, arr=o.$.g, n=arr.length;
        while( n-- ){
            s = arr[n];
            if(arr.indexOf(s)!=n)arr.splice(n,1);}
        for(n=0;n<arr.length;n++){
            s = arr[n];
            if(o.$.s.indexOf(s)==-1) ZF.define(o,s,{get:_FPG(s),enumerable:true,configurable:true});
            else ZF.define(o,s,{get:_FPG(s),set:_FPS(s),enumerable:true,configurable:true});}
        opt.PS = o.$.s;
        if(o.$.D) opt.DN = true;
        o.setInstance(opt);
        o.setInstance = null;
        delete o.$; delete o.setInstance;
//        if(!opt.DN) Object.preventExtensions(o);
        return sp;
    }
    
    
    function ZSelf(T,D){
        this._instance = T;
        this._classes = D.CS;
        this._proto = D.C.prototype;
        this._super = (D.E)?D.E.prototype:null;
        if( D.OV && D.OV.length ){
            var n,p,f,d,t1,t2;
            for(n=0;n<D.OV.length;n++){
                d = D.OV[n]; p = d[0]; f = d[1];
                this[p] = this._super[p].bind(T);}}
        this._dispose = function(){
            for(var s in this){
                this[s] = null;
                delete this[s];}
        }
    }
    ZF.defines(ZSelf.prototype,{
        override:{value:function(P,F){
            if(typeof(P)=='function'){
                F = P; P = F.name;}
            this[P] = this._instance[P];
            this._instance[P] = F;
        }}
    });
    
    
    
    Z.ZObject = function ZObject(){
        var _v = {__ss__:[]};
        this.setInstance = function(O){
            if(O.PS) _v._sets = O.PS;
            if(O.DN) _v.isDynamicClass = true;
        }
        ZF.define(this,'$$',{configurable:true,value:{
            _get:function(p){return _v[p]},
            _set:function(p,v){if(_v._sets.indexOf(p)!=-1)_v[p]=v;},
            _vals:function(){return _v},
            _val:function(p,v){
                if(arguments.length==2) _v[p]=v;
                else return _v[p];
            }}});
        Object.freeze(this.$$);
    };
    Z.ZObject.prototype = {
        getProp:function(p){return this.$$._get(p)},
        setProp:function(p,v){this.$$._set(p,v)},
        toString:function(){return '[ZF '+this.$class+']'},
        dispose:function(){_destroy(this)}
    };
    ZF.defines(Z.ZObject.prototype,{
        $class:{value:'ZObject'},
        $classes:{value:'.ZObject'},
        super:{get:function(){
                return _getSuper(this,arguments.callee.caller);}}
    });
    
    _CD.push({E:null,P:'',C:Z.ZObject,CC:[Z.ZObject],CN:'ZObject',CS:'.ZObject'})
})();










