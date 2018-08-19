/*!
 * ZFramework v0.3.0 (http://zf.mrzero.kr)
 * Copyright 2016-2017 mrZero.kr
 * Licensed under the MIT license
 */
const $ZE = {
    'level':3,
    'XData':'Invalid data-type',
    'XFunc':'Invalid function',
    'XInterface':'Invalid interface',
};
$ZE['ZF'] ={
    '1001':$ZE.XFunc+' name',
    '1002':'@O is disabled function.'
};
const $ZF = new ZFCore();


function ZFCore(){
    if(window&&window.$ZF){throw new Error('ZFCore is Created');return;}
    window.$ZF=this; if(!window.$Z)window.$Z={};
    /*
    ZF-CORE
    */
    const VERSION = '0.2.0';
    this.f=function(){};
    var $classStack=[],$classHash={},$packHash={}
    ,$beginTime=new Date().getTime();
    console.log(['ZFCore',VERSION]);
    // 클래스상속등록
    // extends( extend:*,class:* [,package:*,getter:*,setter:*]):void
    this.E = this.extends = function( E, C, P, G, S ){
        var id,pd = _classData(E);
        if(!pd){
            $ZF.throw('Invalid Extends Class',0,'ZFCore.extends');
            return;}
        else if(pd.hasOwnProperty('final')){
            $ZF.throw(pd.name+' is Final Class',0,'ZFCore.extends');
            return;}
        C.prototype = Object.create(pd.ref.prototype);
        var cd = _classRegister(C,P,G,S);
        cd.ext = pd;
    };
    this.I = this.interface = function( T, L ){
        var D,C = arguments.callee.caller;
        if(!$ZF.classOf(C,ZInterface)){
            $ZF.throw('Invalid interface class',0,C.name);return};
        if(D=_classData(ZInterface)){
//            d.ref.apply(T);
        }
        L = $ZF.array(L);
        for(var n=0;n<L.length;n++){
            if(typeof(L[n])=='string')
                T[L[n]] = $ZF.f;}
    };
    // 인스턴스생성시 부모클래스 초기화
    // super( instance:ZObject [,params:Array,interfaces:Array] ):void
    this.S = this.self = function( T, P, I, C ){
        var D = _classData(arguments.callee.caller);
        var $s = this.super(T,P,I,D);
        if(T.hasOwnProperty(D.name)){
            T[D.name].apply(T,arguments.callee.caller.arguments);
            delete T[D.name];
        }
        return $s.getSelf();
    }
    this.super = function( T, P, I, D ){
        var arr=[],data=(D)?D:_classData(arguments.callee.caller);
        if(!data){
            $ZF.throw('Invalid Class Data',0,arguments.callee.caller.name+'.super');
            return}
        else if(data.hasOwnProperty('once')&&data.cnt!=0){
            $ZF.throw(data.name+' is Once Class',0,data.name+'.super');
            return}
        else if(data.hasOwnProperty('limit')&&data.cnt>=data.limit){
            $ZF.throw(data.name+' is Limit Class',0,data.name+'.super');
            return}
        // 대상 클래스의 상속체인이 없을경우 ZObject 치환 
        if(!data.ext) data.ext = _classData('ZObject');
        if(!Array.isArray(P)) P = [P];
        if(data.hasOwnProperty('interface'))I=data.interface;
        // 인터페이스처리
        if(I){
            var IC = _interfaceKeyChain(data.ext);
            I = $ZF.array(I);
            for(var n=0;n<I.length;n++){
                if(d=_classData(I[n])){
                    if(IC.indexOf(d.key)==-1){
                        d.ref.apply(T);
                        arr.push(d.key);}}
                else $ZF.error('Invalid interface class',0,'ZF.super');}}
        // 인스턴스 상속처리
        data.ext.ref.apply( T, P );
        data.cnt++;
        var sp = new ZSuper( T, data.key, arr );
        //setTimeout(function(){delete T.supers},1);
        return sp;
    };
    var _interfaceKeyChain = function( D ){
        var n,m,d,a,c=(D.ext)?_interfaceKeyChain(D.ext):[];
        if(m=D.interface){
            if(!Array.isArray(m))m=[m];
            for(a=[],n=0;n<m.length;n++){
                if(d=_classData(m[n]))a.push(d.key);}
            c=c.concat(a);}
        return c;
    };
    // 클래스 데이터 가져오기
    var _classData = function( C, P ){
        if(typeof(C)=='number'){
            return $classStack[C];}
        else if(typeof(C)=='string'){
            if(!P)P='_';
            if($classHash.hasOwnProperty(C))
                return $classHash[C];
            else if($packHash.hasOwnProperty(C))
                return $packHash[C];
            else if($packHash.hasOwnProperty(P+'.'+C))
                return $packHash[P+'.'+C];}
        else{
            var a=$classStack,n=a.length;
            while(n--){if(a[n].ref==C)return a[n];}}
        return null;
    };
    // 클래스 설정 초기화
    // _regiClass(classRef:Class,property:*,getter:*,setter:*):
    var _classRegister = function( C, P, G, S ){
        var data,name=C.name;
        if(typeof P=='string'){P={P:P}}
        else if(Array.isArray(P)){
            var a=P; P={};
            switch(a.length){
                case 3:P.F=a[2];
                case 2:P.I=a[1];
                case 1:P.P=a[0];}}
        else if(!P)P={};
        if(P.CLASS)P.C=P.CLASS;else if(!P.C)P.C=name;
        if(P.PACKAGE)P.P=P.PACKAGE;else if(!P.P)P.P='_';
        // 등록된 정보가있으면 반환하고 종료
        if(data=_classData(name,P.P)) return data;
        
        data = {ref:C,name:P.C,pk:P.P,ext:null,
                 cnt:0,key:$classStack.length};
        if(P.I||P.INTERFACE)data['interface']=P.I||P.INTERFACE;
        if(P.F||P.FINAL)data['final']=true;
        if(P.O||P.ONCE)data['once']=true;
        if(P.L||P.LIMIT)data['limit']=P.L||P.LIMIT;
        $classStack.push(data);
        $classHash[name]=data;
        $packHash[P.P+'.'+name]=data;
        
        // 클래스 Get/Set 함수설정
        var n,s,arr,obj,PT=C.prototype;
        for(s in P){PT[s]=P[s]};
        function GP(p){return function(){return (this.hasOwnProperty('getProp'))?this.getProp(p):null;}};
        function SP(p){return function(v){return this.setProp(p,v);}};
        if(Array.isArray(G)){
            arr=(Array.isArray(S))?S:[];
            for(n=0;n<G.length;n++){
                s=G[n]; obj={get:GP(s)};
                if(arr.indexOf(s)!=-1) obj['set']=SP(s);
                Object.defineProperty(PT,s,obj);}}
        else if(typeof(G)=='object'){
            for(s in G){
                type = typeof(G[s]);
                if(type=='object'){
                    Object.defineProperty(PT,s,G[s]);}
                else if(type=='function'){
                    if(!S||!S.hasOwnProperty(s)){obj = {get:G[s]}}
                    else{obj = {get:G[s],set:S[s]}}
                    Object.defineProperty(PT,s,obj)}}}
        else if(Array.isArray(S)){
            for(n=0;n<S.length;n++){
                Object.defineProperties(PT,S[n],{set:SP})}}
        else if(typeof(S)=='object'){
            for(s in S){
                type = typeof(S[s]);
                if(type=='function')
                    Object.defineProperties(PT,s,{set:S[s]});
                else if(type=='object')
                    Object.defineProperties(PT,s,S[s]);}}
        return data;
    };
    // error( message:String, code:String, option:Object, throw:Boolean ):void
    this.error = function( M, C, O, T ){
        var g,c,p,a,m;
        if(!C) C = '0';
        a = C.split('.');
        p = a[0]; c = a[1]; g = parseInt(a[2])||1;
        C = p+'.'+c;
        if(!M) M = $ZE[p][c];
        if(M.indexOf('@O')!=-1){
            M = M.replace('@O',O);
            O = false;
        }
        if(C!='0') M += ' ::'+C+'';
        m = '[ERROR] '+M;
        if(O) m += ' at '+O;
        console.log( m );
        if(g>=6||g>=$ZE.level||T) throw new Error(M);
    };
    this.throw = function( M, C, O ){
        this.error(M,C,O,true);
    };
    // dispose( instance:ZObject ):void
    this.dispose = function( T ){
        console.log(0,'ZF.dispose',T);
        function D(T){
            if(!T)return;
            if(T.super)T.super.__dispose();
            if(T.debugObj)T.debugObj.dispose();
            for(var s in T){
                T[s]=null;delete T[s];};
            D(T.__proto__);T.__proto__=null;};
        D(T);
    };
    
    /*
    ZF-UTILS
    */
    // 대상 클래스가 참조 클래스를 상속받았는지 여부를 반환
    // classOf( target:Class, classRef:Class ):Boolean
    this.classOf = function(T,R){
        var n=100,D=_classData(T),RD=_classData(R);
        if(!D||!RD)return false;
        while(n--){
            if(D.key==RD.key)return true;
            else if(!D.ext)return false;
            D = D.ext;}
        return false;
    };
    // 인스턴스가 대상 클래스를 상속 및 구현되었는지 여부를 반환
    // extendsOf( instance:ZObject, classRef:Class ):Boolean
    this.extendsOf = function(T,R){
        var D=_classData(R);
        if(typeof(T)!='object')return false;
        if(T instanceof R)return true;
        if(!(T instanceof ZObject)||!D)return false;
        var K=D.key,C,H
        if(!T.super){C=[0];H=[1];}
        else{C=T.super.chain;H=T.super.hasin.concat(1);}
        
        return (C.indexOf(K)==-1&&H.indexOf(K)==-1)?false:true;
    };
    // 인스턴스가 대상 인터페이스가 구현되었는지 여부를 반환 
    // interfaceOf( instance:ZObject, classRef:Class ):Boolean
    this.interfaceOf=function(T,R){
        var D=_classData(R);
//        if(T instanceof R)return true;
        if(!(T instanceof ZObject)||!D)return false;
        var a = T.super.hasin.concat(1);
        console.log(D.key, a);
        return (a.indexOf(D.key)==-1)?false:true;
    };
    // 클래스패키지 반환
    this.classPack = function( T ){
        var d = _classData(T);
        return (d)?d.pk:'';
    };
    // 클래스이름 반환
    this.className = function( T ){
        var d = _classData(T);
        return (d)?d.name:'';
    };
    this.classChain = function(T){
        var n,a=[],d = _classData(T);
        if(!d)return a;
        for(n=0;n<100;n++){
            a.push(d.key);
            if(!d.ext) return a;
            d = d.ext;
        }
        return a;
    }
    this.has = function( T, P ){
        if(!T) return false;
        else if(this.isArr(T))return (T.indexOf(P)==-1)?false:true;
        else return T.hasOwnProperty(P);
    };
    this.apply = function(T,N,P,D){
        if(T&&T.hasOwnProperty(N)&&typeof(T[N])=='function')
            return T[N].apply(T,P);
        else return D;
    };
    this.zobj = function(v){
        return (v instanceof ZObj)?v:new ZObj(v);};
    this.array = function(v){return (Array.isArray(v))?v:[v]};
    this.string = function(v){return String(v)};
    this.number = function(v){return parseFloat(v)};
    this.int = function(v){return parseInt(v)};
    this.flatArray = function(a){
        var f=function(x){
            for(var m,v,a=[],n=0;n<x.length;n++){
                v=x[n];
                if(!Array.isArray(v))a.push(v);
                else a=a.concat(f(v));}
            return a};
        if(!Array.isArray(arr))return [arr];
        else return f(arr);
    };
    this.clone = function( target ){
        if(target.hasOwnProperty('clone'))return target.clone();
        if(Array.isArray(target))return target.concat();
        var obj = {};
        for(var s in target){
            obj[s] = target[s];
        }
        return obj;
    }
    this.compare = function( A, B, C ){
        var n,m,at=typeof(A),bt=typeof(B),ct;
        if( A===B )return true;
        if( at!=bt )return false;
        if( at=='string' && bt=='string' && C ){
            if(typeof(C)=='number') return A.substr(0,C)==B.substr(0,C);
            else return A.toLowerCase()==B.toLowerCase();}
        if( Array.isArray(A) && Array.isArray(B) ){
            m=Math.max(A.length,B.length);
            if(C&&typeof(C)=='number')m=Math.min(m,C);
            for(n=0;n<m;n++){
                if(!this.compare(A[n],B[n]))return false;};
            return true;}
        else if( A.hasOwnProperty('compare') ){
            return A.compare(B);}
        else if( at == 'object' && bt == 'object'){
            if( A.__proto__ != A.__proto__ )return false;
            for(n in A){if(!this.compare(A[n],B[n]))return false}
            for(n in B){if(!this.compare(A[n],B[n]))return false}
            return true;}
        return false;
    };
    
    this.isArr = function( A ){
        return Array.isArray(A);
    };
    this.isFunc = function( F ){
        return (typeof(F)==='function')?true:false;
    };
    this.getTimer = function(b){
        var t=(new Date().getTime()-$beginTime)/1000;
        if(b)t=Math.floor((t-b)*1000)/1000;
        return t;
    };
    this.getClassesName = function(){
        var a=[],s=$classStack,n=s.length;
        while(n--)a.unshift(s[n].pk+'.'+s[n].name+'('+s[n].key+')');
        return a.sort();
    };
    
    /*
    ZF-MODULE
    */
    var $moduleStack=[];
    
    // addModule(module:ZSystemModule,identifier:String):void
    this.addModule = function( M, I ){
        if(!(M instanceof ZSystemModule)){
            $ZF.throw('Invalid Module');
            return;
        }
        if(I)$Z[I]=M;
        $moduleStack.push(M);
        console.log([M.getName(),M.getVersion()]);
    };
    // getModule(name:String):ZSystemModule
    this.getModule = function( N ){
        for(var s=$moduleStack,n=0;n<s.length;n++){
            if(s[n].getName()==N)return s[n];
        }
    };
    var _startup = function(){
        for(var n=0;n<$moduleStack.length;n++)
            $moduleStack[n].startup();
    };
    
    _classRegister(ZObject,'zf',['super','dataType']);
    _classRegister(ZInterface,'zf');
    
    if( window.hasOwnProperty('jQuery') ){
        $(document).ready(function(){
            _startup();
        });
    }
};












ZSuper.prototype={
    get key(){return this.getCK()},
    get chain(){return this.getCC()},
    get hasin(){return this.getHI()},
    get dataType(){return $ZF.className(this.getCK())}};
function ZSuper( T, K, I ){
    var _T=T,_K=K,_S=T.supers
    ,_P=(_S)?_S[0]:null
    ,_C=(_P)?_P.getCC().concat():[0]
    ,_I=(_P)?_P.getHI().concat(I):(I)?I:[];
    this.parent=_P;_C.unshift(K);_S.unshift(this);
    
    var _F;

    // override(name:String,[func:Function]):Self
    this.override=function( N, F ){
        if(typeof(N)=='function'){
            if(!N.name){
                $ZF.error('','ZF.1001.3');
                return this;}
            F=N;N=F.name;}
        var B=_T[N];
        if($ZF.isFunc(B))this[N]=B.bind(_T);
        if($ZF.isFunc(F))_T[N]=F.bind(_T);
        return this};
    // disable(name:String,[message:String]):Self
    this.disable=function( N, M ){
        if(!M)M='';
        _T[N]=function(){
            $ZF.error(M,'ZF.1002.3',_T.dataType+'.'+N);}
            .bind(_T);
        return this};
    this.getSelf=this.getSF=function(){
        if(!_F)_F = new ZSelf(_T,_K,this);
        return _F;};
    this.getHI=function(){return _I};//interfaces
    this.getCK=function(){return _K};//class key
    this.getCC=function(){return _C.concat()};//classes chain
    this.__dispose=function(){if(_P)_P.__dispose();$ZF.dispose(this);};
}

ZSelf.prototype={
    get super(){return this.getSuper()}
};
function ZSelf( T,K,S ){
    var _T = T, _K = K, _S = S;
    var H = {};
    
    this.getSuper = function(){return _S};
    
    var read = function( P ){
        console.log(9,'read',P);
        console.log( arguments.callee.caller.caller.name );
        var d = H[P];
        return d.v;
    };
    var write = function( prop, value ){
        console.log(9,'write');
    };
    var $FA = function(d,a,e){
        var len = a.length;
        if(d.over&&len){
            for(var o,t,r,m,n=0;n<d.over.length;n++){
                r = d.over[n];
                
                if( r.m > len ) continue;
                else if( r.l < len ) continue;
                
                for(m=0;m<len;m++){
                    o = r.d[m];
                    t = String(typeof(a[m])).charAt(0);
                    if(t=='o'){
                        if(o==Array&&!Array.isArray(a[m])){
                            m=100;break;
                        }else if(!(a[m] instanceof o)){
                            m=100;break;
                        }
                    }
                    else if(o==String&&t!='s'){
                        m=100;break;
                    }
                    else if(o==Number&&t!='n'){
                        m=100;break;
                    }
                    else if(o==Boolean&&t!='b'){
                        m=100;break;
                    }
                }
                if( m < 100 ){
                    return r.f.apply(_T,a);
                }
            }
        }
        if(d.F) return d.F.apply(_T,a);
        else if(d.over){
            $ZF.throw('Invalid arguments at '+e,0,e);
        }
        else $ZF.throw('Invalid Function');
    };
    var $FB = function(){
        var n,r,s,cm,am,rk,sm
            ,g=arguments
            ,a=Array.apply(null,g)
            ,p=a.shift()
            ,l=$ZF.className(_K)+'.'+p
            ,cd=H[p];
//        console.log(0,'$F$',cd.M);
        if( cd.M == 'pb' ){
            return $FA(cd,a,l);
        }
//        console.log("@@",arguments.callee.caller.name)
        if( !$AM( arguments.callee, cd.M ) ){
            switch(cd.M){
                case 'pv':m='Private';break;
                case 'pt':m='Protected';break;
                case 'it':m='Interval';break;
            }
            m = ' is '+m+' Method.';
            $ZF.error( "'"+$ZF.className(_K)+"."+p+"'"+m );
            return undefined;
        }
        return $FA(cd,a,l);
    };
    var $AM = function( callee, am ){
        var n,cm,cr = callee;
        if( am == 'pb' ) return true;
        for(var n = 0; n < 100; n++ ){
            if( cr && cr.caller ){
                cr = cr.caller;
                if( cr.name == '$FB' ){
                    cm = cr.caller.name;
                    break;}}
            else{break;}}
        if( cm ){
            var a = cm.split('_K');
            var k = parseInt(a[1]);
            if((am=='pt'&&$ZF.classChain(k).indexOf(_K)==-1)||
               (am=='it'&&$ZF.classPack(k)!=$ZF.classPack(_K))||
               (am=='pv'&&k!=_K)){return false}
            else return true;
        }else{
            return false;
        }
    }
    var $PB = function(){
        var a=Array.apply(null,arguments)
        ,k=a[0] // caller class key
        ,p=a[1] // property
        ,m=a[2] // get/set
        ,v=a[3] // value
        ,o=H[p] // info object
        ,d=o.D[0] // data-type
        ,t;
        
        
        if( !$AM( arguments.callee, o.M ) ){
            switch(o.M){
                case 'pv':m='Private';break;
                case 'pt':m='Protected';break;
                case 'it':m='Interval';break;
            }
            m = ' is '+m+' Property.';
            $ZF.error( "'"+$ZF.className(_K)+"."+p+"'"+m );
            return undefined;
        }
        if(m=='G'){
            return o.V;
        }
        else if(m=='S'){
            t = String(typeof(v)).charAt(0);
            
            if((!d||d==Object)||
               (t=='b'&&d==Boolean)||
               ((t=='s'||t=='u')&&d==String)||
               (t=='n'&&d==Number)||
               (d==Function&&(t=='f'||v===null))||
               (t=='o'&&d==Array&&(Array.isArray(v)||v===null))||
               (t=='o'&&((v instanceof d)||v===null))||
               ($ZF.classOf(d,ZInterface)&&$ZF.extendsOf(v,d))
            ){
                o.V = v;
            }else{
                $ZF.error('Invalid datatype. ['+d.name+']');return;
//                console.log('   X :',v);
            }
            
            
        }
    };
    
    
    var _F = "(function @(){var a=arguments;a=(a.length==1)?[a[0]]:Array.apply(null,a);a.unshift('%');return $FB.apply(this,a);})";
    var _R = function( m, a, b, c ){
        var s,p,v,d,o
        ,at=(a)?String(typeof(a))[0]:'x'
        ,bt=(b)?String(typeof(b))[0]:'x'
        ,ct=(c)?String(typeof(c))[0]:'x',
        tt=at+bt+ct;
        
//        console.log( tt );
        if(at=='f'||bt=='f'){
            if(bt=='f'){
                if(at=='s'){p=a;v=b;d=c;}
                else if(at=='o'&&Array.isArray(a)){p=b.name;d=a;v=b;}}
            else{p=a.name;v=a;d=b;}
            if(typeof(p)!='string'||p==''){
                $ZF.error('undefined function name');
                return;}
            if(['PB','PV','PT','IT','public','private',
                  'protected','internal'].indexOf(p)!=-1){
                $ZF.error('Invalid function name "'+p+'"');return;}
            o = H[p];
            if(!o){
                o = {M:m,P:p};
                H[p] = o;
                if(_T.hasOwnProperty(p)){
                    _S.override(p);
                }
                this[p] = _T[p] = eval(_F.replace('@',p+'_K'+_K)
                         .replace('%',p)).bind(this);
            }else if(o.M!=m){
                $ZF.error('Invalid access modifier in overload');
                return;
            }
            if(d){
                if(!o.over)o['over']=[];
                d = $ZF.array(d);
                d = {d:d,f:v};
                if(typeof(d.d[d.d.length-1])=='number'){
                    d.m = d.d.pop();
                    d.l = d.d.length;}
                else if(typeof(d.d[0])=='number'){
                    d.m = d.d.shift();
                    d.l = d.d.length;}
                else{
                    d.l = d.m = d.d.length;}
                if(d.m<1)d.m=1;
                o.over.push(d);
                o.over.sort(function(a,b){return a.m-b.m});
            }else{
                o['F'] = v;
            }
        }
        else{
//            console.log( 0, '[Property]', m, a );
            p=a,v=b,d=c;
            
            if(['','PB','PV','PT','IT','public','private',
                  'protected','internal'].indexOf(p)!=-1){
                $ZF.error('Invalid variable name "'+p+'"');return;}
            
            o = H[p];
            if(!o){
                o = {M:m,P:p,V:v,D:[d]};
                H[p] = o;
                c=[_K,p];
                c = _P.replace(/@/g,_K).replace(/#/g,p);
//                c = _P.replace(/@/g,function(){return c.shift()});
                a = eval(c.replace('%','G')).bind(this);
                b = eval(c.replace('%','S')).bind(this);
                Object.defineProperty(_T,p,{get:a,set:b});
            }
        }
    };
    var _P = "(function(){return $PB.apply(this,[@,'#','%',arguments[0]]);})";
    
    this.PB=this.public = function(){
        var a=Array.apply(null,arguments);
        a.unshift('pb');_R.apply(this,a);return this};
    this.PV=this.private = function(){
        var a=Array.apply(null,arguments);
        a.unshift('pv');_R.apply(this,a);return this};
    this.PT=this.protected = function(){
        var a=Array.apply(null,arguments);
        a.unshift('pt');_R.apply(this,a);return this};
    this.DF=this.default=
    this.IT=this.internal = function(){
        var a=Array.apply(null,arguments);
        a.unshift('it');_R.apply(this,a);return this};
    
    this.disable = function( $name, $message ){
        _S.disable( $name, $message );
        return this;
    };
    this.override = function( $name, $func ){
        _S.override( $name, $func );
        return this;
    };
}



ZObj.prototype={
    get obj(){return this.getObj()}}
function ZObj(obj){
    var o=(obj instanceof ZObj)?o=obj.obj:o=obj||{};
    this.getObj=function(){return o};
    this.has=function(p){return o.hasOwnProperty(p)};
    this.get=function(p,d){return (this.has(p))?o[p]:d};
    this.set=function(p,v){o[p]=v;return this;};
    this.init=function(p,v){if(!this.has(p))o[p]=v;return this;};
}

ZDebug.disabled = false;
ZDebug.block = [];
function ZDebug( T, N, C ){
    this.debug=function(){
        if(ZDebug.disabled)return;
        var a=[],n=arguments.length,m=this.debugName||this.name||'';
        if(ZDebug.block.indexOf(m)!=-1)return;
        while(n--)a.unshift(arguments[n]);
        if(a.length==0)a.unshift(' ');
        else if(m!='')a.unshift('['+m+']\n');
        console.log.apply(this,a);};
    this.dispose = function(){
        if( this.T ){
            delete this.T.debugObj;
            delete this.T.debug;
            delete this.T;}
        $ZF.dispose(this);};
    if(!N){
        var a=arguments.callee.caller;
        N=(a)?a.name:'';}
    if(T){
        if(N)T['debugName']=N;
        else if(T['name'])T['debugName']=T.name;
        T.debug=this.debug.bind(T);T.debugObj=this;this.T=T;
        if(C)T.debug('# CONSTRUCTOR');}else{this.debugName=N}
}

function ZInterface(){
    this.toString=function(){
//        console.log('!!!',this.prototype);
        return '[ZObject ZInterface]';
    };
}
function ZObject(){
    var $SP = [];
    this.supers = $SP;
    this.debug = function(){};
    this.dispose = function(){$ZF.dispose(this)};
    this.toString = function(){return '[ZObject '+this.dataType+']'};
    this.setProp = function(N,V){};//(name:String,value:Object):void
    this.getProp = function(N){//(name:String):*
        switch(N){
            case'super':return $SP[0];
            case'dataType':return (this.super)?this.super.dataType:'ZObject';
        }
    };
}



$PK = 'zf.core';
$ZF.extends(ZObject,ZSystemModule,$PK);
function ZSystemModule( N, V ){
    var $S=$ZF.super(this);
    var $N=N,$V=V;
    $S.disable('dispose');
    this.getName=function(){return $N};
    this.getVersion=function(){return $V};
    this.startup=function(){
        console.log('['+this.getName()+'].startup')};
}

$PK='zf.events';
ZEvent.CANCEL='cancel'; ZEvent.CLOSE='close'; ZEvent.OPEN='open';
ZEvent.COMPLETE='complete'; ZEvent.PROGRESS='progress';
ZEvent.DONE='done'; ZEvent.ERROR='error';
ZEvent.FAIL='fail'; ZEvent.OPEN='open';
$ZF.extends(ZObject,ZEvent,$PK,
['type','bubbles','cancelable','target','currentTarget','eventPhase',
'isDefaultPrevented','isStopPropagation','isStopImmediatePropagation']);
// ZEvent( type:String [, bubbles:Boolean, cancelable:Boolean] );
function ZEvent( T, B, C )
{
    var $super = $ZF.super(this)
    ,tp=T,bb=(B)?true:false,cb=(C)?true:false
    ,tg,ct,ep=0,dp=false,sp=false,sip=false;
    $super.override('getProp',function(p){
        switch(p){
            case'type':return tp;
            case'bubbles':return bb;
            case'cancelable':return cb;
            case'target':return tg;
            case'currentTarget':return ct;
            case'EP':case'eventPhase':return ep;
            case'DP':case'isDefaultPrevented':return dp;
            case'SP':case'isStopPropagation':return sp;
            case'SIP':case'isStopImmediatePropagation':return sip;
            default:return $super.getProp(p);
        }
    });
    this.preventDefault=function(){dp=true};
    this.stopImmediatePropagation=function(){sip=true};
    this.stopPropagation=function(){sp=true};
    this.clone=function(){return new ZEvent(tp,bb,cb)}
    this.__setCurrent=function(T,P){if(!tg)tg=T;ct=T;ep=P;}
}
$ZF.extends(ZEvent,ZDataEvent,$PK,{
    data:function(){return this.getData()}});
function ZDataEvent(t,d,b,c){
    var $S=$ZF.super(this,[t,b,c]),D=d;
    $S.override('dispose',function(){d=null;$S.dispose();$S=null;});
    this.getData=function(){return D};
}


$ZF.extends(ZInterface,IEventDispatcher,$PK);
function IEventDispatcher(){
    $ZF.interface(this,[
        'hasEvent',
        'addEvent','addEventListener',
        'removeEvent','removeEventListener',
        'dispatchEvent']);
    this.toString=function(){return '[ZObject IEventDispatcher]'}
}
$ZF.extends(ZObject,ZEventDispatcher,{P:$PK,I:IEventDispatcher});
function ZEventDispatcher( $P ){
    const CAPTURING=1,AT_TARGET=2,BUBBLING=3;
    // L:listeners hash, C:captures hash, P:parent
    var $super=$ZF.super(this,[]),L={},C={},P;
    $super.override('dispose',function(){
        var s,n,a;
        for(s in L){
            a=L[s];n=a.length;
            while(n--){a[n].splice(0,a[n].length);}
            a.splice(0,a.length);
            delete L[s]}
        for(s in C){
            a=C[s];n=a.length;
            while(n--){a[n].splice(0,a[n].length);}
            a.splice(0,a.length);
            delete C[s]}
        $super.dispose();$super=null;
    });
    //hasEvent(type:String):Boolean
    this.hasEvent=function(t){
        return ((L.hasOwnProperty(t)&&L[t].length)||
                (C.hasOwnProperty(t)&&C[t].length))?true:false;
    };
    //addEvent(type:String,listener:Function,[bindTarget:Object]):void
    this.addEvent = function(type,listener,target){
        if( !Array.isArray(type) ) type = [type];
        for( var n = 0; n < type.length; n++ ){
            this.addEventListener(type[n],listener,false,0,target); }
    };
    //addEventListener(type:String,listener:Function,[useCapture:Boolean,priority:uint,bindTarget:Object]):void
    this.addEventListener=function(t,l,u,p,b){
        u=(u)?true:false;
        p=parseInt(p)||0;
        var d=[t,l,p,b];
        if(u){
            if(!C[t])C[t]=[];
            C[t].push(d);
            C[t].sort(function(a,b){return b[2]-a[2]});}
        else{
            if(!L[t])L[t]=[];
            L[t].push(d); 
            L[t].sort(function(a,b){return b[2]-a[2]});}
    };
    //removeEvent(type:String,listener:Function,[useCapture:Boolean]):void
    this.removeEvent = function(t,l,u){
        if( !Array.isArray(type) ) type = [type];
        useCapture = (useCapture)?true:false;
        for( var n = 0; n < type.length; n++ ){
            this.removeEventListener(type[n],listener,useCapture); }
    };
    //removeEventListener(type:String,listener:Function,[useCapture:Boolean]):void
    this.removeEventListener = function(t,l,u){
        var n,a,o=(u)?C:L;
        if(!o.hasOwnProperty(t))return;
        a=o[t];n=a.length;
        while(n--){
            d=a[n];
            if(d[0]===t&&d[1]===l)
                a.splice(n,1);}
    };
    //dispatchEvent(event:ZEvent):void
    this.dispatchEvent = function( e ){
        if(typeof(e)=='string')e=new ZEvent(event);
        else if(e instanceof Event){
            e=new ZEvent(e.type,e.bubbles,e.cancelable);}
        else if(!(e instanceof ZEvent)){
            $ZF.error(String(e)+' is not Event Object');return;}
        var n,m,len,r,a,p,tg,t=e.type;
        e.__setCurrent(this,AT_TARGET);
        if( !e.bubbles ){
            a = this.__getListeners( t );
            for( m = 0; m < a.length; m++ ){
                r = a[m];
                r[1].call( r[3], e );
                if(e.SIP)return;}
            return;}
        var bb = this.__getBubbling();
        len = bb.length - 1;
        if( len < 0 ) len = 0;
        for( n = 0; n < len; n++ ){
            tg = bb[n];
            e.__setCurrent( tg, CAPTURING );
            a = tg.__getCaptures( t );
            for( m = 0; m < a.length; m++ ){
                r = a[m];
                r[1].call( r[3], e );
                if( e.SIP ) return; }
            if( e.SP ) return;}
        p = AT_TARGET;
        for( n = len; n >= 0; n-- ){
            tg = bb[n];
            e.__setCurrent( tg, p );
            p = BUBBLING;
            a = tg.__getListeners( t );
            for( m = 0; m < a.length; m++ ){
                r = a[m];
                r[1].call( r[3], e );
                if( e.SIP ) return; }
            if( e.SP ) return;}
    };
    this.__getBubbling = function(){
        if(P){var a=P.__getBubbling();a.push(this);return a;}
        else return [this]};
    this.__getCaptures=function(t){
        return (C.hasOwnProperty(t))?C[t]:[]};
    this.__getListeners=function(t){
        return (L.hasOwnProperty(t))?L[t]:[]};
    //__setParentDispatcher
    this.__setParentDispatcher = function(p){
        if(p instanceof ZEventDispatcher)P=p};
    // 부모 이벤트디스패처 등록
    if($P instanceof ZEventDispatcher) this.__setParentDispatcher($P);
};






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
        this.data = target.data;
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
    
    this.loadUrl = function( $url, $data, $type ){
        var request = new ZURLRequest( $url, $type );
        request.data = $data;
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
        
        var type = request.type.toUpperCase();
        var url = request.url;
        var async = request.async;
        var data = request.data;
        _http = this.getHTTPRequest();
        _http.timeout = request.timeout;
        _http.onreadystatechange = _onReadyStateChange.bind(this);
        
        _http.open( type, url, async );
        _http.setRequestHeader(
            'Content-Type','application/x-www-form-urlencoded');
        _http.send( data );
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





const HTTPStatus = {'1XX':'Information','2XX':'Successful','3XX':'Redirection','4XX':'Client Error','5XX':'Server Error','100':'Continue','101':'Switching Protocols','103':'Checkpoint','200':'OK','201':'Created',202:'Accepted',203:'Non-Authoritative Information','204':'No Content','205':'Reset Content','206':'Partial Content','300':'Multiple Choices','302':'Found','303':'See Other','304':'Not Modified','306':'Switch Proxy','307':'Temporary Redirect','308':'Resume Incomplete','400':'Bad Request','401':'Unauthorized','402':'Payment Required','403':'Forbidden','404':'Not Found','405':'Method Not Allowed','406':'Not Acceptable','407':'Proxy Authentication Required','408':'Request Timeout','409':'Conflict','410':'Gone','411':'Length Required','412':'Precondition Failed','413':'Request Entity Too Large','414':'Request-URI Too Long','415':'Unsupported Media Type','416':'Requested Range Not Satisfiable','417':'Expectation Failed','500':'Internal Server Error','501':'Not Implemented','502':'Bad Gateway','503':'Service Unavailable','504':'Gateway Timeout','505':'HTTP Version Not Supported','511':'Network Authentication Required',
UNINITIALIZED:0,LOADING:1,LOADED:2,INTERACTIVE:3,COMPLETED:4};