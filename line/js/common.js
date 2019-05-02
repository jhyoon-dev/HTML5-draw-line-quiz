var con_w = 1000; // 콘텐츠의 기준 가로 사이즈 (scale 조절에 쓰임)
var con_h = 660; // 콘텐츠의 기준 세로 사이즈 (scale 조절에 쓰임)
var con_scale = 1; // 콘텐츠의 scale

var start_x;
var start_y;
var end_x;
var end_y;
var mouse_x;
var mouse_y;
var eventObj;
var isDrawing = false;
var tCvs;
var tCtx;
var $start;
var correct = [1, 2, 3];
var CHANCE__ = 1;
var chance = CHANCE__;
var reverse = false;

$(document).ready(function(){
	$(window).resize(function(){
		response();
	});
	$(window).resize();

	loadSuccess();
});

function loadSuccess(){
	// 시작점과 끝점에 해당하는 각각의 캔버스 생성
	for(var i = 1; i <= $('.draw_start').length; i++){
		$('#draw_start' + i).attr('data-link', 'none');
		$('.line_area_wrap').append('<canvas id="line_area_start' + i + '" class="line_area start' + i + '" width="' + con_w + '" height="' + con_h + '"></canvas>');
	}

	for(var i = 1; i <= $('.draw_end').length; i++){
		$('#draw_end' + i).attr('data-link', 'none');
		$('.line_area_wrap').append('<canvas id="line_area_end' + i + '" class="line_area end' + i + '" width="' + con_w + '" height="' + con_h + '"></canvas>');
	}

	document.getElementById('content').addEventListener('mousemove', event_move, false);
	document.getElementById('content').addEventListener('mouseup', event_end, false);
	document.getElementById('content').addEventListener('touchmove', event_move, false);
	document.getElementById('content').addEventListener('touchend', event_end, false);

	// 클릭 시작 이벤트 지정
	for(var i = 1; i <= document.getElementsByClassName('draw_start').length; i++){
		var draw_start = document.getElementById('draw_start' + i);
		draw_start.addEventListener('mousedown', event_start_ds, false);
		draw_start.addEventListener('touchstart', event_start_ds, false);
	}
	for(var i = 1; i <= document.getElementsByClassName('draw_end').length; i++){
		var draw_start = document.getElementById('draw_end' + i);
		draw_start.addEventListener('mousedown', event_start_de, false);
		draw_start.addEventListener('touchstart', event_start_de, false);
	}

	// 정답 체크
	$('.popup_quiz_check').click(function(){
		var correctCnt = 0;
		for(var i = 1; i <= $('.draw_start').length; i++){
			var $draw_start = $('#draw_start' + i);
			if( $draw_start.attr('data-link') == correct[i - 1] ){
				correctCnt++;
			}
		}

		if(correctCnt == $('.draw_start').length){
			call_alert('correct');
			$(this).hide();
		}else if(chance != 0){
			chance--;
			call_alert('re');
		}else{
			call_alert('wrong');
			reset_quiz();
		}
	});
}

// 창 사이즈 조절 시 실행
function response(){
	var win_w = $(window).width();
	var win_h = $(window).height();
	if(win_w < con_w){
		con_scale = win_w/con_w;
	}else{
		con_scale = 1;
	}
	$('#content_wrap').css('transform', 'scale(' + con_scale + ')');
}

function setEventObj(e){
	if(e.changedTouches){ // 모바일 터치일 때
		eventObj = e.changedTouches[0];
	}else{ // PC 클릭일 때
		eventObj = e;
	}
}

// 선이 이어진 점은 색깔 변경
function drawActive(){
	for(var i = 1; i <= $('.draw_start').length; i++){
		var $tmp = $('#draw_start' + i);
		if($tmp.attr('data-link') != 'none'){
			$tmp.addClass('on');
			$('#draw_end' + $tmp.attr('data-link')).addClass('on');
		}else{
			$tmp.removeClass('on');
		}
	}

	for(var i = 1; i <= $('.draw_end').length; i++){
		var $tmp = $('#draw_end' + i);
		if($tmp.attr('data-link') != 'none'){
			$tmp.addClass('on');
			$('#draw_start' + $tmp.attr('data-link')).addClass('on');
		}else{
			$tmp.removeClass('on');
		}
	}
}

function event_start_ds(e){ // 좌측 점 클릭 시작
	reverse = false;
	var tNum;
	tNum = this.id.slice(-1);
	$start = $(this);
	if( $start.attr('data-link') != 'none' ){
		var rCvs = document.getElementById('line_area_end' + $start.attr('data-link'));
		var rCtx = rCvs.getContext('2d');
		rCtx.clearRect(0, 0, rCvs.width, rCvs.height);
		$('#draw_end' + $start.attr('data-link')).attr('data-link', 'none');
	}
	$start.attr('data-link', 'none');
	drawActive();

	tCvs = document.getElementById('line_area_start' + tNum);
	tCtx = tCvs.getContext('2d');
	setEventObj(e);
	start_x = px_to_num( $start.css('left') ) + $start[0].offsetWidth/2 ;
	start_y = px_to_num( $start.css('top') ) + $start[0].offsetHeight/2 ;

	isDrawing = true;
}

function event_start_de(e){ // 우측 점 클릭 시작
	reverse = true;
	var tNum = this.id.slice(-1);
	$start = $(this);
	if( $start.attr('data-link') != 'none' ){
		var rCvs = document.getElementById('line_area_start' + $start.attr('data-link'));
		var rCtx = rCvs.getContext('2d');
		rCtx.clearRect(0, 0, rCvs.width, rCvs.height);
		$('#draw_start' + $start.attr('data-link')).attr('data-link', 'none');
	}
	$start.attr('data-link', 'none');
	drawActive();

	tCvs = document.getElementById('line_area_end' + tNum);
	tCtx = tCvs.getContext('2d');
	setEventObj(e);
	start_x = px_to_num( $start.css('left') ) + $start[0].offsetWidth/2 ;
	start_y = px_to_num( $start.css('top') ) + $start[0].offsetHeight/2 ;

	isDrawing = true;
}

function event_move(e){ // 클릭 시작 후 움직임
	setEventObj(e);
	mouse_x = eventObj.pageX - ($(window).width() - $('#content').width())/2;
	mouse_y = eventObj.pageY - ($(window).height() - $('#content').height())/2;

	if(isDrawing){
		tCtx.clearRect(0, 0, tCvs.width, tCvs.height);
		end_x = canvasX(eventObj.pageX);
		end_y = canvasY(eventObj.pageY);

		tCtx.beginPath();
		tCtx.moveTo(start_x, start_y);
		tCtx.lineTo(end_x, end_y);
		tCtx.stroke();
	}
}

function event_end(){ // 클릭 끝
	var end_target;
	if(isDrawing){
		isDrawing = false;

		if(!reverse){ // 
			end_target = 'draw_end';
		}else{
			end_target = 'draw_start';
		}

		for(var i = 1; i <= $('.'+end_target+'').length; i++){
			var $end = $('#'+end_target+'' + i);
			var $end_x = px_to_num( $end.css('left') ) * con_scale;
			var $end_y = px_to_num( $end.css('top') ) * con_scale;
			var $end_width = $end.width();
			var $end_height = $end.height();

			if(mouse_x >= $end_x && mouse_x <= ($end_x + $end_width) && mouse_y >= $end_y && mouse_y <= ($end_y + $end_height) ){
				$start.attr('data-link', i);
				if($end.attr('data-link') != 'none'){
					if(!reverse){
						var rCvs1 = document.getElementById('line_area_start' + $end.attr('data-link'));
						var rCvs2 = document.getElementById('line_area_end' + $start.attr('data-link'));
						var rCtx1 = rCvs1.getContext('2d');
						var rCtx2 = rCvs2.getContext('2d');
						rCtx1.clearRect(0, 0, rCvs1.width, rCvs1.height);
						rCtx2.clearRect(0, 0, rCvs2.width, rCvs2.height);
						$('#draw_start' + $end.attr('data-link')).attr('data-link', 'none');
					}else{
						var rCvs1 = document.getElementById('line_area_end' + $end.attr('data-link'));
						var rCvs2 = document.getElementById('line_area_start' + $start.attr('data-link'));
						var rCtx1 = rCvs1.getContext('2d');
						var rCtx2 = rCvs2.getContext('2d');
						rCtx1.clearRect(0, 0, rCvs1.width, rCvs1.height);
						rCtx2.clearRect(0, 0, rCvs2.width, rCvs2.height);
						$('#draw_end' + $end.attr('data-link')).attr('data-link', 'none');
					}
				}
				$end.attr('data-link', $start.attr('id').slice(-1) );

				drawActive();
				tCtx.clearRect(0, 0, tCvs.width, tCvs.height);
				end_x = px_to_num( $end.css('left') ) + $end[0].offsetWidth/2 ;
				end_y = px_to_num( $end.css('top') ) + $end[0].offsetHeight/2 ;

				tCtx.beginPath();
				tCtx.moveTo(start_x, start_y);
				tCtx.lineTo(end_x, end_y);
				tCtx.stroke();
				return;
			}
		}
		$start.attr('data-link', 'none');
		drawActive();
		tCtx.clearRect(0, 0, tCvs.width, tCvs.height);
	}
}

function canvasX(clientX) {
	var bound = tCvs.getBoundingClientRect();
	var bw = 0;
	return (clientX - bound.left) * (tCvs.width / (bound.width));
}     

function canvasY(clientY) {
	var bound = tCvs.getBoundingClientRect();
	var bw = 0;
	return (clientY - bound.top) * (tCvs.height / (bound.height));
}

function reset_quiz(){
	chance = CHANCE__;

	for(var i = 1; i <= document.getElementsByClassName('draw_start').length; i++){
		tCvs = document.getElementById('line_area_start' + i);
		tCtx = tCvs.getContext('2d');
		tCtx.clearRect(0, 0, tCvs.width, tCvs.height);
	}

	for(var i = 1; i <= document.getElementsByClassName('draw_end').length; i++){
		tCvs = document.getElementById('line_area_end' + i);
		tCtx = tCvs.getContext('2d');
		tCtx.clearRect(0, 0, tCvs.width, tCvs.height);
	}

	$('.draw_start').attr('data-link', 'none');
	$('.draw_end').attr('data-link', 'none');
	drawActive();
}

// 정답, 오답, 다시풀기 팝업창 출력
function call_alert(str){
	$('#content').append('<div id="alert_wrap"></div>');
	if(str === 'correct'){
		$('#alert_wrap').append('<div id="alert_correct" class="alert_content"></div>');
	}else if(str === 'wrong'){
		$('#alert_wrap').append('<div id="alert_wrong" class="alert_content"></div>');
	}else if(str === 're'){
		$('#alert_wrap').append('<div id="alert_re" class="alert_content"></div>');
	}
	$('#alert_wrap').fadeIn(200);
	setTimeout(function(){
		$('#alert_wrap').fadeOut(200, function(){
			$('#alert_wrap').detach();
		});
	}, 1000);
}

// px 문자열 삽입
function num_to_px(num){
	return num + 'px';
}

// % 문자열 삽입
function num_to_percent(num){
	return num + '%';
}

// px 삭제하고 숫자로 변환
function px_to_num(px){
	return Number(px.toString().replace('px',''));
}
