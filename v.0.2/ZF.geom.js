
/* - - - - - - - - - -
ZF.Geom
*/
(function(){
var Z=ZF,CN;
Z.packages('zf.geom');

Z.global()
.class(
    function Point($x,$y){
        this.x = $x||0;
        this.y = $y||0;
        Z.init(this);
    }
)
.prop('length',{get:function(){return this.distance(this);}})
.proto({
    clone:function(){
        return new Z.Point(this.x,this.y);},
    add:function(p){
        return new Z.Point(this.x+p.x,this.y+p.y);},
    subtract:function(p){
        return new Point(this.x-p.x,this.y-p.y);},
    equals:function(p){
        return (this.x==p.x&&this.y==p.y)?true:false;},
    copyFrom:function(p){
        this.x = p.x; this.y = p.y;
        return this;},
    offset:function(x,y){
        this.x += x; this.y += y;
        return this;},
    setTo:function(x,y){
        this.x = x; this.y = y;
        return this;},
    normalize:function(s){
        n = Math.sqrt(this.x*this.x+this.y*this.y);
        this.x = s * this.x / n; this.y = s * this.y / n;
        return this;},
    polar:function(D,A){
        this.x = D * Math.cos(A);
        this.y = D * Math.sin(A);
        return this;
    },
    interpolate:function(p1,p2,f){
        this.x = ((p2.x-p1.x)*f)+p1.x;
        this.y = ((p2.y-p1.y)*f)+p1.y;
        return this;
    },
    radian:function(to){
        var tx=0,ty=0;
        if(to){tx=to.x;ty=to.y;}
        return Math.atan2(ty-this.y,tx-this.x);
    },
    degree:function(to){
        var tx=0,ty=0;
        if(to){tx=to.x;ty=to.y;}
        return Math.atan2(ty-this.y,tx-this.x)*180/Math.PI;
    },
    distance:function(to){
        var tx=0,ty=0;
        if(to){tx=to.x;ty=to.y;}
        var x=this.x-tx,y=this.y-ty;
        return Math.sqrt(x*x+y*y);
    },
    toString:function(){
        return '(x:'+this.x+', y:'+this.y+')';
    }
})
.static({
    set:function(a,b){
        if(Array.isArray(a)){b=a[1];a=a[0];}
        return new Z.Point(a,b);
    },
    distance:function(p1,p2){
        var p = [p1,p2];
        if(!p2){p.pop();p2 = new Z.Point();}
        ZF.paramCheck(p,[Z.Point,Z.Point],'distance()');
        var x = p1.x-p2.x, y = p1.y-p2.y;
        return Math.sqrt( x*x + y*y );
    },
    polar:function(D,A){
        ZF.paramCheck(Number,2);
        return new Z.Point().polar(D,A);
    },
    interpolate:function(p1,p2,f){
        ZF.paramCheck([Z.Point,Z.Point,Number],3);
        return new Z.Point().interpolate(p1,p2,f);
    },
    degree:function(p1,p2){
        ZF.paramCheck([p1,p2],Z.Point,'degree()');
        return p1.degree(p2);
    }
})
;

    
    
Z.global().class(
    function Rectangle($x,$y,$w,$h){
        Z.init(this,null,{
            x:$x||0, y:$y||0,
            width:$w||0, height:$h||0
        });
    }
)
.props('x,y,width,height,top,bottom,left,right')
.prop('topLeft',{
    get:function(){return this.getCorner(1)},
    set:function(p){
        ZF.typeCheck(p,Z.Point,'topLeft');
        this.setCorner(1,p)}})
.prop('bottomRight',{
    get:function(){return this.getCorner(4)},
    set:function(p){
        ZF.typeCheck(p,Z.Point,'bottomRight');
        this.setCorner(4,p)}})
.prop('size',{
    get:function(){return new Z.Point(this.width,this.height)},
    set:function(p){
        ZF.typeCheck(p,Z.Point,'size');
        this.width = p.x; this.height = p.y;}})
.static(CONST,'TOP_LEFT',1)
.static(CONST,'TOP_RIGHT',2)
.static(CONST,'BOTTOM_RIGHT',4)
.static(CONST,'BOTTOM_LEFT',8)
.override(function getProp(p){
    var v = this.$$._vals();
    switch(p){
        case'top':return v.y;
        case'bottom':return v.y+v.height;
        case'left':return v.x;
        case'right':return v.x+v.width;
        default:return v[p];
    }
})
.override(function setProp(p,v){
    var n=Number(v),o=this.$$._vals();
    ZF.typeCheck(n,Number,p);
    switch(p){
        case'width':case'height':
        case'x':case'y':o[p] = n;break;
        case'right':o.width=n-o.x;break;
        case'left':o.width+=o.x-n;o.x=n;break;
        case'bottom':o.height=n-o.y;break;
        case'top':o.height += o.y-n;o.y=n;break;
    }
})
.proto({
    getCorner:function(t){
        if(typeof(t)=='string'){
            switch(t.toLowerCase()){
                case'topleft':case'tl':t=1;break;
                case'topright':case'tr':t=2;break;
                case'bottomleft':case'bl':t=8;break;
                case'bottomright':case'br':t=4;break;}}
        var p = new Point(),d = this.$$._vals();
        if(t==1||t==8)p.x=d.x;else p.x=d.x+d.width;
        if(t==1||t==2)p.y=d.y;else p.y=d.y+d.height;
        return p;
    },
    setCorner:function(t,p){
        ZF.typeCheck(p,Z.Point,'setCorner() parameter');
        if(typeof(t)=='string'){
            switch(t.toLowerCase()){
                case'topleft':case'tl':t=1;break;
                case'topright':case'tr':t=2;break;
                case'bottomleft':case'bl':t=8;break;
                case'bottomright':case'br':t=4;break;}}
        if(t<4) this.top = p.y;
        else this.bottom = p.y;
        if(t==1||t==8) this.left = p.x;
        else this.right = p.x;
    },
    clone:function(){
        return new Z.Rectangle(this.x,this.y,this.width,this.height);
    },
    contains:function(x,y){
        var v = this.$$._vals();
        return (v.x<=x&&x<=v.width)&&(v.y<=y&&y<=v.height);
    },
    containsPoint:function(p){
        ZF.typeCheck(p,Z.Point,'containsPoint() parameter');
        var v = this.$$._vals();
        return (v.x<=p.x&&p.x<=v.width)&&(v.y<=p.y&&p.y<=v.height);
    },
    containsRect:function(to){
        ZF.typeCheck(to,Z.Rectangle,'equals() parameter');
        var a=this.$$._vals(),b=to.$$._vals();
        return (a.x<=b.x)&&(a.y<=b.y)&&(b.x+b.width<=a.x+a.width)&&(b.y+b.height<=a.x+a.height);
    },
    copyFrom:function(to){
        ZF.typeCheck(to,Z.Rectangle,'copyFrom() parameter');
        var a=this.$$._vals(),b=to.$$._vals();
        a.x=b.x;a.y=b.y;a.width=b.width;a.height=b.height;
    },
    equals:function(to){
        ZF.typeCheck(to,Z.Rectangle,'equals() parameter');
        var a=this.$$._vals(),b=to.$$._vals();
        return a.x==b.x&&a.y==b.y&&a.width==b.width&&a.height==b.height;
    },
    inflate:function(dx,dy){
        ZF.paramCheck([dx,dy],[Number,Number],'inflate()');
        var v = this.$$._vals();
        v.x -= dx; v.width += dx*2;
        v.y -= dy; v.height += dy*2;
    },
    inflatePoint:function(p){
        ZF.typeCheck(p,Z.Point,'inflatePoint() parameter');
        var v = this.$$._vals(),x=p.x,y=p.y;
        v.x -= x; v.width += x*2;
        v.y -= y; v.height += y*2;
    },
    intersection:function(to){
        ZF.typeCheck(to,Z.Rectangle,'intersection() parameter');
        var rect = new Rectangle();
        rect.left = Math.max(this.left,to.left);
        rect.right = Math.min(this.right,to.right);
        rect.top = Math.max(this.top,to.top);
        rect.bottom = Math.min(this.bottom,to.bottom);
        if(rect.isEmpty()) rect.setTo(0,0,0,0);
        return rect;
    },
    intersects:function(to){
        ZF.typeCheck(to,Z.Rectangle,'intersects() parameter');
        return !this.intersection(to).isEmpty();
    },
    isEmpty:function(){
        var v = this.$$._vals();
        return v.width<=0||v.height<=0;
    },
    offset:function(dx,dy){
        var v = this.$$._vals();
        v.x += dx; v.y += dy;
    },
    offsetPoint:function(p){
        ZF.typeCheck(p,Z.Point,'offsetPoint() parameter');
        var v = this.$$._vals();
        v.x += p.x; v.y += p.y;
    },
    setEmpty:function(){
        var v = this.$$._vals();
        v.x=v.y=v.width=v.height=0;
        return this;
    },
    setTo:function(x,y,w,h){
        ZF.paramCheck([x,y,w,h],[Number,Number,Number,Number],'setTo()');
        var v = this.$$._vals();
        v.x=x;v.y=y;v.width=w;v.height=h;
    },
    union:function(to){
        ZF.typeCheck(to,Z.Rectangle,'union() parameter');
        var rect = new Rectangle();
        rect.left = Math.min(this.left,to.left);
        rect.right = Math.max(this.right,to.right);
        rect.top = Math.min(this.top,to.top);
        rect.bottom = Math.max(this.bottom,to.bottom);
        return rect;
    }
})
.override( function toString(){
    var v = this.$$._vals();
    return '(x:'+v.x+', y:'+v.y+', width:'+v.width+', height:'+v.height+')';
})
;
    
    
    
    
    
    
var ps = ['redMultiplier', 'greenMultiplier', 'blueMultiplier', 'alphaMultiplier', 'redOffset', 'greenOffset', 'blueOffset', 'alphaOffset'];
Z.global()
.props(ps)
.prop('color',{
    get:function(){return this.$$._get('color')},
    set:function(v){this.setColor(v)}
})
.class(
    function ColorTransform(rm,gm,bm,am,ro,go,bo,ao)
    {
        Z.init(this,null,{
            redMultiplier:rm||1,greenMultiplier:gm||1,
            blueMultiplier:bm||1,alphaMultiplier:am||1,
            redOffset:ro||0,greenOffset:go||0,
            blueOffset:bo||0,alphaOffset:ao||0
        });
    }
)
.override(function toString(){
    var n,a=[],v = this.$$._vals();
    for(n=0;n<ps.length;n++){
        a.push(ps[n]+':'+v[ps[n]]);
    }
    return '('+a.join(', ')+')';
})
.override(function setProp(p,v){
    var a,o=this.$$._vals();
    switch(p){
        case'alphaOffset':
            this.setOffset(
                o.redOffset,o.greenOffset,
                o.blueOffset,v);
            break;
        case'redOffset':case'greenOffset':case'blueOffset':
            o[p]=v;
            this.setOffset(
                o.redOffset,o.greenOffset,
                o.blueOffset);
            break;
        default:this.$$._set(p,v);
    }
})
.proto({
    setColor:function(v){
        var a,o=this.$$._vals();
        v = parseInt(v);
        if(v>0xFFFFFF){
            a = (v>>24&0xFF)/255;
            v = v&0xFFFFFF;
            o.alpha = a;
        }else if(v<0)v=0;
        o.color = v;
        o.redOffset = v>>16&0xFF;
        o.greenOffset = v>>8&0xFF;
        o.blueOffset = v&0xFF;
    },
    setOffset:function(r,g,b,a){
        var o=this.$$._vals();
        r=parseInt(r);
        g=parseInt(g);
        b=parseInt(b);
        o.redOffset=(r>255)?255:(r<0)?0:r;
        o.greenOffset=(g>255)?255:(g<0)?0:g;
        o.blueOffset=(b>255)?255:(b<0)?0:b;
        o.color=(o.redOffset<<16)+(o.greenOffset<<8)+o.blueOffset;
        if(a) o.alphaOffset = parseInt(a);
    },
    setMultiplier:function(r,g,b,a){
        r=Number(r)||0;
        g=Number(g)||0;
        b=Number(b)||0;
    }
})
;
    
    
Z.global().class(
    function Vector3D(x,y,z,w){
        Z.init(this,null,{
            x:(isNaN(x))?0:x,y:(isNaN(y))?0:y,
            z:(isNaN(z))?0:z,w:(isNaN(w))?0:w});
    }
)
.props('w,x,y,z')
.prop('length',{get:function(){
    return Z.Vector3D.distance(Z.Vector3D.ZERO,this);}})
.prop('lengthSquared',{get:function(){
    var v=Z.Vector3D.distance(Z.Vector3D.ZERO,this);
    return v*v;}})
.proto({
    add:function(a){
        ZF.paramCheck(a,Z.Vector3D,'add()');
        var o=this.$$._vals();
        return new Z.Vector3D(o.x+a.x,o.y+a.y,o.z+a.z);},
    clone:function(){
        var o=this.$$._vals();
        return new Z.Vector3D(o.x,o.y,o.z,o.w);},
    copyFrom:function(a){
        ZF.paramCheck(a,Z.Vector3D,'copyFrom()');
        var o=this.$$._vals();
        o.x=a.x;o.y=a.y;o.z=a.z;},
    crossProduct:function(a){
        ZF.paramCheck(a,Z.Vector3D,'crossProduct()');
        var o=this.$$._vals();
        return new Z.Vector3D(o.y*a.z-o.z*a.y,
            o.z*a.x-o.x*a.z,o.x*a.y-o.y*a.x)},
    decrementBy:function(a){
        ZF.paramCheck(a,Z.Vector3D,'decrementBy()');
        var o=this.$$._vals();o.x-=a.x;o.y-=a.y;o.z-=a.z;},
    dotProduct:function(a){
        ZF.paramCheck(a,Z.Vector3D,'dotProduct()');
        var o = this.$$._vals();
        return o.x*a.x + o.y*a.y + o.z*a.z;},
    equals:function(to,all){
        ZF.paramCheck(to,Z.Vector3D,'equals()');
        var o=this.$$._vals();
        if(o.x!=to.x||o.y!=to.y||o.z!=to.z)return false;
        return (!all)?true:o.w==to.w;},
    incrementBy:function(a){
        var o=this.$$._vals();o.x+=a.x;o.y+=a.y;o.z+=a.z;},
    nearEquals:function(a,near,all){
        ZF.paramCheck([a,near],[Z.Vector3D,Number],'nearEquals()');
        var o=this.$$._vals(),x=Math.abs(o.x-a.x),
            y=Math.abs(o.y-a.y),z=Math.abs(o.z-a.z);
        if(x>near||y>near||z>near)return false;
        return (!all)?true:Math.abs(o.w-a.w)<=near;},
    negate:function(){
        var o=this.$$._vals();o.x=-o.x;o.y=-o.y;o.z=-o.z;},
    normalize:function(){
        var o=this.$$._vals(),d=Math.sqrt(o.x*o.x+o.y*o.y+o.z*o.z);
        if(d==0)return 0;o.x/=d;o.y/=d;o.z/=d;return d;},
    project:function(){
        var o=this.$$._vals(),w=o.w;
        if(w==0)return;o.x/=w;o.y/=w;o.z/=w;},
    scaleBy:function(s){
        ZF.paramCheck([s],Number,'scaleBy()');
        var o=this.$$._vals();o.x*=a.x;o.y*=a.y;o.z*=a.z;},
    setTo:function(xa,ya,za){
        ZF.paramCheck([xa,ya,za],Number,'setTo()');
        var o=this.$$._vals();o.x=xa;o.y=ya;o.z=za;},
    subtract:function(a){
        ZF.paramCheck(a,Z.Vector3D,'subtract()');
        var o=this.$$._vals();
        return new Z.Vector3D(o.x-a.x,o.y-a.y,o.z-a.z);},
    toString:function(){
        var o=this.$$._vals();
        return '(x:'+o.x+', y:'+o.y+', z:'+o.z+')';}
})
.static({
    angleBetween:function(a,b){
        ZF.paramCheck([a,b],Z.Vector3D,'distance()');
        var t=0,x=0,y=0,n=3;
        a = [a.x,a.y,a.z]; b = [b.x,b.y,b.z];
        while( n-- ){
            t += a[n]*b[n];
            x += a[n]*a[n];
            y += b[n]*b[n];}
        return Math.acos(t/Math.sqrt(x*y));},
    distance:function(v1,v2){
        ZF.paramCheck([v1,v2],Z.Vector3D,'distance()');
        var dx=v1.x-v2.x,dy=v1.y-v2.y,dz=v1.z-v2.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);}
})
.static(CONST,{
    X_AXIS:new Z.Vector3D(1,0,0),
    Y_AXIS:new Z.Vector3D(0,1,0),
    Z_AXIS:new Z.Vector3D(0,0,1),
    ZERO:new Z.Vector3D(0,0,0)
})
;
 
    
    
Z.global()
.class(
    function Matrix(a,b,c,d,tx,ty){
        Z.init(this,null,{
            a:Number(a)||1,b:Number(b)||0,
            c:Number(c)||0,d:Number(d)||1,
            tx:Number(tx)||0,ty:Number(ty)||0
        })
    }
)
.override(function setProp(p,v){
    switch(p){
        case'a':case'b':case'c':case'd':case'tx':case'ty':
            this.$$._val(p,Number(v)||0);
            break;
        default:this.$$._set(p,v);
    }
})
.proto({
    clone:function(){
        var o = this.$$._vals();
        return new Z.Matrix(o.a,o.b,o.c,o.d,o.tx,o.ty);
    },
    concat:function(m){
        
    },	
    copyColumnFrom:function(column,vector3D){
        
    },
    copyColumnTo:function(column,vector3D){
        
    },
    copyFrom:function(sourceMatrix){
        
    },
    copyRowFrom:function(row,vector3D){
        
    },
    copyRowTo:function(row,vector3D){
        
    },
    createBox:function(scaleX,scaleY,rotation,tx,ty){
        
    },
    createGradientBox:function(width,height,rotation,tx,ty){
        
    },
    deltaTransformPoint:function(point){
        
    },
    identity:function(){
        
    },
    invert:function(){
        
    },
    rotate:function(angle){
        
    },
    scale:function(sx,sy){
        
    },
    setTo:function(aa,ba,ca,da,txa,tya){
        
    },
    transformPoint:function(point){
        
    },
    translate:function(dx,dy){
        
    },
    toString:function(){
        var o=this.$$._vals();
        return '(a='+o.a+', b='+o.b+', c='+o.c+', d='+o.d+', tx='+o.tx+', ty='+o.ty+')';
    }
})
;

    
    
})();







