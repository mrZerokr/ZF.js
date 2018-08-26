
/* - - - - - - - - - -
ZF.Canvas
*/
(function(){
    var Z=ZF,PT=PathType;
    Z.packages('zf.display.canvas');
    
    var CanvasManager = new (function(){
        var ct = document.createElement('canvas').getContext('2d');
        this.ratio = (window.devicePixelRatio || 1) /
            (ct.backingStorePixelRatio ||
             ct.webkitBackingStorePixelRatio ||
             ct.mozBackingStorePixelRatio ||
             ct.msBackingStorePixelRatio ||
             ct.oBackingStorePixelRatio ||
             ct.backingStorePixelRatio || 1);
        this.running = false;
        this.members = [];
        
        this.add = function(tg){
            this.members.push(tg);
            if( this.running ) tg.__init();
        }
        this.remove = function(tg){
            console.log('CanvasManager.remove');
            var n = this.members.length;
            while(n--){
                if(this.members[n]==tg)
                    this.members.splice(n,1);
            }
        }
        this.ready = function(){
            this.running = true;
            for( var n=0; n<this.members.length; n++ ){
                this.members[n].__init();
            }
        }
        window.addEventListener('load',this.ready.bind(this));
    })();
    
    
    Z.global()
    .extends(Z.EventDispatcher)
    .reads('status,painter,inited,ratio,canvas')
    .props('width,height')
    .static(function getRatio(){
        return CanvasManager.ratio;
    })
    .class(
        function Canvas( $w, $h, $r ){
            if(!$w)$w=400;
            if(!$h)$h=300;
            Z.init(this,null,{
                width:$w, height:$h,status:0,
                painter:null,canvas:document.createElement('canvas'),
                ratio:$r||CanvasManager.ratio
            });
            CanvasManager.add(this);
        }
    )
    .override(function dispose(){
        console.log('Canvas.dispose');
        delete this.__init;
        this.super.dispose();
    })
    .override(function getProp(p){
        switch(p){
            case'painter':return this.getPainter();
            default:return this.$$._get(p);
        }
    })
    .prop('__init',{
        configurable:true,
        value:function(){
            var vo = this.$$._vals();
            vo.status = 1;
            this.setSize( vo.width, vo.height );
            if(vo.target) this.setTarget( vo.target );
            if(vo.painter&&vo.painter.paths){
                var n,data = vo.painter.paths.concat();
                vo.painter.clearData();
                for(n=0;n<data.length;n++){
                    vo.painter.addData(data[n]);
                }
            }
            this.startup();
        }
    })
    .proto({
        startup:function(){
        },
        setSize:function(w,h){
            ZF.paramCheck(Number,2);
            var vo = this.$$._vals();
            vo.width = w; vo.height = h;
            vo.canvas.style.width = vo.width+'px';
            vo.canvas.style.height = vo.height+'px';
            vo.canvas.width = vo.width * vo.ratio;
            vo.canvas.height = vo.height * vo.ratio;
            vo.canvas.getContext('2d').scale( vo.ratio, vo.ratio );
        },
        setTarget:function($target){
            var vo = this.$$._vals();
            if(vo.status==0){
                vo.status = 1;
                vo.target = $target;
                return;
            }
            if(vo.canvas){
                vo.inited = false;
            }
            if(typeof($target)=='string')
                $target = document.querySelector($target);
            if( $target instanceof HTMLElement ){
                if( $target instanceof HTMLCanvasElement ){
                    vo.canvas = $target;
                    if(vo.painter)vo.painter.context=vo.canvas.getContext('2d');
                    this.setSize(vo.width,vo.height)
                }
                else{
                    $target.appendChild( vo.canvas );
                }
            }
            vo.inited = true;
            vo.status = 2;
            return this;
        },
        getPainter:function(){
            var vo = this.$$._vals();
            if(!vo.painter){
                var ct = vo.canvas.getContext('2d');
                vo.painter = new Z.CanvasPainter(ct)};
            return vo.painter;
        },
        getContext2D:function(){
            
        }
    })
    ;
    
    Z.global()
    .extends(Z.Path)
    .class(
        function CanvasPainter( $context, $cache ){
            var _context = null, _super, _cache = true;
            ZF.define(this,'context',{
                get:function(){return _context},
                set:function(v){_context=v}});
            ZF.define(this,'cache',{
                get:function(){return _cache},
                set:function(v){_cache=v}});
            ZF.define(this,'super',{
                get:function(){return _super}});
            _super = Z.init(this);
            if($context) _context = $context;
        }
    )
    .override(function addData(d){
//        console.log('CanvasPainter.addData',d);
        if(this.cache) this.super.addData(d);
        var f,z = this.context, d = d.concat(),v = d[1];
        if(!z)return;
        switch(d.shift()){
            case PT.MOVE:f=z.moveTo;break;
            case PT.LINE:f=z.lineTo;break;
            case PT.QUADRATIC:case PT.CURVE:
                f=z.quadraticCurveTo;break;
            case PT.BEZIER:f=z.bezierCurveTo;break;
            case PT.ARC:f=z.arc;break;
            case PT.ARC_TO:f=z.arcTo;break;
            case PT.ELLIPSE:f=z.ellipse;break;
            case PT.RECT:f=z.rect;break;
            case PT.BEGING_PATH:z.beginPath();break;
            case PT.CLOSE_PATH:z.closePath();break;
            case PT.CLEAR_RECT:f=z.clearRect;break;
            case PT.CLIP:z.clip();break;
            case PT.ROTATE:f=z.rotate;break;
            case PT.SCALE:f=z.scale;break;
            case PT.TRANSLATE:f=z.translate;break;
            case PT.TRANSFORM:f=z.transform;break;
            case PT.SET_TRANSFORM:f=z.setTransform;break;
            case PT.FILL:
                if(v instanceof Z.FillStyle)
                    v.setContext(z);
                z.fill();
                break;
            case PT.FILL_RECT:f=z.fillRect;break;
            case PT.FILL_STYLE:z.fillStyle=v;break;
            case PT.FILL_TEXT:f=z.fillText;break;
            case PT.STROKE:
                if(v instanceof Z.StrokeStyle)
                    v.setContext(z);
                z.stroke();
                break;
            case PT.STROKE_RECT:f=z.strokeRect;break;
            case PT.STROKE_STYLE:z.strokeStyle=v;break;
            case PT.STROKE_TEXT:f=z.strokeText;break;
            case PT.LINE_CAP:z.lineCap=v;break;
            case PT.LINE_DASH:f=z.setLineDash;break;
            case PT.LINE_DASH_OFFSET:z.lineDashOffset=v;break;
            case PT.LINE_JOIN:z.lineJoin=v;break;
            case PT.LINE_WIDTH:z.lineWidth=v;break;
            case PT.MITER_LIMIT:z.miterLimit=v;break;
            case PT.PUT_IMAGE_DATA:f=z.putImageData;break;
            case PT.DRAW_IMAGE:f=z.drawImage;break;
            case PT.FONT:z.font=v;break;
            case PT.TEXT_ALIGN:z.textAlign=v;break;
            case PT.TEXT_BASELINE:z.textBaseline=v;break;
            case PT.GLOBAL_ALPHA:z.globalAlpha=v;break;
            case PT.GLOBAL_COMPOSITE_OPERATION:z.globalCompositeOperation=v;break;
            case PT.SHADOW_BLUR:z.shadowBlur=v;break;
            case PT.SHADOW_COLOR:z.shadowColor=v;break;
            case PT.SHADOW_OFFSET_X:z.shadowOffsetX=v;break;
            case PT.SHADOW_OFFSET_Y:z.shadowOffsetY=v;break;
            case PT.FILTER:z.filter=v;break;
        }
        if(f) f.apply(z,d);
    })
    .proto({
        setContext:function($context){
            this.context = $context;
        },
        beginPath:function(){
            this.addData([PT.BEGING_PATH]);return this},
        closePath:function(){
            this.addData([PT.CLOSE_PATH]);return this},
        clearRect:function(x,y,w,h){
            this.addData([PT.CLEAR_RECT,x,y,w,h]);return this},
        clip:function(){
            this.addData([PT.CLIP]);return this},
        rotate:function(a){
            this.addData([PT.ROTATE,a]);return this},
        scale:function(x,y){
            this.addData([PT.SCALE,x,y]);return this},
        translate:function(x,y){
            this.addData([PT.TRANSLATE,x,y]);return this},
        transform:function(a,b,c,d,e,f){
            this.addData([PT.TRANSFORM,a,b,c,d,e,f]);return this},
        setTransform:function(a,b,c,d,e,f){
            this.addData([
                PT.SET_TRANSFORM,a,b,c,d,e,f]);return this},
        fill:function(p,r){
            var A=ZF.paramArray(arguments),
                D=[PT.FILL];
            if(A[0] instanceof Z.Path){
                this.beginPath();
                this.addPath(A.shift());}
            if(A.length)D.push(new ZF.FillStyle(A));
            this.addData(D);
            return this},
        fillRect:function(x,y,w,h){
            this.addData([PT.FILL_RECT,x,y,w,h]);return this},
        fillStyle:function(v){
            this.addData([PT.FILL_STYLE,v]);return this},
        stroke:function(p){
            var arg=ZF.paramArray(arguments),a=[PT.STROKE];
            if(arg[0] instanceof Z.Path){
                this.beginPath();
                this.addPath( arg.shift() );}
            if(arg.length)a.push(new ZF.StrokeStyle(arg));
            this.addData(a);return this},
        strokeRect:function(x,y,w,h){
            this.addData([PT.STROKE_RECT,x,y,w,h]);return this},
        strokeStyle:function(v){
            this.addData([PT.STROKE_STYLE,v]);return this},
        lineCap:function(v){
            this.addData([PT.LINE_CAP,v]);return this},
        setLineDash:function(a){
            this.addData([PT.LINE_DASH,a]);return this},
        lineDashOffset:function(v){
            this.addData([PT.LINE_DASH_OFFSET,v]);return this},
        lineJoin:function(v){
            this.addData([PT.LINE_JOIN,v]);return this},
        lineWidth:function(v){
            this.addData([PT.LINE_WIDTH,v]);return this},
        miterLimit:function(v){
            this.addData([PT.MITER_LIMIT,v]);return this},
        putImageData:function(a,b,c,d,e,f,g){
            this.addData([PT.PUT_IMAGE_DATA,a,b,c,d,e,f,g]);return this},
        drawImage:function(){
            var a = Array.apply(null,arguments);
            a.unshift(PT.DRAW_IMAGE);
            this.addData(a);return this},
        font:function(v){
            this.addData([PT.FONT,v]);return this},
        textAlign:function(v){
            this.addData([PT.TEXT_ALIGN,v]);return this},
        textBaseline:function(v){
            this.addData([PT.TEXT_BASELINE,v]);return this},
        globalAlpha:function(v){
            this.addData([PT.GLOBAL_ALPHA,v]);return this},
        globalCompositeOperation:function(v){
            this.addData([PT.GLOBAL_COMPOSITE_OPERATION,v]);return this},
        shadowBlur:function(v){
            this.addData([PT.SHADOW_BLUR,v]);return this},
        shadowColor:function(v){
            this.addData([PT.SHADOW_COLOR,v]);return this},
        shadowOffsetX:function(v){
            this.addData([PT.SHADOW_OFFSET_X,v]);return this},
        shadowOffsetY:function(v){
            this.addData([PT.SHADOW_OFFSET_Y,v]);return this},
        filter:function(v){
            this.addData([PT.FILTER,v]);return this},
        
        
        createLinearGradient:function(a,b,c,d){
            return this.context.createLinearGradient(a,b,c,d)},
        createPattern:function(a,b){
            return this.context.createPattern(a,b)},
        createRadialGradient:function(a,b,c,d,e,f){
            return this.context.createRadialGradient(a,b,c,d,e,f)},
        createImageData:function(w,h){
            return this.context.createImageData(w,h)},
        getImageData:function(x,y,w,h){
            return this.context.getImageData(x,y,w,h)},
        getLineDash:function(){
            return this.context.getLineDash()},
        measureText:function(v){
            return this.measureText(v)},
        
    })
    ;
    
})();

