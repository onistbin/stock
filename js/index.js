window.onload = function () {

	/*
		数据接口
	*/
	var url = 'http://img1.money.126.net/data/hs/time/today/0000001.json';


	/*
		画网格
   	*/
	Stock.drawGrid();


	/*
	    画昨日收盘基准线
	*/
	Stock.yestCloBaseLine();


	/*
		drawGraph()描点画曲线
	*/

	Data.handleData(url, Stock.drawGraph);


	/*
		轮询请求
	*/
	Data.handleData(url, Stock.pollRequest);
		

	/*
		绑定事件
	*/
	(function() {

		$("#inside").on('mouseover', function(ev) {

			ev.preventDefault();
			ConfigStyle.showXyShow();

		}).on('mousemove', function(ev) {

			ev.preventDefault();
			Data.handleData(url, Stock.getShow);

		}).on('mouseout', function(ev) {

			ev.preventDefault();
			ConfigStyle.hideXyShow();

		});



		/*
			设置横纵坐标
		*/
		ConfigStyle.setXy();

	}());


}


var Class = {

	createClass: function() {

		return function() {

			this.init.apply(this, arguments);
		}
	}
}

var Stock = (function () {

	/*
		绘制网格
	*/
	var drawGrid = function () {

		var canvasLine = document.getElementById('canvas-grid'),
			canvasLineWidth = canvasLine.offsetWidth,
			canvasLineHeight = canvasLine.offsetHeight,
			gridHeight = $(canvasLine).height() / 8,    //网格高度
			gridWidth = 61,		//网格宽度
			p = 0;

		/*
			画网格横线
		*/

		for( var i = 0, len = canvasLineHeight / gridHeight; i <= len; i++) {

			p = canvasLineHeight - i * gridHeight;

			var Hline = {
				startX: 0,
				startY: p,
				targetX: canvasLineWidth,
				targetY: p,
				canvasid: 'canvas-grid',
				color: '#ccc'
			};
			
			draw(Hline);
		}

		/*
			画网格竖线
		*/

		for( var i = 0, len = canvasLineWidth / gridWidth; i <= len; i++) {

			p =  i * gridWidth;

			var Sline = {
				startX: p,
				startY: 0,
				targetX: p,
				targetY: canvasLineHeight,
				canvasid: 'canvas-grid',
				color: '#ccc'
			};
			
			draw(Sline);
		}
	}

	/*
		绘制曲线
	*/

	function drawGraph(data) {

		var stockData = data.dataFormats;
		var gridHeight = $("#canvas-grid").height() / 8;
		var canvas = document.getElementById('canvas'),
			priceIncrene = document.getElementById('y-line'),
			priceIncre = priceIncrene.getElementsByTagName('li');


		//设置2px打一个点
		
		var num = 2; 

		//得到价格最大最小值
		
		var priceMin = getMinMax(stockData).min;      
		var priceMax = getMinMax(stockData).max;  


		//得到最大最小值与昨日收盘价格差的绝对值
		
		var currentAbs = getAbsMax(data.yestclose - priceMin, data.yestclose - priceMax);

		//计算格子表示的价格
		
		everyRange = currentAbs / 4;



		/*
			设置时间轴和当前价的位置
		*/

		var canvasHeight = $('#canvas').height(),
			yMarginTop = $('#canvas').height() - $("#y-line").height(),
			yMarginTop = $('#canvas').height() - $("#y-line").height();
			
		/*
			显示纵坐标数据
		*/


		for( var len = 4, i = len; i >= 0 ; i --) {

			priceIncre[i].innerHTML = (Number(data.yestclose) + Number(everyRange * (len - i))).toFixed(3);
		}

		for( var i = 5; i <= 8 ; i ++) {

			priceIncre[i].innerHTML = (Number(data.yestclose) - Number(everyRange * (i - 4))).toFixed(3);
		}

		/*
			坐标原点(stsrtX, startY);
			下一个坐标(x, y);
			画曲线
		*/

		var stsrtX = 0,
			startY = 0,  
			     x = 0, 
			     y = 0; 


		var countHtmlPoor = Number(priceIncre[0].innerHTML) - Number(priceIncre[8].innerHTML);

		var actuHeight =((stockData[0].current - Number(priceIncre[8].innerHTML)) * canvasHeight) / countHtmlPoor;

		startY = parseInt(canvasHeight - actuHeight);


		/*
			描点连线
		*/

		var countFrame = 0;
		var time = 6;
		var timer = setInterval(function() {

			if(yestCloBaseLine) {

				var increLen = (stockData[countFrame].current - priceMin) * gridHeight;

					x = countFrame * num;

					y = canvasHeight - ((stockData[countFrame].current - Number(priceIncre[8].innerHTML)) * canvasHeight) / countHtmlPoor;

				var Curves = {
					startX: stsrtX,
					startY: startY,
					targetX: x,
					targetY: y,
					canvasid: "canvas",
					color: "rgb(144, 209, 238)",
					fillRect: false,
					fillColor: "rgb(144, 209, 238)"
				};

				draw(Curves);


				if(countFrame >= stockData.length - 1) {
					var canvas = document.getElementById("canvas"),
					cxt = canvas.getContext('2d');

					clearInterval(timer);
				}
				else {

					countFrame++;

					/*
						鼠标移入到曲线上
					*/
					$("#inside").css({
						"width": x + 3,
						"height": $("canvas").height(),
						"left": $("#y-line li").width()
					});
				}


				stsrtX = x;
				startY = y;
				
			}

		}, time);
		
	}


	/*
		画昨日收盘基准线
	*/

	var yestCloBaseLine = function () {

		var baselineCountY = 0,
			baselineX = 0,
			flag = false;

		var timerBase = setInterval(function() {

			var option = {
				startX: 0,
				startY: $("#canvas").height() / 2,
				targetX: baselineX += 15,
				targetY: $("#canvas").height() / 2,
				canvasid: 'canvas',
				color: 'red',
				save: true
			};


			if( baselineX > $("#canvas").width()) {

				clearInterval(timerBase);
				flag = true;
				return flag;
			}
			
			draw(option);

		}, 10);

	}


	/*
		draw(画线方法)
	*/
	function draw(option) {

		var canvas = document.getElementById(option.canvasid),
			cxt = canvas.getContext('2d'),
			canvasHeight = $(canvas).height();

		cxt.beginPath();

			cxt.moveTo(option.startX, option.startY);
			cxt.lineTo(option.targetX, option.targetY);

			cxt.strokeStyle = option.color || '#000';
			cxt.lineWidth = option.lineWidth || 1;

			cxt.stroke();

			if(option.save){

				cxt.save();
			}
			if( option.fillRect ){

				cxt.fillStyle = option.fillColor;
				cxt.fillRect(option.startX, option.startY, 1, canvasHeight - option.startY);
			}
			
		cxt.closePath();
	}



	var getShow = function (data) {

		var stockData = data.dataFormats;

		/*
			鼠标移入跟随显示信息
		*/
		var dataLen = stockData.length;

		

		var moveTgt = new Move('xyshow', 'line');

			moveTgt.fnMove();
			moveTgt.fnRemove();
	   


	    var	xyShow = document.getElementById('xyshow'),
			showSpan = xyShow.getElementsByTagName('span');

	    var yestClosePrice = data.yestclose;

	    var priceChangeRatio = 0;
	    var priceAverage = 0;


	    var index = parseInt(($("#line").offset().left - $("#canvas").offset().left) / 2);


	    try {
	   
			priceAverage = index > 3 ? (stockData[index - 1].current + stockData[index - 2].current + stockData[index - 3].current) / 3 : stockData[index].current;
		
			priceChangeRatio = (((priceAverage - yestClosePrice) / yestClosePrice) * 100).toFixed(2);

			showSpan[0].innerHTML = stockData[index].volume;
			showSpan[1].innerHTML = priceChangeRatio + "%" ;
			showSpan[2].innerHTML = stockData[index].current;
			showSpan[3].innerHTML = stockData[index].time.substring(0, 2) + ':' + stockData[index].time.substring(2);  

	    } catch(err) {

	    	console.log("");
	   	}
	     	
	}


	/*
		得到两个数中绝对值较大的
	*/

	var getAbsMax = function (a, b) {

		var maxabs  = Math.abs(a) > Math.abs(b) ? Math.abs(a) : Math.abs(b);

		return maxabs;
	}



	/*
		得到数据中的最大值和最小值
	*/

	var getMinMax = function (data) {

		var dataArr = [];

		for( var i = 0; i < data.length; i ++) {

			dataArr[i] = data[i].current;
		}

		var min = Math.min.apply(Math, dataArr);      //价格最小值
		var max = Math.max.apply(Math, dataArr);      //价格最大值

		return{
			max: max,
			min: min
		}
	}


	/*
		轮询请求
	*/

	var pollRequest = function (data) {

		var url = 'http://img1.money.126.net/data/hs/time/today/0000001.json',
			stockData = data.dataFormats,
			dataLen = stockData.length,
			canvas = document.getElementById("canvas"),
			cxt = canvas.getContext('2d');


		var reloadTimer = setInterval(function() {

			if(dataLen > 0 && dataLen < data.dataLenMax) {

				cxt.clearRect(0, 0, $(canvas).width(), $(canvas).height());
				handleData(url, drawGraph);
				yestCloBaseLine();
			}
		
		}, 60000);
		
	}


	return {
		drawGrid: drawGrid,
		yestCloBaseLine: yestCloBaseLine,
		pollRequest: pollRequest,
		drawGraph: drawGraph,
		getShow: getShow
	}
})();



/*
	数据
*/


var Data = (function() {


	/*
		请求成功回调
	*/
	var handleData = function (url, callback) {

		$.ajax({
			url: url,
			dataType: "jsonp",
			sonp: "callback",
			success: function(res) {
	  			
				var data = dataFormats(res);

				if(callback){

					callback(data);

				}
			}
		});
	}

	/*
		数据格式化
	*/
	var dataFormats = function (res) {

		var dataFormats = [];

		for( var i = 0, len = res.data.length; i < len; i++) {
			dataFormats[i] = {

				time: res.data[i][0].toString(),     //时间
				volume: Number(res.data[i][3]),   //成交量
				current: Number(res.data[i][1]),  //当前价
			};
		}

		return {

			dataFormats: dataFormats,
			yestclose: Number(res.yestclose).toFixed(3),  //昨日闭市价格
			dataLenMax: 242
		}
	}

	return{

		handleData: handleData
	}

})();


var ConfigStyle = {

	/*
		设置横纵坐标
	*/
	setXy: function () {

		$("#x-line").css({
			"left": $("#y-line").width() - 20,
			"top": $("#canvas-grid").height() + 20
		});

		$("#y-line li").css({
			"height": $("#canvas-grid").height() / 8,
			"line-height": 0
		});

	},

	/*
		显示隐藏显示信息
	*/
	hideXyShow: function () {

		$("#line, #xyshow").hide();
	},

	showXyShow: function () {

		$("#line").css({
			"height": $("#canvas").height()
		}).show();
		$("#xyshow").show();
	},


	/*
		配置显示的横纵坐标大小,canvas容器的大小
	*/

	configXy: function () { 

		$("#canvas-con").css({
			"width": $("#canvas-grid").width(),
			"height": $("#canvas-grid").height()
		});
	}	
};


/*
	鼠标跟随显示数据
*/

var Move = Class.createClass();

Move.prototype = {

	init: function(idCon, idLine) {

		this.container = document.getElementById('container');
		this.moveTgt = document.getElementById(idCon);
		this.line = document.getElementById(idLine);
		this.canvas = document.getElementsByTagName('canvas')[0];
		this.disX = 0;
	},

    /*
        鼠标移入canvas，绑定事件	
    */
	fnMove: function(ev){

		var _this = this;

		var marginLeft = 50;

		document.onmousemove = function(ev) {

		/*
			设置显示坐标盒子的位置
		*/
			_this.moveTgt.style.left = ev.clientX - _this.disX - _this.container.offsetLeft + marginLeft + 'px';

		/*
			设置竖线的位置	
		*/
			_this.line.style.left = ev.clientX - _this.disX - _this.container.offsetLeft + 'px';

			_this.fnRemove();
		}
},

	/*
	        鼠标移出canvas，消除绑定事件	
	*/
	fnRemove: function() {

		var _this = this;

		this.canvas.onmouseout = function () {

			document.onmousemove = null;

			_this.moveTgt.style.display = 'none';
			_this.line.style.display = 'none';	
  
		}   
	}
}
