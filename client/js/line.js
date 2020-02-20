
function Line(Observer){
	var line={};

	var $brtDiv=$("#line-div");
    var width=$brtDiv.width();
    var height=$brtDiv.height();
	
	var padding={
		left: 50,
		right:50,
		top:30,
		bottom:30
	};
	var timeStart = 1578585600000;
	var lineType = "line_abs";
	var dataAll=[];
	var colorArr={"Susceptible":"#4095F7","Exposed":"#D7D599","Infectious":"#DE5E5B","Recovered":"#18BABD"};
	var keysMap={"Susceptible":"健康","Exposed":"潜伏","Infectious":"感染","Recovered":"治愈"};

	var svg=d3.select("#line-div")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

	$('input[name="line"]').change(function(){
		lineType=($(this).attr("id"));
		drawLines();
	});
	
	function drawLines(){
		svg.selectAll("g").remove();
		var true_data=dataAll[0];
		var model_data=dataAll[1];

		var keys=_.keys(model_data);
		if(keys.length==0){
			return;
		}
		var values=_.values(model_data);
		var maxnum=_.max(_.map(values, function(v){ return _.max(v); }));
		// 计算百分比数据
		//  比如某天疑似的百分比指的是 当天疑似的人数/（当天疑似+潜伏+感染+康复）
		if (lineType=="line_per"){
			maxnum=1;
			var lineNum=values.length;
			var dayNum=values[0].length;
			for(var i=0;i<dayNum;i++){
				var sumTmp=0;
				for(var j=0;j<lineNum;j++){
					sumTmp=sumTmp+values[j][i];
				}
				for(var j=0;j<lineNum;j++){
					values[j][i]=values[j][i]/sumTmp;
				}
			}
		}

		var x_scale = d3.scaleTime()
			.domain([new Date(timeStart + true_data["time"]["left"]*24*60*60*1000),new Date(timeStart + true_data["time"]["right"]*24*60*60*1000)])
			.range([padding.left,width-padding.right]);
		var y_scale = d3.scaleLinear().domain([0,maxnum]).range([height-padding.bottom, padding.top]);
		
		var lineCurve = d3.line()
			.curve(d3.curveBasis)
			.x(function(d,i) { return x_scale(new Date(timeStart + (true_data["time"]["left"]+i)*24*60*60*1000)); })
			.y(function(d) { return y_scale(d); });
		
		//var backg=svg.append("g").attr("class","backg");
		var rectg=svg.append("g").attr("class","rectg");
		var lineg=svg.append("g").attr("class","lineg")
			.selectAll("g")
			.data(values)
			.enter().append("g");
		
		lineg.append("path")
			.attr("class", "line")
			.attr("d", function(d) { return lineCurve(d); })
			.style("stroke", function(d,i){return colorArr[keys[i]];})
			.style("stroke-width", "2px")
			.style("fill","none");
		lineg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (height-padding.bottom) + ")")
			.call(d3.axisBottom(x_scale).ticks(5));
		
		var y_axis=d3.axisLeft(y_scale);
		if (lineType=="line_per"){
			y_axis.tickFormat(d3.format(".0%"));
		}
		lineg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (padding.left) + ",0)")
			.call(y_axis);	
		
		// 标签说明
		var legend = lineg.append("g").attr("class", "labeltext")
			.selectAll("g")
			.data(keys)
			.enter().append("g")
			.attr("transform", function(d, i) { return "translate("+(padding.left+50*i)+"," + (padding.top-20) + ")"; });
		legend.append("circle")
			.attr("cx", 0)
			.attr("cy", 10)
			.attr("r",5)
			.attr("fill",function(d,i){return colorArr[d];})
		legend.append("text")
			.attr("x", function(d,i){return 10;})
			.attr("y", 12.5)
			.text(function(d,i) {;return keysMap[d]; });
		
		// 打点
		for(var k=0;k<values.length;k++){
			svg.append("g").attr("class","circleg")
				.selectAll("circle")
				.data(values[k])
				.enter().append("circle")
				.attr("cx",function(d,i) { return x_scale(new Date(timeStart + (true_data["time"]["left"]+i)*24*60*60*1000)); })
				.attr("cy",function(d) { return y_scale(d); })
				.attr("r",2)
				.style("fill", colorArr[keys[k]]);
		}
		
		// 每天新增 柱状图
		var new_data=true_data["diagnosed_new"].slice(true_data["time"]["left"],true_data["time"]["right"]+1);
		console.log(new_data);
		var newmax=_.max(new_data);
		var y_new_scale = d3.scaleLinear().domain([0,newmax]).range([height-padding.bottom, padding.top]);
		var rectw=(width-padding.left-padding.right)/(true_data["time"]["right"]-true_data["time"]["left"]+1);
		rectg.selectAll("rect")
			.data(new_data)
			.enter().append("rect")
			.attr("fill","#eee")
			.attr("stroke","#ccc")
			.attr("stroke-width","1")
			.attr("x",function(d,i) { return padding.left+(width-padding.left-padding.right)/(true_data["time"]["right"]-true_data["time"]["left"]+1)*i;})
			.attr("y",function(d,i){return height-padding.bottom-(height-padding.top-padding.bottom)/newmax*d;})
			.attr("width",rectw)
			.attr("height",function(d,i){return (height-padding.top-padding.bottom)/newmax*d;});
		rectg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (width-padding.right) + ",0)")
			.call(d3.axisRight(y_new_scale));
		
		// 用于鼠标悬浮提示具体数据
		var backg=svg.append("g").attr("class","backg")
			.selectAll("rect")
			.data(new_data)
			.enter().append("rect")
			.attr("fill","black").attr("opacity",0)
			.attr("x",function(d,i) { return padding.left+(width-padding.left-padding.right)/(true_data["time"]["right"]-true_data["time"]["left"]+1)*i;})
			.attr("y",padding.top)
			.attr("width",rectw)
			.attr("height",height-padding.top-padding.bottom)
			.append("title").text(function(d,i){
				var date=new Date(timeStart + (true_data["time"]["left"]+i)*24*60*60*1000);
				var str="日期: "+(date.getMonth()+1)+"月"+(date.getDate())+"日 \r";
				for(var j=0;j<keys.length;j++){
					str=str+keysMap[keys[j]]+": "+Math.round(values[j][i])+" \r";
				}
				str=str+"新增确诊: "+d;
				return str;
			});
	}
			
    line.onMessage = function(message, data, from){
		if(message=="showResult"){
			dataAll=data;
			drawLines();
		}
		
	}
	
	
	Observer.addView(line);
	return line;
}
	
	
