
/* - - - - - - - - - -
ZF.Events
*/
(function(){
    var Z=ZF;
    Z.packages('events');
    
    Z.global(false)
    .reads('type,eventPhase,bubbles,cancelable,target,currentTarget')
    .class(
        function Event( $type, $bubbles, $cancelable ){
            this.type=this.bubbles=this.cancelable=this.eventPhase=0;
            Z.init(this,null,{
                type:$type,
                eventPhase:0,
                bubbles:($bubbles)?true:false,
                cancelable:($cancelable)?true:false
            });
        }
    )
    .public( function clone(){
        return new Z.Event(this.type,this.bubbles,this.cancelable);
    })
    .public( function preventDefault(){
        if( this.cancelable )
            this.$$._val('__dp',true);
    })
    .public( function isDefaultPrevented(){
        return this.$$._val('__dp')||false;
    })
    .public( function stopPropagation(){
        this.$$._val('__sp',true);
        this.$$._val('currentTarget',null);
    })
    .public( function stopImmediatePropagation(){
        this.$$._val('__sip',true);
        this.$$._val('currentTarget',null);
    })
    ;
    
    var _dec=1000,
        _dispatchEvent = function($T,$E){
            var n,r,t = $E.type,
                e = $E.$$._vals(),
                v = $T.$$._vals().$EventDispatcher;
            e.target = $T;
            if(e.bubbles){
                var o,m=_dec,a=[$T],p=v.P;
                while(p&&m--){
                    a.unshift(p);
                    p = p.$$._vals().$EventDispatcher.P;}
                e.eventPhase = 1;
                for(m=0;m<a.length-1;m++){
                    if(e.__sp) return e.currentTarget = null;
                    r = a[m].$$._vals().$EventDispatcher.C;
                    if(!r[t]) continue;
                    r = r[t];
                    e.currentTarget = a[m];
                    for(n=0;n<r.length;n++){
                        if(e.__sip) return e.currentTarget = null;
                        r[n][1].call(null,$E);}}}
            e.eventPhase = 2;
            e.currentTarget = $T;
            r = v.L[t]||[];
            if(e.__sp) return e.currentTarget = null;
            for(n=0;n<r.length;n++){
                if(e.__sip) return e.currentTarget = null;
                r[n][1].call(null,$E);
            }
            if(e.bubbles){
                e.eventPhase = 3;
                for(m=a.length-2;m>=0;m--){
                    if(e.__sp) return e.currentTarget = null;
                    r = a[m].$$._vals().$EventDispatcher.L;
                    if(!r[t]) continue;
                    r = r[t];
                    e.currentTarget = a[m];
                    for(n=0;n<r.length;n++){
                        if(e.__sip) return e.currentTarget = null;
                        r[n][1].call(null,$E);}}}
            e.currentTarget = null;
        },
        _willTrigger = function($O,$T){
            var v,p=$O,m=_dec;
            while(p&&m--){
                v = p.$$._vals().$EventDispatcher;
                if( v.L[$T]||v.C[$T])return true;
                p = v.P;}
            return false;
        }
    ;
    Z.global(false)
    .class(
        function EventDispatcher( $IEventDispatcher ){
            var self = Z.init(this,null,{
                $EventDispatcher:{
                    L:{},C:{},P:$IEventDispatcher
                }
            });
        }
    )
    .override(function dispose(){
        console.log('EventDispatcher.dispose');
        this.super.dispose();
    })
    .public( function addEvents($type,$listener){
        if(!Array.isArray($type))$type = [$type];
        for(var n = 0; n < $type.length; n++ )
            this.addEventListener($type[n],$listener);
    })
    .public( function removeEvents($type,$listener){
        if(!Array.isArray($type))$type = [$type];
        for(var n = 0; n < $type.length; n++ )
            this.removeEventListener($type[n],$listener);
    })
    .public( function addEventListener($type,$listener,$useCapture,$priority){
        var r, t = $type, p = parseInt($priority)||-1,
            v = this.$$._vals().$EventDispatcher,
            d = [t,$listener,p];
        if($useCapture) r = (!v.C[t])?v.C[t]=[]:v.C[t];
        else            r = (!v.L[t])?v.L[t]=[]:v.L[t];
        r.push(d);
        r.sort(function(a,b){return b[2]-a[2]});
    })
    .public( function removeEventListener($type,$listener,$useCapture){
        var n,v = this.$$._vals().$EventDispatcher,
            r = ($useCapture)?v.C:v.L;
        if(!r.hasOwnProperty($type))return;
        var a=r[$type],n=a.length;
        while(n--){
            if(a[n][0]===$type&&a[n][1]===$listener)
                a.splice(n,1);}
    })
    .public( function hasEventListener($type){
        var v = this.$$._vals().$EventDispatcher;
        return v.L.hasOwnProperty($type)||v.C.hasOwnProperty($type);
    })
    .public( function dispatchEvent($event){
        if( $event instanceof ZF.Event ){
            _dispatchEvent(this,$event);
        }
        else if( $event instanceof Event ){
            _dispatchEvent(this,new ZF.Event($event.type));
        }
    })
    .public( function willTrigger($type){
        return _willTrigger(this,$type);
    })
    ;
})();