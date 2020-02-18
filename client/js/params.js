function Params(Observer){
	var params={};
	var duration=50;
	var true_data;
	var timeOutFunction =null;

	var paramsIdArr=["infectRate","recoverRate","sigma","initSusceptibleNum","initInfectedNum","initIncubatedNum","initRecoverNum"];

	for(var i=0;i<paramsIdArr.length;i++){
		$('#'+paramsIdArr[i]).slider({formatter: function (value) {return 'Current value: ' + value;  }})
		.on('change', function (e) {
			$("#cur_"+paramsIdArr[i]).text(parseFloat($('#'+paramsIdArr[i]).val()));
			window.clearTimeout(timeOutFunction);
			timeOutFunction = setTimeout(function () {
				params.getdata();
			},500);
		});
	}

	var modelUsed=parseInt(document.getElementById("modelUsed").value);

	// 获取模型图片高度最大值
	// 模型的结构的图示要占一个固定的空间
	$(document).ready(function () {
		var imgHeight=0;
		$(".modelImage").map(function(){
			console.log($(this).height());
			if($(this).height()>imgHeight){
				imgHeight=$(this).height();
			}
		})
		$(".modelImage").map(function(){$(this).height(imgHeight);})
		$("#left-top-div").height(imgHeight+173);

		// 隐藏除了默认模块之外的其他模块的图示
		$(".modelImage").hide();
		$("#modelImage"+modelUsed).show();
		$("#modelUsed").change(function(){
			var newtype=parseInt(document.getElementById("modelUsed").value);
			if(modelUsed!=newtype){
				modelUsed=newtype;
				$(".modelImage").hide();
				$("#modelImage"+modelUsed).show();
			}
		});

		$(".slider.slider-horizontal").width($("#left-top-div").width()-190)
	})

	params.getdata=function(){
		let obj = {};
		obj.type=parseInt(document.getElementById("modelUsed").value);
		let tmpparam={};
		for(var i=0;i<paramsIdArr.length;i++){
			tmpparam[paramsIdArr[i]]=parseFloat($('#'+paramsIdArr[i]).val())
		}
		tmpparam['duration']=duration;
		obj.params=JSON.stringify(tmpparam);
		console.log(obj);
		$.ajax({
			type: 'GET',
			url: 'SEIR',
			data: obj,
			dataType: 'json',
			success: function(model_data) {
				console.log(model_data);
				Observer.fireEvent("showResult",[true_data,model_data],params);
			},
			error: function(jqXHR) {
				console.log('post error!!', jqXHR);
			},
		});
	}

    params.onMessage = function(message, data, from){
		if(message=="update_data_range" && from!=params){
			console.log(data);
			// data.time 事件范围，从第几天到第几天，数据的第一天为0.
			// data.area 一个字典，表示各个省份是否被选中，选中为true， 不选中为false
			// data.new 每日新增的数组，从第0天到最后一天。
			// data.accu 每日的累加数组，从第0天到最后一天。
			duration=data.time["right"]-data.time["left"];
			true_data=data;

			console.log(data.diagnosed_accu[data.time.left]);
			console.log(data.dead_accu[data.time.left] + data.cure_accu[data.time.left]);
			$('#initInfectedNum').slider('setValue', data.diagnosed_accu[data.time.left]);
			$('#initRecoverNum').slider('setValue', data.dead_accu[data.time.left] + data.cure_accu[data.time.left]);


			params.getdata();
		}
	}

	Observer.addView(params);
	return params;
}


