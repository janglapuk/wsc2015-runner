$(function() {

	// ============================================================ //
	var timerMoveRunner, timerScroll;

	// posisi scrollbar
	var runnerPos = 0;

	// posisi akan mendaki
	var startInclinePos = 4650;
	var endInclinePos = 4860;


	// urutan sprite runner
	//runnerFrame = 0;

	// default runway
	// 0 = bawah
	// 1 = tengah
	// 2 = atas
	var runwayPos = 1;

	// keyboard constants
	var KEYBOARD_UP 	= 38;
	var KEYBOARD_DOWN 	= 40;
	var KEYBOARD_SPACE 	= 32;

	// indikator jika sedang melompat
	var isJump = false;

	// atur posisi scroll ke default
	window.scrollTo(0, 0);

	// gambar awal runner
	//$('#runner img').attr('src', '../runner/running2_Flamme.png');

	$('#runner img').remove();
	$('#runner').attr('class', 'runner-ready');

	// ============================================================ //
	function scrollPage(val) {
		if(runnerPos > 100)
			window.scrollBy(val, 0);
	}

	function moveRunner(val) {
		runnerPos += val;

		$('#runner').css('left', runnerPos);

		console.log(runnerPos);

		// jika mendekati tanjakan
		if(runnerPos > startInclinePos && runnerPos < endInclinePos) {
			var currentBottom = parseInt($('#runner').css('bottom'));
			var penambah = (runnerPos - startInclinePos) / 30;
			var kenaikan = currentBottom + penambah;

			$('#runner').css('bottom', kenaikan + 'px');
		}

		if(runnerPos > 5100) {
			clearInterval(timerScroll);
			clearInterval(timerMoveRunner);
			$('#runner').attr('class', 'runner-ready');
		}
	}

	/*
	function animateRunner(isJump) {
		if(runnerFrame <= 4)
			runnerFrame -= 1;
		
		else if(runnerFrame == 1)
			runnerFrame += 1;

		$('#runner img').attr('src', '../runner/runner_' + runnerFrame + '.png');		
	}
	
	// Versi IMG
	function animateRunner() {
		$('#runner img').css('object-position', '-' + (runnerFrame * 100) + 'px 0');

		if(runnerFrame == 7)
			runnerFrame = 0;

		runnerFrame++;

		console.log(runnerFrame);
	}
	*/

	function changeRunway(keyCode) {

		// hanya jika tidak sedang melompat
		if(!isJump) {

			if(keyCode == KEYBOARD_UP)
				runwayPos++;
			else if(keyCode == KEYBOARD_DOWN)
				runwayPos--;

			// hanya ijinkan runwayPos memiliki nilai 0 hingga 2 saja
			// jika kurang dari 0, paksa menjadi 0
			// jika lebih dari 2, paksa menjadi 2
			if(runwayPos < 0)
				runwayPos = 0;
			else if(runwayPos > 2)
				runwayPos = 2;

			switch(runwayPos) {
				case 0:
					$('#runner').css('bottom', '70px');	break;

				case 1:
					$('#runner').css('bottom', '100px'); break;

				case 2:
					$('#runner').css('bottom', '120px'); break;
			}
		}
		
	}

	// TODO: chrome jump
	function jumpRunner() {

		// jika tidak sedang lompat
		// untuk menghindari stacked jump
		if(!isJump) {
			isJump = true;

			$('#runner').attr('class', 'runner-jump');

			$('#runner').animate(
				{ 
					top: "-=50px" 
				}, 
				200, // durasi
				'linear', // lompat normal
				function() {
					$('#runner').animate(
						{ 
							top: "+=50px" 
						}, 
						200, 
						'linear',
						function() {
							// FIX: reset top
							// jika tidak di-reset setelah jump
							// runway tidak dapat diganti
							$('#runner').css('top', ''); 

							$('#runner').attr('class', 'runner-animate-run');

							isJump = false; // tandai lompat telah selesai
						}
					);
				}
			);
		}
	}


	// ============================================================ //
	$('#startButton').on('click', function() {
		
		// buat timer untuk scrollbar
		timerScroll = setInterval(function() {
			scrollPage(5);
		}, 10);

		// buat timer untuk perpindahan posisi horizontal runner
		timerMoveRunner = setInterval(function() {
			moveRunner(5);
		}, 10);

		// buat timer untuk pergantian animasi runner
		/*
		setInterval(function() {
			animateRunner();
		}, 150);
		*/

		// atur class untuk menganimasikan 
		
		// versi IMG
		//$('#runner img').attr('class', 'runner-animate-run');

		// versi DIV
		$('#runner').attr('class', 'runner-animate-run');

	});

	// atur binding keydown untuk pendeteksian key yang diperlukan
	$('body').keydown(function(event) {
		switch(event.which) {
			case KEYBOARD_SPACE:
				jumpRunner();
				event.preventDefault();
				break;

			case KEYBOARD_UP:
				changeRunway(KEYBOARD_UP);
				event.preventDefault();
				break;

			case KEYBOARD_DOWN:
				changeRunway(KEYBOARD_DOWN);			
				event.preventDefault();
				break;
		}
	});
});