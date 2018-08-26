

var PathType = {
    MOVE:1,LINE:2,CURVE:3,QUADRATIC:4,BEZIER:5,ARC:6,ARC_TO:7,ELLIPSE:8,RECT:9,
    BEGING_PATH:51,CLOSE_PATH:52,CLEAR_RECT:53,CLIP:54,ROTATE:55,
    SCALE:56,TRANSLATE:57,TRANSFORM:58,SET_TRANSFORM:59,
    FILL:60,FILL_RECT:61,FILL_STYLE:62,FILL_TEXT:63,STROKE:64,
    STROKE_RECT:65,STROKE_STYLE:66,STROKE_TEXT:67,LINE_CAP:68,
    LINE_DASH:69,LINE_DASH_OFFSET:70,LINE_JOIN:71,LINE_WIDTH:72,
    MITER_LIMIT:73,
    PUT_IMAGE_DATA:75,
    
    DRAW_IMAGE:80,
    FONT:81,
    TEXT_ALIGN:82,
    TEXT_BASELINE:83,
    GLOBAL_ALPHA:85,
    GLOBAL_COMPOSITE_OPERATION:86,
    SHADOW_BLUR:87,
    SHADOW_COLOR:88,
    SHADOW_OFFSET_X:89,
    SHADOW_OFFSET_Y:90,
    FILTER:91,
};

/* - - - - - - - - - -
ZF.Display
*/
(function(){
    var Z=ZF,PT=PathType;
    Z.packages('zf.display');
    
    
Z.global()
.extends(Z.ColorTransform)
.props('brightness,tintColor,tintMultiplier')
.class(
    function Color(){
        Z.init(this,[1,1,1,1,0,0,0,255],
               {brightness:0,tintColor:0,tintMultiplier:0});
    }
)
.override(function toString(){
    var o = this.$$._vals();
    return '(red:'+o.redOffset+', green:'+o.greenOffset+', blue:'+o.blueOffset+')';
})
.override(function setProp(p,v){
    switch(p){
        case'brightness':this.setBrightness(v);break;
        case'tintColor':this.setTint(v,this.tintMultiplier);break;
        case'tintMultiplier':this.setTint(this.tintColor,v);break;
        default:this.super.setProp(p,v);
    }
})
.proto({
    setBrightness:function(v){
        v = Number(v)||0;
        v = (v<-1)?-1:(v>1)?1:v;
        this.$$._val('brightness',v);
        console.log('setBrightness',v);
        this.setColor(Z.Color.interpolateColor(0,0xFFFFFF,v));
    },
    setTint:function(tc,tm){
        tc = Number(tc)||0;
        tm = Number(tm)||0;
        tc = (tc<0)?0:(tc>0xFFFFFF)?0xFFFFFF:tc;
        tm = (tm<0)?0:(tm>1)?1:tm;
        this.setColor(Z.Color.interpolateColor(0,tc,tm));
    },
    set:function(V){
        var r,g,b,a,x,y,z=[],o=this.$$._vals();
        if(typeof(V)=='string'){
            V=V.toLowerCase();
            if(ZF.Color.NameMap[V])V=ZF.Color.NameMap[V];
            if(V.indexOf('rgb')!=-1){
                x=V.indexOf('(');y=V.indexOf(')');
                z=V.substring(x+1,y).split(',');
                if(V.indexOf('rgba')!=-1)
                    z[3]=Math.round(Number(z[3])*255);
                else if(z.length==4)z.pop();
            }else if((x=V.indexOf('#'))!=-1){
                V=V.substr(x+1);
                x=parseInt(V,16);
                z=[x>>16&0xFF,x>>8&0xFF,x&0xFF];
                if(V.length>6)a=(x>>24&0xFF)/255;
            }else{
                z=[0,0,0];
            }
        }else if(!isNaN(V)) return this.setColor(V);
        else if(ZF.isArr(V)) z = V;
        this.setOffset.apply(this,z);
    },
    get:function(T){
        var a='',v,n,o=this.$$._vals();
        switch(T.toLowerCase()){
            case'hexa':
                a = o.alphaOffset.toString(16);
                if(a.length==1)a='0'+a;
            case'hex':
                v = o.color.toString(16);
                n = 6-v.length;
                while(n--)v='0'+v;
                return ('#'+a+v).toUpperCase();
            case'rgb':
                a=[o.redOffset,o.greenOffset,o.blueOffset];
                return 'rgb('+a.join(',')+')';
            case'rgba':
                a=[o.redOffset,o.greenOffset,o.blueOffset,(o.alphaOffset/255)];
                return 'rgba('+a.join(',')+')';
        }
    }
})
.static({
    interpolateColor:function(c1,c2,p){
        var E;
        if(E=ZF.paramError(Number,3))throw new E[0](E[1]);
        var a1=c1>>24&0xFF,r1=c1>>16&0xFF,
            g1=c1>>8&0xFF,b1=c1&0xFF,
            a2=c2>>24&0xFF,r2=c2>>16&0xFF,
            g2=c2>>8&0xFF,b2=c2&0xFF;
        var a=((a2-a1)*p)+a1,r=((r2-r1)*p)+r1,
            g=((g2-g1)*p)+g1,b=((b2-b1)*p)+b1,
            c=Math.round((r<<16)+(g<<8)+b);
        return (a1+a2==0)?c:c+(a<<24);
    }
})
;
    
    
    
Z.global()
.props('width,color,alpha,cap,join,miter')
.class(
    function StrokeStyle(w,s,a,c,j,m){
        Z.init(this,null,{
            width:w,color:s,alpha:a||1,cap:c,join:j,miter:m
        });
        this.setStyle(w,s,a,c,j,m);
    }
)
.proto({
    getStyle:function(){
        return this.color;
    },
    setStyle:function(width,color,alpha,cap,join,miter){
        var o, a=ZF.paramArray();
        if(Array.isArray(width)){a=width;width=0;}
        o = (typeof(width)=='object')?width:{
            width:a[0],color:a[1],alpha:a[2],
            cap:a[3],join:a[4],miter:a[5]};
        this.width = o.width||1;
        this.color = o.color||0;
        this.alpha = o.alpha||1;
        this.cap = o.cap;
        this.join = o.join;
        this.dash = o.dash;
        this.dashOffset = o.dashOffset;
        this.miterLimit = o.miterLimit||10;
    },
    setContext:function(T){
        T.lineWidth = this.width;
        T.miterLimit = this.miterLimit;
        T.strokeStyle = this.getStyle();
        if(this.cap)T.lineCap = this.cap;
        if(this.join)T.lineJoin = this.join;
    }
})
;

var FS = {
    GRADIENT:'gradient',
    LINEAR:'linear',
    RADIAL:'radial',
    PATTERN:'pattern'
};
Z.global()
.props('color,alpha,mode')
.prop('style',{
    get:function(){return this.getStyle()},
    set:function(v){this.setStyle(v)}})
.static(CONST,FS)
.class(
    function FillStyle(style){
        Z.init(this,null,{color:0,alpha:1});
        if(arguments.length)
            this.setStyle.apply(this,arguments);
    }
)
.proto({
    getStyle:function(){
        return this.color;
    },
    setStyle:function(style){
        var o,a=ZF.paramArray();
        o = (ZF.isObj(style,true))?style:{
            color:a[0],alpha:a[1]
        };
        this.mode = o.mode||'color';
        this.color = o.color||0;
        this.alpah = o.alpha||0;
    },
    setContext:function(T){
        if(this.mode=='color'){
            var s = this.color;

            T.fillStyle = this.color;
        }
    }
})
;




Z.global().class(
    function Path(){
        ZF.define(this,'paths',{value:[],writable:false});
        Z.init(this);
    }
)
.override(function dispose(){
    this.clearData();
    this.super.dispose();
})
.proto({
    addData:function(data){
        this.paths.push(data);
    },
    clearData:function(){
        var p=this.paths,n=p.length;
        while(n--) p.splice(n,1);
        return this;
    },
    addPath:function(target){
        if(target instanceof Z.Path){
            var n,d = target.paths;
            for( n = 0; n < d.length; n++ )
                this.addData(d[n]);}
        return this;
    },
    moveTo:function(x,y){
        this.addData([PT.MOVE,x,y]);return this},
    lineTo:function(x,y){
        this.addData([PT.LINE,x,y]);return this},
    curveTo:function(ax,ay,bx,by){
        this.addData([PT.CURVE,ax,ay,bx,by]);return this},
    bezierTo:function(ax,ay,bx,by,cx,cy){
        this.addData([PT.BEZIER,ax,ay,bx,by,cx,cy]);return this},
    arc:function(x,y,r,s,e,a){
        this.addData([PT.ARC,x,y,r,s,e,a]);return this},
    arcTo:function(ax,ay,bx,by,r){
        this.addData([PT.ARC_TO,ax,ay,bx,by,r]);return this},
    ellipse:function(x,y,rx,ry,r,s,e,a){
        this.addData([PT.ELLIPSE,x,y,rx,ry,r,s,e,a]);return this},
    rect:function(x,y,w,h){
        this.addData([PT.RECT,x,y,w,h]);return this},
    getPoints:function(){
        var n,v,z=[];
        for(n=0;n<this.paths.length;n++){
            v=this.paths[n];
            switch(v[0]){
                case PT.MOVE:case PT.LINE:
                    z.push(new Z.Point(v[1],v[2]));break;
                case PT.CURVE:case PT.ARC_TO:
                    z.push(new Z.Point(v[1],v[2]),new Z.Point(v[3],v[4]));break;
                case PT.BEZIER:
                    z.push(new Z.Point(v[1],v[2]),
                           new Z.Point(v[3],v[4]),
                           new Z.Point(v[5],v[6]));break;
            }
        }
        return z;
    }
})
;
Z.Path.prototype.quadraticCurveTo = Z.Path.prototype.curveTo;
Z.Path.prototype.bezierCurveTo = Z.Path.prototype.bezierTo;


Z.global()
.static({
    instance:function(){return _PShape},
    roundRect:function(){
        return _PShape.roundRect.apply(_PShape,arguments)},
    polygon:function(){
        return _PShape.polygon.apply(_PShape,arguments)},
    star:function(){
        return _PShape.star.apply(_PShape,arguments)},
    drawCurveLine:function(){
        return _PShape.drawCurveLine.apply(_PShape,arguments)},
    drawLine:function(){
        return _PShape.drawLine.apply(_PShape,arguments)},
    drawArcLine:function(){
        return _PShape.drawArcLine.apply(_PShape,arguments)},
    drawRoundLine:function(){
        return _PShape.drawRoundLine.apply(_PShape,arguments)},
})
.class(
    function PathShape(){
        Z.init(this,null)
    }
)
.proto({
    roundRect:function(x,y,w,h,ew,eh){
        if(!ew)ew=Math.min(w,h)/2;
        if(!eh)eh=ew;
        var r=x+w,b=y+h,path=new Path();
        return path.moveTo(x+ew,y)
        .lineTo(r-ew,y).curveTo(r,y,r,y+eh)
        .lineTo(r,b-eh).curveTo(r,b,r-ew,b)
        .lineTo(x+ew,b).curveTo(x,b,x,b-eh)
        .lineTo(x,y+eh).curveTo(x,y,x+ew,y);
    },
    polygon:function(x,y,radius,vertex,angle,type,value){
        var opt;
        if(typeof(x)=='object'){
            opt = x; x = opt.x; y = opt.y;
            radius = opt.radius; vertex = opt.vertex;
            angle = opt.angle; type = opt.type; value = opt.value;}
        var n,r,z=[],
            rad = radius||30,
            ver = vertex||3,
            ang = angle||0,
            m = 360/ver;
        x = x||0; y = y||0; ang -= 90;
        for(n=0;n<ver;n++){
            r = Math.PI*((m*n)+ang)/180;
            z.push( Z.Point.polar(rad,r).offset(x,y) );
        }
        opt = {close:true,point:z,value:value};
        switch(type){
            case'round':return this.drawRoundLine(opt);
            case'curve':return this.drawCurveLine(opt);
            case'arc':return this.drawArcLine(opt);
            default:return this.drawLine(opt); }
    },
    star:function(x,y,radius,inside,vertex,angle,type,value){
        var opt;
        if(typeof(x)=='object'){
            opt = x; x = opt.x; y = opt.y;
            radius = opt.radius; vertex = opt.vertex;
            angle = opt.angle; type = opt.type; value = opt.value;}
        var n,r,z=[],
            rad = radius||30,
            ins = inside||rad*0.4,
            ver = vertex||5,
            ang = angle||0,
            m = 360/ver, h = Math.PI*(m/2)/180;
        x = x||0; y = y||0; ang -= 90;
        for(n=0;n<ver;n++){
            r = Math.PI*((m*n)+ang)/180;
            z.push( Z.Point.polar(rad,r).offset(x,y) );
            z.push( Z.Point.polar(ins,r+h).offset(x,y) );
        }
        opt = {close:true,point:z,value:value};
        switch(type){
            case'round':return this.drawRoundLine(opt);
            case'curve':return this.drawCurveLine(opt);
            case'arc':return this.drawArcLine(opt);
            default:return this.drawLine(opt); }
    },
    drawLine:function(){
        var n,p,opt=this.getDrawOpt(arguments),path=new Z.Path();
        path.moveTo(opt.ps[0].x,opt.ps[0].y);
        for(n=1;n<opt.ps.length;n++)
            path.lineTo(opt.ps[n].x,opt.ps[n].y);
        if(opt.close) path.lineTo(opt.ps[0].x,opt.ps[0].y);
        return path;
    },
    drawCurveLine:function(){
        var n,p,opt=this.getDrawOpt(arguments),
            path=new Z.Path(),
            ps=opt.ps,
            cp=_getBetweenPoints(ps);
        if(opt.close) path.moveTo(cp[0].x,cp[0].y);
        else{
            path.moveTo(ps[0].x,ps[0].y);
            path.lineTo(cp[0].x,cp[0].y);}
        for(n=1;n<ps.length-1;n++)
            path.curveTo(ps[n].x,ps[n].y,cp[n].x,cp[n].y);
        p = ps[ps.length-1];
        if(!opt.close) path.lineTo(p.x,p.y);
        else{
            path.curveTo(ps[n].x,ps[n].y,cp[n].x,cp[n].y);
            path.curveTo(ps[0].x,ps[0].y,cp[0].x,cp[0].y);
        }
        return path;
    },
    drawArcLine:function(){
        var n,p,opt=this.getDrawOpt(arguments),
            path=new Z.Path(),
            ps=opt.ps,V=opt.val||10,
            cp=_getBetweenPoints(ps);
        if(opt.close) path.moveTo(cp[0].x,cp[0].y);
        else{
            path.moveTo(ps[0].x,ps[0].y);
            path.lineTo(cp[0].x,cp[0].y);}
        for(n=1;n<ps.length-1;n++)
            path.arcTo(ps[n].x,ps[n].y,cp[n].x,cp[n].y,V);
        p = ps[ps.length-1];
        if(!opt.close) path.lineTo(p.x,p.y);
        else{
            path.arcTo(ps[n].x,ps[n].y,cp[n].x,cp[n].y,V);
            path.arcTo(ps[0].x,ps[0].y,cp[0].x,cp[0].y,V);
            path.lineTo(cp[0].x,cp[0].y);
        }
        return path;
    },
    drawRoundLine:function(){
        var n,a,b,c,d,p,opt=this.getDrawOpt(arguments),
            ap,bp,dis,rad,
            path=new Z.Path(),
            ps=opt.ps,V=opt.val,len=ps.length-2,
            cp=_getBetweenPoints(ps),ap=[],bp=[];

        for(n=0;n<ps.length;n++){
            a = ps[n];
            b = ps[n+1];
            if(!b) b = ps[0];
            c = cp[n];
            dis = Math.min(V,a.distance(c));
            bp.push( ZF.Point.polar(dis,a.radian(c)).add(a) );
            dis = Math.min(V,b.distance(c));
            ap.push( ZF.Point.polar(dis,b.radian(c)).add(b) );
        }
        bp.push(bp.shift());
        if(!opt.close) path.moveTo(ps[0].x,ps[0].y);
        else{
            len++;
            p = bp[bp.length-1];
            path.moveTo(p.x,p.y);
        }
        for(n=0;n<len;n++){
            p = ps[n+1];
            if(!p)p = ps[0];
            a = ap[n];
            b = bp[n];
            path.lineTo(a.x,a.y);
            path.curveTo(p.x,p.y,b.x,b.y);
        }
        if(!opt.close) path.lineTo(ps[++n].x,ps[n].y);
        else{
            a = ap[n]; b = bp[n]; p = ps[0];
            path.lineTo(a.x,a.y);
            path.curveTo(p.x,p.y,b.x,b.y);
        }
        return path;
    },
    getDrawOpt:function(A){
        var n,p,arr=ZF.paramArray(A),z=[],
            o={close:false,ps:z,value:10};
        if(arr[0]=='close'){o.close=true;arr.shift();}
        else if(arr[0] instanceof Object ){
            p = arr[0];
            if(p.close) o.close=true;
            if(p.offset) o.offset = p.offset;
            if(p.point) arr = p.point;
            o.val = (p.value)?p.value:0;}
        if(arr.length==1&&Array.isArray(arr[0])) arr=arr[0];
        for(n=0;n<arr.length;n++){
            p = arr[n];
            if(p instanceof Z.Point) z.push(p.clone());
            else if(Array.isArray(p)) z.push(Z.Point.set(p));
            else z.push(Z.Point.set(p,arr[++n]))}
        if(o.offset){
            var x, y, n = z.length; 
            if(o.offset instanceof Z.Point){
                x = o.offset.x; y = o.offset.y;
            }else if( Array.isArray(o.offset)){
                x = o.offset[0], y = o.offset[1];
            }else n = 0;
            while(n--)z[n].offset(x,y);}
        if( o.close && z[0] && z[0].equals(z[z.length-1]) )
            z.pop();
        return o;
    }
})
;
var _PShape = new ZF.PathShape();
var _getBetweenPoints = function(ps){
        var n,re=[];
        for(n=1;n<ps.length;n++)
            re.push( Z.Point.interpolate(ps[n-1],ps[n],0.5));
        re.push(Z.Point.interpolate(ps[n-1],ps[0],0.5));
        return re;
    };
    
    
    
    
    
    
    
    
    
Z.interface('IBitmapDrawable');
Z.interface('IGraphicsData');
Z.interface('IGraphicsPath');
Z.interface('IGraphicsFill');
Z.interface('IGraphicsStroke');
    
    
    

Z.global().implements(Z.IBitmapDrawable).class(
    function BitmapData(width,height,transparent,fillColor){
        Z.init(this,null,{
            width:Number(width)||1,height:Number(height)||1,transparent:(transparent)?true:false,fillColor:Number(fillColor)||0xFFFFFFFF})})
.reads('width,height,transparent,fillColor')
.proto({
    applyFilter:function(source,rect,dest,filter){},
    clone:function(){},
    colorTransform:function(rect,colorTransform){},
    compare:function(other){},
    copyChannel:function(source,rect,dest,from,to){},
    //(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, alphaBitmapData:BitmapData = null, alphaPoint:Point = null, mergeAlpha:Boolean = false):void
    copyPixels:function(s,r,d,ab,ap,ma){},
    copyPixelToByteArray:function(rect,data){},
    //(source:IBitmapDrawable, matrix:Matrix = null, colorTransform:flash.geom:ColorTransform = null, blendMode:String = null, clipRect:Rectangle = null, smoothing:Boolean = false):void
    draw:function(s,m,ct,bm,cr,sm){},
    encode:function(rect,compressor,byteArray){},
    fillRect:function(rect,color){},
    floodFill:function(x,y,color){},
    //(sourceRect:Rectangle, filter:BitmapFilter):Rectangle
    generateFilterRect:function(source,filter){},
    //(mask:uint, color:uint, findColor:Boolean = true):Rectangle
    getColorBoundsRect:function(mask,color,findColor){},
    getPixel:function(x,y){},
    getPixel32:function(x,y){},
    getPixels:function(rect){},
    histogram:function(rect){},
    //(firstPoint:Point, firstAlphaThreshold:uint, secondObject:Object, secondBitmapDataPoint:Point = null, secondAlphaThreshold:uint = 1):Boolean
    hitTest:function(fp,fa,so,sb,sa){},
    lock:function(){},
    //(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, redMultiplier:uint, greenMultiplier:uint, blueMultiplier:uint, alphaMultiplier:uint):void
    merge:function(sb,sr,dp,rm,gm,bm,am){},
    //(randomSeed:int, low:uint = 0, high:uint = 255, channelOptions:uint = 7, grayScale:Boolean = false):void
    noise:function(rs,w,h,co,gs){},
    //(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, redArray:Array = null, greenArray:Array = null, blueArray:Array = null, alphaArray:Array = null):void
    paletteMap:function(sb,sr,dp,ra,ga,ba,aa){},
    //(baseX:Number, baseY:Number, numOctaves:uint, randomSeed:int, stitch:Boolean, fractalNoise:Boolean, channelOptions:uint = 7, grayScale:Boolean = false, offsets:Array = null):void
    perlinNoise:function(bx,by,no,rs,st,fn,co,gs,os){},
    //(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, randomSeed:int = 0, numPixels:int = 0, fillColor:uint = 0):int
    pixelDissolve:function(sb,sr,dp,rs,np,fc){},
    scroll:function(x,y){},
    setPixel:function(x,y,color){},
    setPixel32:function(x,y,color){},
    setPixels:function(rect,data){},
    //(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, operation:String, threshold:uint, color:uint = 0, mask:uint = 0xFFFFFFFF, copySource:Boolean = false):uint
    threshold:function(sb,sr,dp,op,th,cr,mk,cs){},
    unlock:function(rect){}
})
.override(function dispose(){
    this.super.dispose();
})
.static(CONST,{RED:1,GREEN:2,BLUE:4,ALPHA:8})
;
   
    
    
    
    

var GPW = {EVEN_ODD:'eventOdd',NON_ZERO:'nonZero'};
var GPC = {NO_OP:0,MOVE_TO:1,LINE_TO:2,CURVE_TO:3,WIDE_MOVE_TO:4,WIDE_LINE_TO:5,CUBIC_CURVE_TO:6};
var GRT = {LINEAR:'linear',RADIAL:'radial'};
    
Z.class('GraphicsPathWinding').static(CONST,GPW);
Z.class('GraphicsPathCommand').static(CONST,GPC);
Z.global().class('GradientType').static(CONST,GRT);
    
Z.implements(Z.IGraphicsData,Z.IGraphicsPath).class(
    function GraphicsPath(c,d,w){
        Z.init(this);
        switch(arguments.length){
            case 3:this.winding=w;
            case 2:this.data=d;
            case 1:this.commands=c;}})
.public('commands',[],Array)
.public('data',[],Array)
.public('winding','',String)
.proto({
    cubicCurveTo:function(ax,ay,bx,by,cx,cy){
        this.commands.push(GPC.CUBIC_CURVE_TO);
        this.data.push(ax,ay,bx,by,cx,cy);},
    curveTo:function(ax,ay,bx,by){
        this.commands.push(GPC.CURVE_TO);
        this.data.push(ax,ay,bx,by);},
    lineTo:function(x,y){
        this.commands.push(GPC.LINE_TO);
        this.data.push(x,y);},
    moveTo:function(x,y){
        this.commands.push(GPC.MOVE_TO);
        this.data.push(x,y);},
    wideLineTo:function(x,y){
        this.commands.push(GPC.WIDE_LINE_TO);
        this.data.push(x,y,x,y);},
    wideMoveTo:function(x,y){
        this.commands.push(GPC.WIDE_MOVE_TO);
        this.data.push(x,y,x,y);},
    clear:function(){
        this.commands.splice(0,this.commands.length);
        this.data.splice(0,this.data.length);}})
.static(CONST,GPC)
;
Z.implements(Z.IGraphicsData,Z.IGraphicsPath).class(
    function GraphicsTrianglePath(v,i,u,c){
        Z.init(this);
        if(v)this.vertices=v;
        if(i)this.indices=i;
        if(u)this.uvtData=u;
        if(c)this.culling=c;})
.public('culling','none',String)
.public('indices',[],Array)
.public('uvtData',[],Array)
.public('vertices',[],Array)
;
Z.implements(Z.IGraphicsData,Z.IGraphicsFill).class(
    function GraphicsBitmapFill(b,m,r,s){
        Z.init(this);
        if(b)this.bitmapData=b;
        if(m)this.matrix=m;
        if(r)this.repeat=r;
        if(s)this.smooth=s;})
.public('bitmapData',null,Z.BitmapData)
.public('matrix',null,Z.Matrix)
.public('repeat',true,Boolean)
.public('smooth',false,Boolean)
;   
Z.implements(Z.IGraphicsData,Z.IGraphicsFill).class(
    function GraphicsEndFill(){
        Z.init(this);})
;
Z.implements(Z.IGraphicsData,Z.IGraphicsFill).class(
    function GraphicsGradientFill(){
        Z.init(this);
    }
)
.public('alphas',[],Array)
.public('colors',[],Array)
.public('focalPointRatio',0,Number)
.public('interpolationMethod','rgb',String)
.public('matrix',null,Z.Matrix)
.public('ratios',[],Array)
.public('spreadMethod','pad',String)
.public('type','linear',String)
;
Z.implements(Z.IGraphicsData,Z.IGraphicsFill).class(
    function GraphicsSolidFill(c,a){
        Z.init(this);
        if(c)this.color=c;
        if(a)this.alpha=a;})
.public('alpha',1,Number)
.public('color',0,Number)
;
Z.implements(Z.IGraphicsData,Z.IGraphicsStroke).class(
    function GraphicsStroke(){
        Z.init(this);
    }
)
.public('caps','',String)
.public('fill',null,Z.IGraphicsFill)
.public('joints','',String)
.public('miterLimit',3,Number)
.public('pixelHinting',false,Boolean)
.public('scaleMode','normal',String)
.public('thickness',1,Number)
;
    
    
 
    
Z.class(
    function Graphics(){
        Z.init(this,null);
    }
)
.prop('_data',{value:[]})
.proto({
    beginBitmapFill:function(b,m,r,s){
        ZF.paramCheck([Z.BitmapData,Z.Matrix,Boolean,Boolean],1,null,this);
//        var E;if(E=ZF.paramError(
//            [Z.BitmapData,Z.Matrix,Boolean,Boolean],1))throw E[0](E[1]);
        this._data.push(new Z.GraphicsBitmapFill(b,m,r,s));
    },
    beginFill:function(c,a){
        ZF.paramCheck([Number],1,null,this);
        this._data.push(new Z.GraphicsSolidFill(c,a));
    },
    //(type:String, colors:Array, alphas:Array, ratios:Array, matrix:Matrix = null, spreadMethod:String = "pad", interpolationMethod:String = "rgb", focalPointRatio:Number = 0):void
    beginGradientFill:function(t,c,a,r,m,s,i,f){
        ZF.paramCheck([String,Array,Array,Array,
                       Z.Matrix,String,String,Number],4,null,this);
        this._data.push(new Z.GraphicsGradientFill(t,c,a,r,m,s,i,f));
    },
    clear:function(){
        var gd,n = this._data.length;
        while(n--){
            gd = this._data[n];
            if(gd.dispose) gd.dispose();
            this._data.splice(n,1);
        }
    },
    copyFrom:function(source){
        ZF.paramCheck([Z.Graphics],1,null,this);
        var n,d=source._data;
        for( n = 0; n < d.length; n++ ){
            console.log( d[n] );
        }
    },
    cubicCurveTo:function(ax,ay,bx,by,cx,cy){
        this.addData([PathType.BEZIER,ax,ay,bx,by,cx,cy]);
        return this;
    },
    drawCircle:function(x,y,radius){
        
    },
    drawEllipse:function(x,y,width,height){
        
    },
    drawGraphicsData:function(datas){
        
    },
    //drawPath(commands:Vector.<int>, data:Vector.<Number>, winding:String = "evenOdd"):void
    drawPath:function(cs,ds,wd){
        
    },
    //drawRect(x:Number, y:Number, width:Number, height:Number):void
    drawRect:function(x,y,w,h){
        
    },
    //drawRoundRect(x:Number, y:Number, width:Number, height:Number, ellipseWidth:Number, ellipseHeight:Number = NaN):void
    drawRoundRect:function(x,y,w,h,ew,eh){
        
    }
})
;
Z.Graphics.prototype.cubicCurveTo = Z.Path.prototype.bezierTo;
    
    
Z.extends(Z.EventDispatcher)
.class(
    function DisplayObject(){
        Z.init(this);
    }
)
;
Z.extends(Z.DisplayObject).class(
    function DisplayObjectContainer(){
        Z.init(this);
    }
);

Z.extends(Z.DisplayObject)
.class(
    function Shape(){
        Z.init(this);
    }
);
    
    
    
    
    
})();





ZF.Color.NameMap = {aliceblue:'#F0F8FF',antiquewhite:'#FAEBD7',aqua:'#00FFFF',aquamarine:'#7FFFD4',azure:'#F0FFFF',beige:'#F5F5DC',bisque:'#FFE4C4',black:'#000000',blanchedalmond:'#FFEBCD',blue:'#0000FF',blueviolet:'#8A2BE2',brown:'#A52A2A',burlywood:'#DEB887',cadetblue:'#5F9EA0',chartreuse:'#7FFF00',chocolate:'#D2691E',coral:'#FF7F50',cornflowerblue:'#6495ED',cornsilk:'#FFF8DC',crimson:'#DC143C',cyan:'#00FFFF',darkblue:'#00008B',darkcyan:'#008B8B',darkgoldenrod:'#B8860B',darkgray:'#A9A9A9',darkgrey:'#A9A9A9',darkgreen:'#006400',darkkhaki:'#BDB76B',darkmagenta:'#8B008B',darkolivegreen:'#556B2F',darkorange:'#FF8C00',darkorchid:'#9932CC',darkred:'#8B0000',darksalmon:'#E9967A',darkseagreen:'#8FBC8F',darkslateblue:'#483D8B',darkslategray:'#2F4F4F',darkslategrey:'#2F4F4F',darkturquoise:'#00CED1',darkviolet:'#9400D3',deeppink:'#FF1493',deepskyblue:'#00BFFF',dimgray:'#696969',dimgrey:'#696969',dodgerblue:'#1E90FF',firebrick:'#B22222',floralwhite:'#FFFAF0',forestgreen:'#228B22',fuchsia:'#FF00FF',gainsboro:'#DCDCDC',ghostwhite:'#F8F8FF',gold:'#FFD700',goldenrod:'#DAA520',gray:'#808080',grey:'#808080',green:'#008000',greenyellow:'#ADFF2F',honeydew:'#F0FFF0',hotpink:'#FF69B4',indianred:'#CD5C5C',indigo:'#4B0082',ivory:'#FFFFF0',khaki:'#F0E68C',lavender:'#E6E6FA',lavenderblush:'#FFF0F5',lawngreen:'#7CFC00',lemonchiffon:'#FFFACD',lightblue:'#ADD8E6',lightcoral:'#F08080',lightcyan:'#E0FFFF',lightgoldenrodyellow:'#FAFAD2',lightgray:'#D3D3D3',lightgrey:'#D3D3D3',lightgreen:'#90EE90',lightpink:'#FFB6C1',lightsalmon:'#FFA07A',lightseagreen:'#20B2AA',lightskyblue:'#87CEFA',lightslategray:'#778899',lightslategrey:'#778899',lightsteelblue:'#B0C4DE',lightyellow:'#FFFFE0',lime:'#00FF00',limegreen:'#32CD32',linen:'#FAF0E6',magenta:'#FF00FF',maroon:'#800000',mediumaquamarine:'#66CDAA',mediumblue:'#0000CD',mediumorchid:'#BA55D3',mediumpurple:'#9370DB',mediumseagreen:'#3CB371',mediumslateblue:'#7B68EE',mediumspringgreen:'#00FA9A',mediumturquoise:'#48D1CC',mediumvioletred:'#C71585',midnightblue:'#191970',mintcream:'#F5FFFA',mistyrose:'#FFE4E1',moccasin:'#FFE4B5',navajowhite:'#FFDEAD',navy:'#000080',oldlace:'#FDF5E6',olive:'#808000',olivedrab:'#6B8E23',orange:'#FFA500',orangered:'#FF4500',orchid:'#DA70D6',palegoldenrod:'#EEE8AA',palegreen:'#98FB98',paleturquoise:'#AFEEEE',palevioletred:'#DB7093',papayawhip:'#FFEFD5',peachpuff:'#FFDAB9',peru:'#CD853F',pink:'#FFC0CB',plum:'#DDA0DD',powderblue:'#B0E0E6',purple:'#800080',rebeccapurple:'#663399',red:'#FF0000',rosybrown:'#BC8F8F',royalblue:'#4169E1',saddlebrown:'#8B4513',salmon:'#FA8072',sandybrown:'#F4A460',seagreen:'#2E8B57',seashell:'#FFF5EE',sienna:'#A0522D',silver:'#C0C0C0',skyblue:'#87CEEB',slateblue:'#6A5ACD',slategray:'#708090',slategrey:'#708090',snow:'#FFFAFA',springgreen:'#00FF7F',steelblue:'#4682B4',tan:'#D2B48C',teal:'#008080',thistle:'#D8BFD8',tomato:'#FF6347',turquoise:'#40E0D0',violet:'#EE82EE',wheat:'#F5DEB3',white:'#FFFFFF',whitesmoke:'#F5F5F5',yellow:'#FFFF00',yellowgreen:'#9ACD32'};

