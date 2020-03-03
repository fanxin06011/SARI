function Params(Observer){
	var params={};
	var duration=50;
	var true_data;
	var timeOutFunction =null;
	var Sus_E = 0;
	var Sus_I = 0;

	var paramsIdArr=["infectRate","recoverRate","gamma_1", "gamma_2", "sigma", "delta", "delta_1", "delta_2", "mu", "initSusceptibleNum","initInfectedNum","initIncubatedNum","initRecoverNum", "initConfirmNum", "initDeadNum"];

	for(var i=0;i<paramsIdArr.length;i++){
		$('#'+paramsIdArr[i]).slider({formatter: function (value) {return 'Current value: ' + value;  }})
		.on('change', function (e) {
			// window.clearTimeout(timeOutFunction);
			// timeOutFunction = setTimeout(function () {
			// 	params.getdata();
			// },500)
			change_param(1, e.target.id);
		});
		$('#cur_'+paramsIdArr[i]).on("input propertychange", function(e){
			change_param(0, e.target.name);
		});
	}

	function change_param(type, data){
		var modelUsed=parseInt(document.getElementById("modelUsed").value);
		if(type == 1){
			// for(var i=0;i<paramsIdArr.length;i++){
			// 	$("#cur_"+paramsIdArr[i]).val(parseFloat($('#'+paramsIdArr[i]).val()));
			// 	// $("#cur_"+paramsIdArr[i]).text(parseFloat($('#'+paramsIdArr[i]).val()));
			// }
			$("#cur_"+data).val(parseFloat($('#'+data).val()));
			if(modelUsed == 1){
				if(data == "initSusceptibleNum"){
					$("#initIncubatedNum").slider('setValue', Sus_E - parseFloat($('#'+data).val()));
					$("#cur_initIncubatedNum").val(Sus_E - parseFloat($('#'+data).val()));
				}
				if(data == "initIncubatedNum"){
					$("#initSusceptibleNum").slider('setValue', Sus_E - parseFloat($('#'+data).val()));
					$("#cur_initSusceptibleNum").val(Sus_E - parseFloat($('#'+data).val()));
				}
			}
			else if(modelUsed == 2){
				if(data == "initSusceptibleNum"){
					$("#initInfectedNum").slider('setValue', Sus_I - parseFloat($('#'+data).val()));
					$("#cur_initInfectedNum").val(Sus_I - parseFloat($('#'+data).val()));
				}
				if(data == "initInfectedNum"){
					$("#initSusceptibleNum").slider('setValue', Sus_I - parseFloat($('#'+data).val()));
					$("#cur_initSusceptibleNum").val(Sus_I - parseFloat($('#'+data).val()));
				}
			}
		}
		else if(type == 0){
			$("#" + data).slider('setValue', $('#cur_' + data).val());
			if(modelUsed == 1){
				if(data == "initSusceptibleNum"){
					$("#initIncubatedNum").slider('setValue', Sus_E - $('#cur_' + data).val());
					$("#cur_initIncubatedNum").val(Sus_E - $('#cur_' + data).val());
				}
				if(data == "initIncubatedNum"){
					$("#initSusceptibleNum").slider('setValue', Sus_E - $('#cur_' + data).val());
					$("#cur_initSusceptibleNum").val(Sus_E - $('#cur_' + data).val());
				}
			}
			else if(modelUsed == 2){
				if(data == "initSusceptibleNum"){
					$("#initInfectedNum").slider('setValue', Sus_I - $('#cur_' + data).val());
					$("#cur_initInfectedNum").val(Sus_I - $('#cur_' + data).val());
				}
				if(data == "initInfectedNum"){
					$("#initSusceptibleNum").slider('setValue', Sus_I - $('#cur_' + data).val());
					$("#cur_initSusceptibleNum").val(Sus_I - $('#cur_' + data).val());
				}
			}
		}
		params.getdata();
	}

	var modelUsed=parseInt(document.getElementById("modelUsed").value);

	// 获取模型图片高度最大值
	// 模型的结构的图示要占一个固定的空间
	$(document).ready(function () {
		var imgHeight=0;
		$(".modelImage").map(function(){
			if($(this).height()>imgHeight){
				imgHeight=$(this).height();
			}
		})
		$(".modelImage").map(function(){$(this).height(imgHeight + 20);})
		// $("#left-top-div").height(imgHeight+243);

		// 隐藏除了默认模块之外的其他模块的图示
		$(".modelImage").hide();
		$("#modelImage"+modelUsed).show();
		$("#modelUsed").change(function(){
			let event_name = "update_data_range";
	
			var newtype=parseInt(document.getElementById("modelUsed").value);
			Observer.fireEvent(event_name, newtype, params);

			if(modelUsed!=newtype){
				modelUsed=newtype;
				$(".modelImage").hide();
				$("#modelImage"+modelUsed).show();
				if(newtype==0){
					$("#tr_sigma").hide();
					$("#tr_recoverRate").show();
					$("#tr_gamma_1").hide();
					$("#tr_gamma_2").hide();
					$("#tr_delta").hide();
					$("#tr_delta_1").hide();
					$("#tr_delta_2").hide();
					$("#tr_mu").hide();
					$("#tr_initIncubatedNum").hide();
					$("#tr_initConfirmNum").hide();
					$("#tr_initDeadNum").hide();
					$("#text_initInfectedNum").html("&nbsp; &nbsp; 初始确诊数 I<sub>0</sub>:");
					$("#text_initRecoverNum").html("&nbsp; &nbsp; 初始恢复数 R<sub>0</sub>:");
					// $("#left-top-div").height(imgHeight+200);
				}
				else if(newtype == 1){
					$("#tr_sigma").show();
					$("#tr_recoverRate").show();
					$("#tr_delta").hide();
					$("#tr_gamma_1").hide();
					$("#tr_gamma_2").hide();
					$("#tr_delta_1").hide();
					$("#tr_delta_2").hide();
					$("#tr_mu").hide();
					$("#tr_initIncubatedNum").show();
					$("#tr_initConfirmNum").hide();
					$("#tr_initDeadNum").hide();
					$("#text_initInfectedNum").html("&nbsp; &nbsp; 初始确诊数 I<sub>0</sub>:");
					$("#text_initRecoverNum").html("&nbsp; &nbsp; 初始恢复数 R<sub>0</sub>:");
					// $("#left-top-div").height(imgHeight+243);
				}
				else{
					$("#tr_sigma").show();
					$("#tr_delta").hide();
					$("#tr_recoverRate").hide();
					$("#tr_mu").show();
					$("#tr_gamma_1").show();
					$("#tr_gamma_2").show();
					$("#tr_delta_1").show();
					$("#tr_delta_2").show();
					$("#tr_initIncubatedNum").hide();
					$("#tr_initConfirmNum").show();
					$("#tr_initDeadNum").show();
					$("#text_initInfectedNum").html("&nbsp; &nbsp; 初始潜伏数 I<sub>0</sub>:");
					$("#text_initRecoverNum").html("&nbsp; &nbsp; 初始治愈数 R<sub>0</sub>:");
					// $("#left-top-div").height(imgHeight+330);
				}
			}
		});
		$(".slider.slider-horizontal").width($("#left-top-div").width()-220)
	});

	params.getdata=function(){
		let obj = {};
		obj.type=parseInt(document.getElementById("modelUsed").value);
		let tmpparam={};
		for(var i=0;i<paramsIdArr.length;i++){
			tmpparam[paramsIdArr[i]]=parseFloat($('#'+paramsIdArr[i]).val())
		}
		tmpparam['duration']=duration;
		obj.params=JSON.stringify(tmpparam);
		$.ajax({
			type: 'GET',
			url: 'SEIR',
			data: obj,
			dataType: 'json',
			success: function(model_data) {
				Observer.fireEvent("showResult",[true_data,model_data],params);
			},
			error: function(jqXHR) {
				Observer.fireEvent('showResult', [true_data, []], params);
				console.log('post error!!', jqXHR);
			},
		});
	};

    params.onMessage = function(message, data, from){
		// if(message=="update_data_range" && from!=params){
		if(message==="update_data_range"){
			if(from !== params){
				// data.time 事件范围，从第几天到第几天，数据的第一天为0.
				// data.area 一个字典，表示各个省份是否被选中，选中为true， 不选中为false
				// data.new 每日新增的数组，从第0天到最后一天。
				// data.accu 每日的累加数组，从第0天到最后一天。
				duration=data.time["right"]-data.time["left"];
				true_data=data;
			}
			else{
				console.log("change_model");
			}
			var area_choose = true_data.area;
			var areas = Object.keys(area_choose);
			var true_area = new Array();
			for(var i = 0; i < areas.length; i++){
				if(area_choose[areas[i]]){
					true_area.push(areas[i]);
				}
			}
			
			var model_type = parseInt(document.getElementById("modelUsed").value);
			if(model_type == 0){
				$('#initInfectedNum').slider('setValue', true_data.diagnosed_accu[true_data.time.left]);
				$("#cur_initInfectedNum").val(parseFloat($('#initInfectedNum').val()));
				$('#initRecoverNum').slider('setValue', true_data.dead_accu[true_data.time.left] + true_data.cure_accu[true_data.time.left]);
				$("#cur_initRecoverNum").val(parseFloat($('#initRecoverNum').val()));

				if(area_choose["全国"]){
					$('#initSusceptibleNum').slider({
						max: province_population["全国"]
					});
					$('#initSusceptibleNum').slider('setValue', province_population["全国"] - $('#initInfectedNum').val() - $('#initRecoverNum').val());
					$("#cur_initSusceptibleNum").val(parseFloat($('#initSusceptibleNum').val()));
				}
				else{
					var total_num = 0;
					if(area_choose["其它"]){
						total_num = 1427975900 - 59170000;
					}
					else{
						for(var j = 0; j < true_area.length; j++){
							total_num += province_population[true_area[j]];
						}
					}
					$('#initSusceptibleNum').slider({
						max: total_num
					});
					$('#initSusceptibleNum').slider('setValue', total_num - $('#initInfectedNum').val() - $('#initRecoverNum').val());
					$("#cur_initSusceptibleNum").val(parseFloat($('#initSusceptibleNum').val()));
				}
			}
			else if(model_type == 1){
				$('#initIncubatedNum').slider('setValue', 0);
				$("#cur_initIncubatedNumm").val(parseFloat($('#initIncubatedNum').val()));
				// $("#cur_initIncubatedNumm").text(parseFloat($('#initIncubatedNum').val()));
				$('#initInfectedNum').slider('setValue', true_data.diagnosed_accu[true_data.time.left]);
				$("#cur_initInfectedNum").val(parseFloat($('#initInfectedNum').val()));
				$('#initRecoverNum').slider('setValue', true_data.dead_accu[true_data.time.left] + true_data.cure_accu[true_data.time.left]);
				$("#cur_initRecoverNum").val(parseFloat($('#initRecoverNum').val()));

				if(area_choose["全国"]){
					var t = province_population["全国"] - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val());
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initIncubatedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', province_population["全国"] - $('#initIncubatedNum').val() - $('#initInfectedNum').val() - $('#initRecoverNum').val());
					$("#cur_initSusceptibleNum").val(parseFloat($('#initSusceptibleNum').val()));
				}
				else{
					var total_num = 0;
					if(area_choose["其它"]){
						total_num = 1427975900 - 59170000;
					}
					else{
						for(var j = 0; j < true_area.length; j++){
							total_num += province_population[true_area[j]];
						}
					}
					var t = total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val());
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initIncubatedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - $('#initIncubatedNum').val() - $('#initInfectedNum').val() - $('#initRecoverNum').val());
					$("#cur_initSusceptibleNum").val(parseFloat($('#initSusceptibleNum').val()));
				}
				Sus_E = parseFloat($('#initSusceptibleNum').val()) + parseFloat($('#initIncubatedNum').val());
			}
			else{
				$('#initInfectedNum').slider('setValue', 0);
				$("#cur_initInfectedNum").val(parseFloat($('#initInfectedNum').val()));
				$('#initRecoverNum').slider('setValue', true_data.cure_accu[true_data.time.left]);
				$("#cur_initRecoverNum").val(parseFloat($('#initRecoverNum').val()));
				$('#initConfirmNum').slider('setValue', true_data.diagnosed_accu[true_data.time.left]);
				$("#cur_initConfirmNum").val(parseFloat($('#initConfirmNum').val()));
				$('#initDeadNum').slider('setValue', true_data.dead_accu[true_data.time.left]);
				$("#cur_initDeadNum").val(parseFloat($('#initDeadNum').val()));

				if(area_choose["全国"]){
					var t = province_population["全国"] - parseFloat($('#initRecoverNum').val()) - parseFloat($('#initConfirmNum').val()) - parseFloat($('#initDeadNum').val());
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initInfectedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', province_population["全国"] - $('#initConfirmNum').val() - $('#initInfectedNum').val() - $('#initRecoverNum').val() - $('#initDeadNum').val());
					$("#cur_initSusceptibleNum").val(parseFloat($('#initSusceptibleNum').val()));
				}
				else{
					var total_num = 0;
					if(area_choose["其它"]){
						total_num = 1427975900 - 59170000;
					}
					else{
						for(var j = 0; j < true_area.length; j++){
							total_num += province_population[true_area[j]];
						}
					}
					var t = total_num - parseFloat($('#initRecoverNum').val()) - parseFloat($('#initConfirmNum').val()) - parseFloat($('#initDeadNum').val());
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initInfectedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - $('#initConfirmNum').val() - $('#initInfectedNum').val() - $('#initRecoverNum').val() - $('#initDeadNum').val());
					$("#cur_initSusceptibleNum").val(parseFloat($('#initSusceptibleNum').val()));
				}
				Sus_I = parseFloat($('#initSusceptibleNum').val()) + parseFloat($('#initInfectedNum').val());
			}

			params.getdata();
		}
	}

	Observer.addView(params);
	return params;
}


