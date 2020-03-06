var all_models = {};
var model_num = 0;
var has_saved = false; //记录current_model是否保存
var current_model = 0;
var current_index = 0;
var current_arr = new Array();
var model_arr = new Array();
var all_useful_model = new Array();

function Params(Observer){
	var params={};
	var duration=50;
	var true_data;
	var timeOutFunction =null;
	var total_num = 0;
	var Sus_E = 0;
	var total_per = 0;
	var Sus_I = 0;

	var paramsIdArr=["infectRate","recoverRate","gamma_1", "gamma_2", "sigma", "delta", "delta_1", "delta_2", "mu", "initSusceptibleNum","initInfectedNum","initIncubatedNum","initRecoverNum", "initConfirmNum", "initDeadNum"];

	for(var i = 0; i < paramsIdArr.length; i++){
		$('#' + paramsIdArr[i]).slider({formatter: function (value) {return 'Current value: ' + value;  }})
		.on('change', function (e) {
			// window.clearTimeout(timeOutFunction);
			// timeOutFunction = setTimeout(function () {
			// 	params.getdata();
			// },500)
			change_param(1, e.target.id);
		});
		$('#cur_' + paramsIdArr[i]).on("input propertychange", function(e){
			change_param(0, e.target.name);
		});
	}

	function fix_4(a){
		return Math.floor(a * 10000) / 10000;
	}

	function toPercent(point){
		var str = Number(point*100).toFixed(2);
		str += "%";
		return str;
	}

	function removeByValue(arr, val) {
 		for(var i = 0; i < arr.length; i++){
			if(arr[i] == val) {
		    	arr.splice(i, 1);
		    	break;
		    }
		}
		return arr;
	}

	function change_param(type, data){
		var modelUsed=parseInt(document.getElementById("modelUsed").value);
		if(type == 1){
			// for(var i=0;i<paramsIdArr.length;i++){
			// 	$("#cur_"+paramsIdArr[i]).val(parseFloat($('#'+paramsIdArr[i]).val()));
			// 	// $("#cur_"+paramsIdArr[i]).text(parseFloat($('#'+paramsIdArr[i]).val()));
			// }
			if(modelUsed == 1){
				if(data == "initSusceptibleNum"){
					let t_per = fix_4(parseFloat($('#'+data).val())/total_num);
					$("#cur_"+data).val(toPercent(t_per));
					$("#initIncubatedNum").slider('setValue', Sus_E - parseFloat($('#'+data).val()));
					$("#cur_initIncubatedNum").val(toPercent(total_per - t_per));
				}
				else if(data == "initIncubatedNum"){
					let t_per = fix_4(parseFloat($('#'+data).val())/total_num);
					$("#cur_"+data).val(toPercent(t_per));
					$("#initSusceptibleNum").slider('setValue', Sus_E - parseFloat($('#'+data).val()));
					$("#cur_initSusceptibleNum").val(toPercent(total_per - t_per));
				}
				else{
					$("#cur_"+data).val(parseFloat($('#'+data).val()));
				}
			}
			else if(modelUsed == 2){
				if(data == "initSusceptibleNum"){
					let t_per = fix_4(parseFloat($('#'+data).val())/total_num);
					$("#cur_"+data).val(toPercent(t_per));
					$("#initInfectedNum").slider('setValue', Sus_I - parseFloat($('#'+data).val()));
					$("#cur_initInfectedNum").val(toPercent(total_per - t_per));
				}
				else if(data == "initInfectedNum"){
					let t_per = fix_4(parseFloat($('#'+data).val())/total_num);
					$("#cur_"+data).val(toPercent(t_per));
					$("#initSusceptibleNum").slider('setValue', Sus_E - parseFloat($('#'+data).val()));
					$("#cur_initSusceptibleNum").val(toPercent(total_per - t_per));
				}
				else{
					$("#cur_"+data).val(parseFloat($('#'+data).val()));
				}
			}
			else{
				if(data == "initSusceptibleNum"){
					let t_per = fix_4(parseFloat($('#'+data).val())/total_num);
					$("#cur_"+data).val(toPercent(t_per));
				}
				else{
					$("#cur_"+data).val(parseFloat($('#'+data).val()));
				}
			}
		}
		else if(type == 0){
			if(modelUsed == 1){
				if(data == "initSusceptibleNum"){
					var s_per = parseFloat($('#cur_' + data).val().slice(0, -1)) / 100;
					var s = Math.floor(s_per * total_num);
					$("#" + data).slider('setValue', s);
					$("#initIncubatedNum").slider('setValue', Sus_E - s);
					$("#cur_initIncubatedNum").val(toPercent(total_per - s_per));
				}
				else if(data == "initIncubatedNum"){
					var e_per = parseFloat($('#cur_' + data).val().slice(0, -1)) / 100;
					var e = Math.floor(e_per * total_num);
					$("#" + data).slider('setValue', e);
					$("#initSusceptibleNum").slider('setValue', Sus_E - e);
					$("#cur_initSusceptibleNum").val(toPercent(total_per - e_per));
				}
				else{
					$("#" + data).slider('setValue', $('#cur_' + data).val());
				}
			}
			else if(modelUsed == 2){
				if(data == "initSusceptibleNum"){
					var s_per = parseFloat($('#cur_' + data).val().slice(0, -1)) / 100;
					var s = Math.floor(s_per * total_num);
					$("#" + data).slider('setValue', s);
					$("#initInfectedNum").slider('setValue', Sus_I - s);
					$("#cur_initInfectedNum").val(toPercent(total_per - s_per));
				}
				else if(data == "initInfectedNum"){
					var i_per = parseFloat($('#cur_' + data).val().slice(0, -1)) / 100;
					var i = Math.floor(i_per * total_num);
					$("#" + data).slider('setValue', i);
					$("#initSusceptibleNum").slider('setValue', Sus_I - i);
					$("#cur_initSusceptibleNum").val(toPercent(total_per - i_per));
				}
				else{
					$("#" + data).slider('setValue', $('#cur_' + data).val());
				}
			}
			else{
				if(data == "initSusceptibleNum"){
					var s_per = parseFloat($('#cur_' + data).val().slice(0, -1)) / 100;
					var s = Math.floor(s_per * total_num);
					$("#" + data).slider('setValue', s);
				}
				else{
					$("#" + data).slider('setValue', $('#cur_' + data).val());
				}
			}
		}

		all_models["model" + current_model].saved = false;
		all_models["model" + current_model].model_type = parseInt(document.getElementById("modelUsed").value);
		let params = {};
		for(var i = 0; i < paramsIdArr.length; i++){
			params[paramsIdArr[i]] = parseFloat($('#' + paramsIdArr[i]).val())
		}
		all_models["model" + current_model].tmp_parameter = params;

		if((("model" + current_model) == model1.type) || (("model" + current_model) == model2.type)){
			params.getdata([model1.type, model2.type]);
		}
	}

	var modelUsed=parseInt(document.getElementById("modelUsed").value);

	function show_params(t){
		if(t==0){
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
			// $("#middle-top-div").height(imgHeight+200);
		}
		else if(t == 1){
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
			// $("#middle-top-div").height(imgHeight+243);
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
			$("#text_initInfectedNum").html("&nbsp; &nbsp; 初始潜伏比例 I<sub>0</sub>:");
			$("#text_initRecoverNum").html("&nbsp; &nbsp; 初始治愈数 R<sub>0</sub>:");
			// $("#middle-top-div").height(imgHeight+330);
		}
	}

	// 获取模型图片高度最大值
	// 模型的结构的图示要占一个固定的空间
	$(document).ready(function () {
		$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
		var imgHeight=0;
		$(".modelImage").map(function(){
			if($(this).height()>imgHeight){
				imgHeight=$(this).height();
			}
		})
		$(".modelImage").map(function(){$(this).height(imgHeight + 20);})
		// $("#middle-top-div").height(imgHeight+243);

		// 隐藏除了默认模块之外的其他模块的图示
		$(".modelImage").hide();
		$("#modelImage"+modelUsed).show();
		$("#modelUsed").change(function(){
			let event_name = "update_data_range";
	
			var newtype=parseInt(document.getElementById("modelUsed").value);
			all_models["model" + current_model].saved = false;
			all_models["model" + current_model].model_type = parseInt(document.getElementById("modelUsed").value);
			let params = {};
			for(var i = 0; i < paramsIdArr.length; i++){
				params[paramsIdArr[i]] = parseFloat($('#' + paramsIdArr[i]).val())
			}
			all_models["model" + current_model].tmp_parameter = params;
			// Observer.fireEvent(event_name, newtype, params);

			if(modelUsed!=newtype){
				modelUsed=newtype;
				$(".modelImage").hide();
				$("#modelImage"+modelUsed).show();
				show_params(newtype);
			}
		});
		$(".slider.slider-horizontal").width($("#middle-top-div").width()-250)

		// 设置点击事件
		$("#pre_model").click(function(event){
			if(has_saved == false){
				alert("模型未保存！");
			}
			else{
				var first_index = all_useful_model.indexOf(model_arr[0]);
				if(first_index > 0){
					if(model_arr.length == 4){
						model_arr = model_arr.slice(0, model_arr.length - 1);
						model_arr.splice(0, 0, all_useful_model[first_index - 1]);
						current_arr = [1, 2, 3, 4];
					}
					else{
						model_arr.splice(0, 0, all_useful_model[first_index - 1]);
						current_arr = new Array();
						for(var i = 1; i <= model_arr.length; i++){
							current_arr.push(i);
						}
					}
					for(var i = 0; i < model_arr.length; i++){
						$("#row1_col" + (i + 1)).empty();
						$("#row1_col" + (i + 1)).html("<div class='modelSave'><button class='model_btn' name='" + model_arr[i] + "'  id='modelSave" + model_arr[i] + "'><i class='iconfont model_icon'>&#xe636;</i></button></div>")
						$("#text" + (i + 1)).text("模型" + model_arr[i]);
						$("#row1_col" + (i + 1)).css("background-color", "#fff");
						$("#row2_col" + (i + 1)).css("background-color", "#fff");
						$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
						all_models["model" + model_arr[i]].current_index = i + 1;
						document.getElementById("modelSave" + model_arr[i]).onclick=function(){
							operate_model(Number(this.name));
						}
					}
				}
			}
		});
		$("#later_model").click(function(event){
			if(has_saved == false){
				alert("模型未保存！");
			}
			else{
				if(model_arr.length == 4){
					var last_index = all_useful_model.indexOf(model_arr[3]);
					if(last_index < all_useful_model.length - 1){
						model_arr = model_arr.slice(1, model_arr.length);
						model_arr.push(all_useful_model[last_index + 1]);
						current_arr = [1, 2, 3, 4];
					}
					for(var i = 0; i < model_arr.length; i++){
						$("#row1_col" + (i + 1)).empty();
						$("#row1_col" + (i + 1)).html("<div class='modelSave'><button class='model_btn' name='" + model_arr[i] + "'  id='modelSave" + model_arr[i] + "'><i class='iconfont model_icon'>&#xe636;</i></button></div>")
						$("#text" + (i + 1)).text("模型" + model_arr[i]);
						$("#row1_col" + (i + 1)).css("background-color", "#fff");
						$("#row2_col" + (i + 1)).css("background-color", "#fff");
						$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
						all_models["model" + model_arr[i]].current_index = i + 1;
						document.getElementById("modelSave" + model_arr[i]).onclick=function(){
							operate_model(Number(this.name));
						}
					}
				}
			}
		});
		$("#add_model").click(function(event){
			Observer.fireEvent("add_model", 0, params);
		});
		$("#Save").click(function(event){
			has_saved = true;
			all_models["model" + current_model].saved = true;
			all_models["model" + current_model].model_type = parseInt(document.getElementById("modelUsed").value);
			let params = {};
			for(var i = 0; i < paramsIdArr.length; i++){
				params[paramsIdArr[i]] = parseFloat($('#' + paramsIdArr[i]).val())
			}
			all_models["model" + current_model].parameters = params;
			all_models["model" + current_model].tmp_parameter = params;
		});
		$("#Cancel").click(function(event){
			if(has_saved == false){
				alert("模型未保存！");
			}
			else{
				$("#parameters_table").hide();
				$("#op_button").css("opacity", "0");
			}
		});
		$("#Delete").click(function(event){
			if(has_saved == false){
				alert("模型未保存！");
			}
			else{
				all_useful_model = removeByValue(all_useful_model, current_model);
				var c_model = all_models["model" + current_model];
				all_models["model" + current_model].Deleted = true;
				model_arr = model_arr.slice(0, c_model.current_index - 1);
				$("#row1_col" + c_model.current_index).empty();
				$("#text" + c_model.current_index).text("");
				$("#row1_col" + c_model.current_index).css("background-color", "#fff");
				$("#row2_col" + c_model.current_index).css("background-color", "#fff");

				$("#row1_col" + current_arr[current_arr.length - 1]).empty();
				$("#text" + current_arr[current_arr.length - 1]).text("");
				$("#row1_col" + current_arr[current_arr.length - 1]).css("background-color", "#fff");
				$("#row2_col" + current_arr[current_arr.length - 1]).css("background-color", "#fff");

				var next_model = c_model.No + 1;
				for(var i = c_model.current_index; i <= 4; i++){
					if(next_model <= model_num){
						for(var j = next_model; j <= model_num; j++){
							var model_j = all_models["model" + j];
							if(model_j.Deleted == false){
								$("#row1_col" + i).empty();
								$("#row1_col" + i).html("<div class='modelSave''><button class='model_btn' name='" + j + "'  id='modelSave" + j + "'><i class='iconfont model_icon'>&#xe636;</i></button></div>")
								$("#text" + i).text("模型" + j);
								$("#row1_col" + i).css("background-color", "#fff");
								$("#row2_col" + i).css("background-color", "#fff");
								$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
								document.getElementById("modelSave" + j).onclick=function(){
									operate_model(Number(this.name));
								}
								all_models["model" + j].current_index = i;
								next_model = j + 1;
								model_arr.push(j);
								break;
							}
						}
					}
				}
				current_index = 0;
				current_model = 0;
				current_arr = current_arr.slice(0, current_arr.length - 1);
				Observer.fireEvent("delete_model", 0, params);
			}
		});
	});

	params.getdata=function(model_name_list){
		let objs = {data: []};
		for (let model_name of model_name_list){
			if (model_name !== 'empty' && model_name !== 'true_data'){
				let used_model = all_models['model' + model_name];
				console.log('used model', used_model)
				let obj = {};
				obj.type = used_model.model_type;
				obj.params = used_model.parameters;
				obj.params.duration = duration;
				objs.data.push(obj);
			}
		}
		console.log('model name list', model_name_list);
		console.log('objs', objs);
		// let obj = {};
		// obj.type=parseInt(document.getElementById("modelUsed").value);
		// let tmpparam={};
		// var modelUsed=parseInt(document.getElementById("modelUsed").value);
		// for(var i=0;i<paramsIdArr.length;i++){
		// 	tmpparam[paramsIdArr[i]]=parseFloat($('#'+paramsIdArr[i]).val())
		// }
		// tmpparam['duration']=duration;
		// obj.params=JSON.stringify(tmpparam);
		objs.data = JSON.stringify(objs.data);
		$.ajax({
			type: 'GET',
			url: 'SEIR',
			data: objs,
			dataType: 'json',
			success: function(model_data) {
				let data = {data: [], time_range: true_data.time, area: true_data.area};
				let idx = 0;
				for (i = 0; i < 2; ++i){
					if (model_name_list[i] === 'empty'){
						data.data.push([]);
					}
					else if (model_name_list[i] === 'true_data'){
						data.data.push(true_data);
					}
					else{
						data.data.push(model_data[idx]);
						++idx;
					}
				}
				Observer.fireEvent("showResult",data,params);
			},
			error: function(jqXHR) {
				let data = {data: [], time_range: true_data.time, area: true_data.area};
				let idx = 0;
				for (i = 0; i < 2; ++i){
					if (model_name_list[i] === 'empty'){
						data.data.push([]);
					}
					else if (model_name_list[i] === 'true_data'){
						data.data.push(true_data);
					}
					else{
						data.data.push([]);
					}
				}
				Observer.fireEvent("showResult",data,params);
				console.log('post error!!', jqXHR);
			},
		});
	};

	function operate_model(m){
		if((has_saved == false) && (current_model != m)){
			alert("模型未保存！");
		}
		else{
			var model_m = all_models["model" + m];
			var model_index = model_m.current_index;
			if(current_index != model_index){
				$("#row1_col" + model_index).css("background-color", "#F5F5F5");
				$("#row2_col" + model_index).css("background-color", "#F5F5F5");
				$("#row1_col" + current_index).css("background-color", "#fff");
				$("#row2_col" + current_index).css("background-color", "#fff");
				current_model = m;
				current_index = model_index;
			}
			else{
				$("#row1_col" + model_index).css("background-color", "#F5F5F5");
				$("#row2_col" + model_index).css("background-color", "#F5F5F5");
			}
			// current_index = 
			$("#modelUsed").val(model_m.model_type);
			$(".modelImage").hide();
			$("#modelImage" + model_m.model_type).show();

			for(var i = 0; i < paramsIdArr.length; i++){
				$('#' + paramsIdArr[i]).slider('setValue', model_m.parameters[paramsIdArr[i]]);
				if((paramsIdArr[i] == "initSusceptibleNum") || (paramsIdArr[i] == "initIncubatedNum")){
					let t_per = fix_4(parseFloat($('#' + paramsIdArr[i]).val())/total_num);
					$("#cur_" + paramsIdArr[i]).val(toPercent(t_per));
				}
				else if((model_m.model_type == 2) && (paramsIdArr[i] == "initInfectedNum")){
					let t_per = fix_4(parseFloat($('#' + paramsIdArr[i]).val())/total_num);
					$("#cur_" + paramsIdArr[i]).val(toPercent(t_per));
				}
				else{
					$("#cur_" + paramsIdArr[i]).val($('#' + paramsIdArr[i]).val());
				}
			}
			$("#parameters_table").show();
			$("#op_button").css("opacity", "1");
			show_params(Number(model_m.model_type));
		}
	}

    params.onMessage = function(message, data, from){
		// if(message=="update_data_range" && from!=params){
		if(message==="update_data_range"){
			if(from !== params){
				// data.time 事件范围，从第几天到第几天，数据的第一天为0.
				// data.area 一个字典，表示各个省份是否被选中，选中为true， 不选中为false
				// data.new 每日新增的数组，从第0天到最后一天。
				// data.accu 每日的累加数组，从第0天到最后一天。
				duration=data.true_data.time["right"]-data.true_data.time["left"];
				true_data=data.true_data;
				console.log('true data', true_data)
			}
			else{
				console.log("change_model");
			}
			var area_choose = true_data.area;
			console.log('area choose', true_data.area)
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
					total_num = province_population["全国"];
					var t = total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val());
					total_per = fix_4(t / total_num);
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - $('#initInfectedNum').val() - $('#initRecoverNum').val());
					$("#cur_initSusceptibleNum").val(toPercent(total_per));
				}
				else{
					if(area_choose["其它"]){
						total_num = 1427975900 - 59170000;
					}
					else{
						total_num = 0;
						for(var j = 0; j < true_area.length; j++){
							total_num += province_population[true_area[j]];
						}
					}
					var t = total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val());
					total_per = fix_4(t / total_num);
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - $('#initInfectedNum').val() - $('#initRecoverNum').val());
					$("#cur_initSusceptibleNum").val(toPercent(total_per));
				}
			}
			else if(model_type == 1){
				$('#initIncubatedNum').slider('setValue', 0);
				$("#cur_initIncubatedNum").val(toPercent(parseFloat($('#initIncubatedNum').val())));
				// $("#cur_initIncubatedNumm").text(parseFloat($('#initIncubatedNum').val()));
				$('#initInfectedNum').slider('setValue', true_data.diagnosed_accu[true_data.time.left]);
				$("#cur_initInfectedNum").val(parseFloat($('#initInfectedNum').val()));
				$('#initRecoverNum').slider('setValue', true_data.dead_accu[true_data.time.left] + true_data.cure_accu[true_data.time.left]);
				$("#cur_initRecoverNum").val(parseFloat($('#initRecoverNum').val()));
				
				if(area_choose["全国"]){
					total_num = province_population["全国"];
					var t = total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val());
					total_per = fix_4(t / total_num);
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initIncubatedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val()) - parseFloat($('#initIncubatedNum').val()));
					$("#cur_initSusceptibleNum").val(toPercent(total_per));
				}
				else{
					if(area_choose["其它"]){
						total_num = 1427975900 - 59170000;
					}
					else{
						total_num = 0;
						for(var j = 0; j < true_area.length; j++){
							total_num += province_population[true_area[j]];
						}
					}
					var t = total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val());
					total_per = fix_4(t / total_num);
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initIncubatedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val()) - parseFloat($('#initIncubatedNum').val()));
					$("#cur_initSusceptibleNum").val(toPercent(total_per));
				}
				Sus_E = total_num - parseFloat($('#initInfectedNum').val()) - parseFloat($('#initRecoverNum').val());
			}
			else{
				$('#initInfectedNum').slider('setValue', 0);
				$("#cur_initInfectedNum").val(toPercent(parseFloat($('#initInfectedNum').val())));
				$('#initRecoverNum').slider('setValue', true_data.cure_accu[true_data.time.left]);
				$("#cur_initRecoverNum").val(parseFloat($('#initRecoverNum').val()));
				$('#initConfirmNum').slider('setValue', true_data.diagnosed_accu[true_data.time.left]);
				$("#cur_initConfirmNum").val(parseFloat($('#initConfirmNum').val()));
				$('#initDeadNum').slider('setValue', true_data.dead_accu[true_data.time.left]);
				$("#cur_initDeadNum").val(parseFloat($('#initDeadNum').val()));

				if(area_choose["全国"]){
					total_num = province_population["全国"];
					var t = total_num - parseFloat($('#initRecoverNum').val()) - parseFloat($('#initConfirmNum').val()) - parseFloat($('#initDeadNum').val());
					total_per = fix_4(t / total_num);
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initInfectedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - $('#initConfirmNum').val() - $('#initInfectedNum').val() - $('#initRecoverNum').val() - $('#initDeadNum').val());
					$("#cur_initSusceptibleNum").val(toPercent(total_per));
				}
				else{
					if(area_choose["其它"]){
						total_num = 1427975900 - 59170000;
					}
					else{
						total_num = 0;
						for(var j = 0; j < true_area.length; j++){
							total_num += province_population[true_area[j]];
						}
					}
					var t = total_num - parseFloat($('#initRecoverNum').val()) - parseFloat($('#initConfirmNum').val()) - parseFloat($('#initDeadNum').val());
					total_per = fix_4(t / total_num);
					$('#initSusceptibleNum').slider({
						max: t
					});
					$('#initInfectedNum').slider({
						max: t
					});
					$('#initSusceptibleNum').slider('setValue', total_num - $('#initConfirmNum').val() - $('#initInfectedNum').val() - $('#initRecoverNum').val() - $('#initDeadNum').val());
					$("#cur_initSusceptibleNum").val(toPercent(total_per));
				}
				Sus_I = parseFloat($('#initSusceptibleNum').val()) + parseFloat($('#initInfectedNum').val());
			}
			params.getdata(data.model_names);
		}
		if(message==="add_model"){
			if(from === params){
				var modelUsed=parseInt(document.getElementById("modelUsed").value);
				$("#parameters_table").show();
				$("#op_button").css("opacity", "1");
				all_useful_model.push(model_num + 1);

				// 显示新建模型
				if(model_num === 0){
					model_num += 1;
					current_model = model_num;
					current_index = model_num;
					current_arr = [1];
					model_arr = [1];
					$("#row1_col1").empty();
					$("#row1_col1").html("<div class='modelSave'><button class='model_btn' name='" + model_num + "' id='modelSave" + model_num + "'><i class='iconfont model_icon'>&#xe636;</i></button></div>")
					$("#text1").text("模型" + model_num);
					$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
					$("#row1_col1").css("background-color", "#F5F5F5");
					$("#row2_col1").css("background-color", "#F5F5F5");
					all_models["model" + model_num] = {"saved": false, "No": model_num, "Deleted": false, "current_index": model_num};
					all_models["model" + model_num].model_type = parseInt(document.getElementById("modelUsed").value);
					let params = {};
					for(var i = 0; i < paramsIdArr.length; i++){
						params[paramsIdArr[i]] = parseFloat($('#' + paramsIdArr[i]).val())
					}
					all_models["model" + model_num].tmp_parameter = params;
					document.getElementById("modelSave1").onclick=function(){
						operate_model(Number(this.name));
					}
				}
				else{
					if(has_saved){
						model_num += 1;
						current_model = model_num;
						if(current_arr.length == 0){
							current_index = 1;
							current_arr = [1];
							model_arr = [model_num];
							$("#row1_col1").empty();
							$("#row1_col1").html("<div class='modelSave''><button class='model_btn' name='" + model_num + "'  id='modelSave" + model_num + "'><i class='iconfont model_icon'>&#xe636;</i></button></div>")
							$("#text1").text("模型" + model_num);
							$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
							all_models["model" + model_num] = {"saved": false, "No": model_num, "Deleted": false, "current_index": 1};
							$("#row1_col1").css("background-color", "#F5F5F5");
							$("#row2_col1").css("background-color", "#F5F5F5");

							document.getElementById("modelSave" + model_num).onclick=function(){
								operate_model(Number(this.name));
							}
						}
						else if(current_arr.length == 4){
							current_index = 4;
							current_arr = [1, 2, 3, 4];
							model_arr = all_useful_model.slice(all_useful_model.length - 4, all_useful_model.length);

							all_models["model" + model_num] = {"saved": false, "No": model_num, "Deleted": false, "current_index": 4};
							for(var i = 0; i < 4; i++){
								$("#row1_col" + (i + 1)).empty();
								$("#row1_col" + (i + 1)).html("<div class='modelSave'><button class='model_btn' name='" + model_arr[i] + "'  id='modelSave" + model_arr[i] + "'><i class='iconfont model_icon'>&#xe636;</i></button></div>")
								$("#text" + (i + 1)).text("模型" + model_arr[i]);
								$("#row1_col" + (i + 1)).css("background-color", "#fff");
								$("#row2_col" + (i + 1)).css("background-color", "#fff");
								$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
								all_models["model" + model_arr[i]].current_index = i + 1;
								document.getElementById("modelSave" + model_arr[i]).onclick=function(){
									operate_model(Number(this.name));
								}
							}
							$("#row1_col4").css("background-color", "#F5F5F5");
							$("#row2_col4").css("background-color", "#F5F5F5");
						}
						else{
							current_index = current_arr.length + 1;
							current_arr.push(current_index);
							model_arr = all_useful_model.slice(all_useful_model.length - current_arr.length, all_useful_model.length);

							for(var i = 0; i < current_arr.length; i++){
								$("#row1_col" + (i + 1)).css("background-color", "#fff");
								$("#row2_col" + (i + 1)).css("background-color", "#fff");
							}

							$("#row1_col" + current_index).empty();
							$("#row1_col" +  + current_index).html("<div class='modelSave''><button class='model_btn' name='" + model_num + "'  id='modelSave" + model_num + "'><i class='iconfont model_icon'>&#xe636;</i></button></div>")
							$("#text" +  + current_index).text("模型" + model_num);
							$(".model_icon").css("font-size", ($("#middle-top-div").height())/2 + "px");
							all_models["model" + model_num] = {"saved": false, "No": model_num, "Deleted": false, "current_index": current_index};
							$("#row1_col" + current_index).css("background-color", "#F5F5F5");
							$("#row2_col" + current_index).css("background-color", "#F5F5F5");

							document.getElementById("modelSave" + model_num).onclick=function(){
								operate_model(Number(this.name));
							}
						}
						has_saved = false;
						all_models["model" + model_num].model_type = parseInt(document.getElementById("modelUsed").value);
						let params = {};
						for(var i = 0; i < paramsIdArr.length; i++){
							params[paramsIdArr[i]] = parseFloat($('#' + paramsIdArr[i]).val())
						}
						all_models["model" + model_num].tmp_parameter = params;
					}
					else{
						alert("模型未保存！");
					}
				}
			}
		}
	};

	Observer.addView(params);
	return params;
}


