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
	$('#incubateTime').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#sickTime').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#duration').slider({formatter: function (value) {return 'Current value: ' + value;  }})
	.on('change', function (e) {  
		params.getdata();
	});
	$('#peopleNum').slider({formatter: function (value) {return 'Current value: ' + value;  }})
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


	params.getdata=function(){
		let obj = {};
		obj.params=JSON.stringify({
			'infectRate':parseFloat($('#infectRate').val()),
			'recoverRate':parseFloat($('#recoverRate').val()),
			'incubateTime':parseInt($('#incubateTime').val()),
			'sickTime':parseInt($('#sickTime').val()),
			'duration':parseInt($('#duration').val()),
			'peopleNum':parseInt($('#peopleNum').val()),
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
				
			},
			error: function(jqXHR) {
				console.log('post error!!', jqXHR);
			},
		});
	}
	
	
    params.onMessage = function(message, data, from){
		if(message=="select_subgraph" && from!=params){
			//console.log(data);
			
		}
	}
	
	Observer.addView(params);
	return params;
}
	
	
