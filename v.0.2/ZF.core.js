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
    var VERSION = '0.2.0';
    if( ZF.hasOwnProperty('VERSION') ){
        throw new Error('ZF('+ZF.VERSION+') is Created. this('+VERSION+')');
        return;
    }
    if(!(function f(){}).name){
        ZF.define(Function.prototype,'name',{
            get:function(){
                var s=(this.toString().match(/^function\s*([^\s(]+)/)||[])[1];
                ZF.define(this,'name',{value:s});
                return s;}});}
    
    ZF.VERSION = VERSION;
    ZF.useParamCheck = true;
    ZF.define = Object.defineProperty;
    ZF.defines = Object.defineProperties;
    ZF.isArr = Array.isArray;
    ZF.isObj = function(T,pure){
        if(!pure) return typeof(T)=='object';
        else return T.constructor.name=='Object';
    }
    ZF.isExtend = function(I,T){
        if(typeof(I)=='function')I=I.prototype; 
        if(I instanceof T)return true;
        return ZF.isInterface(I,T);
    }
    ZF.isInterface = function(I,T){
        if(!(I instanceof Z.ZObject))return false;
        return (!I.$$||I.$$._get('__ic__').indexOf(T)==-1)?false:true;
    }
    ZF.valueOf = function(T){
        var a = [];
        for(var s in T)
            a.push(s+': '+T[s]);
        return '{'+a.join(', ')+'}';
    }
    ZF.typeCheck = function(V,T,E){
        if(!Array.isArray(T))T=[T];
        for(var s='',n=0;n<T.length;n++){
            if((V instanceof T[n])||
               (T[n]==String&&typeof(V)=='string')||
               (T[n]==Number&&typeof(V)=='number')||
               (T[n]==Boolean&&typeof(V)=='boolean')
              ) return true;
            T[n]=T[n].name;}
        if(E) throw TypeError(E+" is must be a '"+T.join("','")+"'");
        return false;
    }
    ZF.paramArray = function(A){
        if(!A)A=arguments.callee.caller.arguments;
        return (A.length==1)?[A[0]]:Array.apply(null,A);
    }
    ZF.paramError = function(T,M,P,N){
        if(!ZF.useParamCheck)return false;
        var n,v;
        if(N==undefined) N = ' at '+arguments.callee.caller.name+'()';
        if(!P){
            P = arguments.callee.caller.arguments
            P = (P.length==1)?[P[0]]:Array.apply(null,P);}
        if(!Array.isArray(P))P=[P];
        if(!Array.isArray(T))T=[T];
        if(!isNaN(M)&&P.length<M){
            return [Error,'Incorrect number of arguments. Expercted '+M+'.'+N];
        }
        for(n=T.length,v=T[n-1];n<P.length;n++)T.push(v);
        for(n=0;n<P.length;n++){
            if(!ZF.typeCheck(P[n],T[n])){
                v = (T[n].prototype.$classes)?T[n].prototype.$classes:T[n].name;
                return [TypeError,"params["+n+"] is must be a '"+v+"'"+N];}}
        return false;
    }
    ZF.paramCheck = function(T,M,P,N){
        if(!ZF.useParamCheck)return false;
        if(!P){
            P = arguments.callee.caller.arguments
            P = (P.length==1)?[P[0]]:Array.apply(null,P);}
        var R = ZF.paramError(T,M,P,'');
        if(R){
            if(N instanceof ZObject)
                N = arguments.callee.caller.name+'()::'+N.$classes;
            if(!N) N = arguments.callee.caller.name+'()';
            throw new R[0](R[1]+' at '+N);
        }
    }
    ZF.paramOpt = function(P,M,T){
        console.log('## paramOpt');
        P = P.split(',');
        console.log( P );
        var n,opt = {};
        
        for( n = 0; n < P.length; n++ ){
            
        }
    }
    var _getExtendChain = function(P){
        var n=100,a=[],R=P;
//        console.log('_getExtendChain',P);
        while(n--&&R){
            a.unshift(R);
            R=R.$class.extends;
        }
        return a;
    },
    _getClassOfPackage = function(P){
        var n,a=[];
        for(n=0;n<_CD.length;n++){
            if(_CD[n].CP==P) a.push(_CD[n].C);
        }
        return a;
    }
    ;
    ZF.accessModifier = function(C,P){
        var A = C.$class.AM[P];
        if(!A)return true;
        var s,n=3,O,
            F=arguments.callee.caller,
            CC=_getExtendChain(C);
        while(n--){
            if(!F.caller) n=0;
            else F = F.caller;}
        // Find the owner of the property
        for( n = 0; n < CC.length; n++ ){
            if(CC[n].$class.PS.indexOf(P)>-1){
                O=CC[n];break;}}
        if(A===ZF.PRIVATE){
            for( s in O ){
                if( O[s] === F ) return true;}
            A = O.$class.name+'.'+P+' is Private property.';}
        else if(A===ZF.PROTECTED){
            for( s in C ){
                console.log('-',s);
                if( C[s] === F ) return true;}
            A = C.$class.name+'.'+P+' is Protected property.';}
        else if(A===ZF.INTERNAL){
            CC = _getClassOfPackage(C.$class.package);
            s = F.name;
            for(n=0;n<CC.length;n++){
                O = CC[n].prototype;
                if( O[s] && O[s] === F )return true;
                if(O.$class.AF[s]&&O.$class.AF[s]===F)return true;
            }
            A = C.$class.name+'.'+P+' is Internal property.';}
        throw new Error(A);
        return false;
    }
    
    
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
    ZF.define(ZF,'PROTECTED',{value:{}});
    ZF.define(ZF,'INTERNAL',{value:{}});
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
            n = _CD.length;
            while(n--){
                if(_CD[n].I==C)
                    return _CD[n];}
            return null;
        },
        // toString
        toStr = function(n){return function(){return '[ZF '+n+']'}},
        // Register Interface
        _RI = function(D){
            delete D.CC;
            delete D.OV;
            delete D.PB;
            delete D.PG;
            delete D.PP;
            delete D.PS;
            delete D.ST;
            if( D.I.name.charAt(0)!='I' ){
                throw new SyntaxError('['+D.I.name+'] The interface name must start with an uppercase I');
            }
            var name = D.I.name;
            if(D.CP!=''){
                var n,o=ZF,a=D.CP.split('.');
                for(n=0;n<a.length;n++){
                    if(!o[a[n]])o[a[n]]={};
                    o=o[a[n]];}
                o[name]=D.I;}
            ZF[name]=D.I;
            if(D.GB) window[name]=D.I;
            _CD.push(D);
        },
        // Register Class
        _RC = function(D){
            var n,s,len,name,C,P,ED=_GC(D.E),
            proto=D.C.prototype=Object.create(D.E.prototype);
            name=D.CN=D.C.name;
            D.CS = D.CP+'.'+name;
            ZF.define(proto,'$classes',{value:D.CS});
            ZF.define(proto,'$class',{value:{
                name:name,package:D.CP,extends:D.E.prototype,
                AF:{},  //Access Modifier Function
                AM:{},  //Access Modifier
                DT:{},  //Data Type
                PS:[]   //Prop Setter
            }});
            if(D.CP!=''){
                var n,o=ZF,a=D.CP.split('.');
                for(n=0;n<a.length;n++){
                    if(!o[a[n]])o[a[n]]={};
                    o=o[a[n]];}
                o[name]=D.C;}
            ZF[name]=D.C;
            if(D.GB) window[name]=D.C;
            if(D.PR) _RPR( D.C, D.PR );
            
            C = proto.$class;
            P = D.E.prototype.$class;
            for(s in P.DT) C.DT[s] = P.DT[s];
            for(s in P.PS) C.PS[s] = P.PS[s];
            for(s in P.AM) C.AM[s] = P.AM[s];
            for(s in D.DT) C.DT[s] = D.DT[s];
            for(s in D.PS) C.PS[s] = D.PS[s];
            for(s in D.AM) C.AM[s] = D.AM[s];
            
            if(len=D.ST.length){
                for(n=0;n<len;n++){
                    _RST(D.C,D.ST[n]);}}
            if(len=D.PB.length){
                for(n=0;n<len;n++){
                    _RPB(D.C,D.PB[n]);}}
            if(len=D.OV.length){
                for(n=0;n<len;n++){
                    _ROV(D.C,D.OV[n]);}}
            D.CC = ED.CC.concat();
            D.CC.push( D.C );
            _CD.push(D);
        },
        // register prototype
        _RPR = function(C,O){
            var p = C.prototype;
            for( var s in O )
                p[s] = O[s];
        },
        // Props Get/Set Function
        _FPG = function(p){return function(){return this.getProp(p)}},
        _FPS = function(p,v){return function(v){this.setProp(p,v)}},
        // register public
        _RPB = function(C,A){
            var f,n,
                t1 = (typeof A[0]).charAt(0),
                t2 = (typeof A[1]).charAt(0),
                t3 = (typeof A[2]).charAt(0);
//            if(t1 == 's'){
//                C.prototype[A[0]] = A[1]; }
//            if(t1=='f'||t2=='f'){
//                f = (t1=='f')?A[0]:A[1];
//                n = f.name||A[0];
//                C.prototype[n] = f;
//            }
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
                var ss = O.$$._vals().__SS__, n = ss.length;
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
            n = obj.__SS__.length;
            while(n--){
                obj.__SS__[n]._dispose();
                obj.__SS__.splice(n,1);}
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
    CP: class package
    CS: classes
    DT: data type
    OV: function override
    PP: property
    PG: property getter
    PS: property setter
    GB: Global
    ST: Static
    FN: Interface func
    PB: public
    PT: protected
    PV: private
    IN: internal
    AM: access modifier
    */
    function _CC(){
        this.D = {E:Z.ZObject,GB:_GB,CP:_CP,PP:{},PB:[],PG:[],PS:[],OV:[],CC:[],ST:[],FN:[],DT:{},ID:{},AM:{}};
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
        setID:function(p,v){
            this.D.ID[p]=v;
        },
        setDT:function(p,v){
            if(!this.D.C) this.D.DT[p]=v;
            else this.D.C.prototype.$class.DT[p]=v;
        },
        setAM:function(p,v){
            if(!this.D.C) this.D.AM[p]=v;
            else this.D.C.prototype.$class.AM[p]=v;
        },
        
        reads:function(V){
            var a = (Array.isArray(V))?V:V.split(',');
            this.D.PG = this.D.PG.concat(a);
            return this;},
        props:function(V){
            var a = (Array.isArray(V))?V:V.split(',');
            this.D.PG = this.D.PG.concat(a);
            this.D.PS = this.D.PS.concat(a);
            if(this.D.C){
                var C = this.D.C.prototype.$class;
                C.PS.push.apply(C.PS,a);}
            return this;},
        prop:function(P,V){
            if(typeof P == 'object' ){
                for(var s in P)
                    this.D.PP[s]=P[s];
                return this;}
            this.D.PP[P]=V;
            return this;},
        proto:function(O){
            if(this.D.C)_RPR(this.D.C,O);
            else this.D.PR=O;
            return this;},
        private:function(a,b,c){
            var t1=(typeof a)[0];
            if(t1=='f'){
                b=a;a=b.name;c=Function;t1='s';
                if(this.D.C) this.D.C.$class.AF[a]=b;}
            var t2=(typeof b)[0],t3=(typeof c)[0];
            if(t1=='s'){
                if(t2!='e') this.setID(a,b);
                if(t3=='f') this.setDT(a,c);
                this.setAM(a,ZF.PRIVATE);
                this.props(a);
            }
            return this;
        },
        protected:function(a,b,c){
            var t1=(typeof a)[0];
            if(t1=='f'){
                b=a;a=b.name;c=Function;t1='s';
                if(this.D.C) this.D.C.$class.AF[a]=b;}
            var t2=(typeof b)[0],t3=(typeof c)[0];
            if(t1=='s'){
                if(t2!='e') this.setID(a,b);
                if(t3=='f') this.setDT(a,c);
                this.setAM(a,ZF.PROTECTED);
                this.props(a);
            }
            return this;
        },
        internal:function(a,b,c){
            var t1=(typeof a)[0];
            if(t1=='f'){
                b=a;a=b.name;c=Function;t1='s';
                if(this.D.C) this.D.C.prototype.$class.AF[a]=b;}
            var t2=(typeof b)[0],t3=(typeof c)[0];
            if(t1=='s'){
                if(t2!='e') this.setID(a,b);
                if(t3=='f') this.setDT(a,c);
                this.setAM(a,ZF.INTERNAL);
                this.props(a);
            }
            return this;
        },
        public:function(a,b,c){
            var t1=(typeof a)[0],t2=(typeof b)[0],t3=(typeof c)[0];
            if(t1=='s'){
                if(t2!='e') this.setID(a,b);
                if(t3=='f') this.setDT(a,c);
                this.props(a);}
            else if(t1=='f'){
                if(this.D.C) this.D.C.prototype[a.name] = a;
                else this.D.PB.push([a,b,c]);}
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
        },
        interface:function(C){
            if(typeof C=='string')
                C=eval('(function '+C+'(){ZF.init(this);})');
            this.D.I = C; _RI(this.D);
            return this;
        },
        implements:function(){
            var a = ZF.paramArray(arguments);
            this.D.IM = a;
            return this;
        },
        func:function(){
            var a = ZF.paramArray(arguments);
            if(!a||!a.length) return this;
            if(!this.D.FN)this.D.FN=[];
            this.D.FN.push.apply(this.D.FN,a);
            return this;
        }
    };
    
    
    
    Z.packages = function(p){_CP=p;}
    Z.global = function(v){return new _CC().global(v)}
    Z.interface = function(v){return new _CC().interface(v)}
    Z.implements = function(v){return new _CC().implements(v)}
    Z.extends = function(v){return new _CC().extends(v)}
    Z.package = function(v){return new _CC().package(v)}
    Z.class = function(v){return new _CC().class(v)}
    Z.interface = function(v){return new _CC().interface(v)}
    Z.dynamic = function(){return new _CC().dynamic()}
    Z.init = function(O,param,init){
        var s,m,v,vals,sp,E,D = _GC( arguments.callee.caller );
        if(!O.$)    O.$ = {c:1,g:[],s:[]};
        else        O.$.c++;
        D.E.apply(O,(Array.isArray(param))?param:[param]);
        vals = O.$$._vals();
        if(D.IM){
            s = D.IM.length;
            sp = vals.__ic__;
            while(s--){
                sp.push(D.IM[s]);
                E = _GC(D.IM[s]);
                if(E.FN){
                    m = E.FN.length;
                    while(m--){
                        v = E.FN[m];
                        if(!O[v]){
                            throw new Error("Class '"+D.CN+"' is must implement the '"+v+"' methods of the '"+E.I.name+"' interface.");}}}}}
        if(D.DN) O.$.D = true;
        if(D.PG) O.$.g = O.$.g.concat(D.PG);
        if(D.PS) O.$.s = O.$.s.concat(D.PS);
        for(s in D.PP){
            v = D.PP[s];
            if(typeof(v)=='object') ZF.define(O,s,v);
            else ZF.define(O,s,{value:v,writable:true,enumerable:true});
        }
        for(s in D.ID) vals[s] = D.ID[s];
        if(typeof(init)=='string')init=[init];
        if(!Array.isArray(init)&&typeof(init)=='object' ){
            for(s in init) vals[s] = init[s];
        }
        sp = new ZSelf(O,D);
        vals.__SS__.push(sp);
        
        // Aborting if the inheritance chain is initializing
        if(--O.$.c>0) return sp;
        // Instance setup and finishing
        var opt={C:D.C,P:D.C.prototype}, arr=O.$.g, n=arr.length;
        while( n-- ){
            s = arr[n];
            if(arr.indexOf(s)!=n) arr.splice(n,1);}
        for(n=0;n<arr.length;n++){
            s = arr[n];
            if(O.$.s.indexOf(s)==-1) ZF.define(O,s,{get:_FPG(s),enumerable:true,configurable:true});
            else ZF.define(O,s,{get:_FPG(s),set:_FPS(s),enumerable:true,configurable:true});}
        opt.PS = O.$.s;
        if(O.$.D) opt.DN = true;
        O.setInstance(opt);
        O.setInstance = null;
        delete O.$; delete O.setInstance;
        
        return sp;
    }
    Z.initProps = function(O,P){
        console.log('Z.initProps');
        if(typeof(P)=='string')P=P.split(',');
        console.log('>',P);
        var n,s,T,
            S = arguments.callee.caller.prototype,
            A = arguments.callee.caller.arguments,
            V = O.$$._vals(),
            D = V.__dt__;
        console.log( S,A,V,D);
        A = (A.length==1)?[A[0]]:Array.apply(null,A);
        n = A.length;
        while(n--){
            if(A[n]==undefined)A.splice(n,1);
            else break;
        }
        var len = Math.min(A.length,P.length);
        if( A[0]&&A[0].__proto__===O.__proto__ ){
            console.log('???');
            D = A[0].$$._vals();
            for( n = 0; n < P.length; n++ ){
                s = P[n];
                V[s] = D[s];
            }
            return;
        }
        for( n = 0; n < len; n++ ){
            s = P[n];
            console.log('-',s,A[n]);
            T = D[s];
            if(T&&!ZF.typeCheck(A[n],T)&&ZF.useParamCheck){
                T = (T.prototype.$classes)?T.prototype.$classes:T.name;
                s = s+" is must be a '"+T+"' at Constructor::"+O.__proto__.$classes;
                throw new Error(s); 
            }
            V[P[n]] = A[n];
        }
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
    
    
    
    window.ZObject = Z.ZObject = function ZObject(){
        var _v = {__SS__:[],__ic__:[]};
        this.setInstance = function(O){
            _v.__PT__ = O.P;
            if(O.DN) _v.isDynamicClass = true;}
        ZF.define(this,'$$',{configurable:true,value:{
            _get:function(p){
                ZF.accessModifier(_v.__PT__,p);
                return _v[p]},
            _set:function(p,v){
                var C = _v.proto.$class;
                if(C.PS.indexOf(p)==-1)return;
                ZF.accessModifier(_v.__PT__,p);
                if(v!=null&&C.DT[p])
                    ZF.typeCheck(v,C.DT[p],p+' property');
                _v[p]=v;},
            _val:function(p,v){
                if(arguments.length==2) _v[p]=v;
                else return _v[p];},
            _vals:function(){return _v}}});
        Object.freeze(this.$$);
    };
    ZF.defines(Z.ZObject.prototype,{
        $class:{value:{
            name:'ZObject',package:'zf',
            AM:{},DT:{},PS:[],IC:[]}},
        $classes:{value:'zf.ZObject'},
        getProp:{enumerable:false,writable:true,
                 value:function(p){return this.$$._get(p)}},
        setProp:{enumerable:false,writable:true,
                 value:function(p,v){this.$$._set(p,v)}},
        dispose:{enumerable:false,writable:true,
                 value:function(){_destroy(this)}},
        toString:{enumerable:false,writable:true,
                  value:function(){return '['+this.$class.name+':ZF]'}},
        super:{get:function(){
                return _getSuper(this,arguments.callee.caller);}}
    });
    _CD.push({E:null,CP:'zf',C:Z.ZObject,CC:[Z.ZObject],CN:'ZObject',CS:'zf.ZObject'});
    console.log( _CD );
})();









