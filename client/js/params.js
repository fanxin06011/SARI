function Params(Observer){
	var params={};

	

	$('#infectRate').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#recoverRate').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#sigma').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#initSusceptibleNum').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#initInfectedNum').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		initInfectedNum=e.value.newValue;
		params.getdata();
	});
	$('#initIncubatedNum').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#initRecoverNum').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});

	var modelUsed=parseInt(document.getElementById("modelUsed").value);
	console.log("newtype "+modelUsed);
	$(".modelImage").hide();
	$("#modelImage"+modelUsed).show();
	$("#modelUsed").change(function(){
		var newtype=parseInt(document.getElementById("modelUsed").value);
		console.log("aaa "+newtype);
		if(modelUsed!=newtype){
			modelUsed=newtype;
			console.log("newtype "+modelUsed);
			$(".modelImage").hide();
			$("#modelImage"+modelUsed).show();
		}
	});

	params.getdata=function(){
		let obj = {};
		obj.type=parseInt(document.getElementById("modelUsed").value);
		obj.params=JSON.stringify({
			'infectRate':parseFloat($('#infectRate').val()),
			'recoverRate':parseFloat($('#recoverRate').val()),
			'sigma':parseFloat($('#sigma').val()),
			'initSusceptibleNum':parseInt($('#initSusceptibleNum').val()),
			'initInfectedNum':parseInt($('#initInfectedNum').val()),
			'initIncubatedNum':parseInt($('#initIncubatedNum').val()),
			'initRecoverNum':parseInt($('#initRecoverNum').val())
		});
		console.log(obj);
		$.ajax({
			type: 'GET',
			url: 'SEIR',
			data: obj,
			dataType: 'json',
			success: function(evt_data) {
				console.log(evt_data);
				Observer.fireEvent("showResult",evt_data,params);
			},
			error: function(jqXHR) {
				console.log('post error!!', jqXHR);
			},
		});
	}
	params.getdata();
	
    params.onMessage = function(message, data, from){
		if(message=="select_subgraph" && from!=params){
			//console.log(data);
			
		}
		if(message=="update_data_range" && from!=params){
			console.log(data);
			// data.time 事件范围，从第几天到第几天，数据的第一天为0.
			// data.area 一个字典，表示各个省份是否被选中，选中为true， 不选中为false
			// data.new 每日新增的数组，从第0天到最后一天。
			// data.accu 每日的累加数组，从第0天到最后一天。

		}
	}
	
	Observer.addView(params);
	return params;
}
	
	
