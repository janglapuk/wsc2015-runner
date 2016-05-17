$(function() {

	// ============================================================ //
	var timerMoveRunner, timerScroll;

	// posisi scrollbar
	var runnerPos = 0;

	// posisi akan mendaki
	var startInclinePos = 4650;

	// posisi akhir pendakian
	var endInclinePos = 4860;

	// posisi berhenti runner mendekati cauldron
	var stopPosition = 5100;

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

	// hilangkan default runner image
	$('#runner img').remove();

	// ubah status awal runner ke ready
	$('#runner').attr('class', 'runner-ready');

	// ============================================================ //
	function scrollPage(val) {
		if(runnerPos > 100)
			window.scrollBy(val, 0);
	}

	function moveRunner(val) {
		// penambahan posisi runner
		runnerPos += val;

		// atur posisi runner dengan mengatur attribut 'left' pada CSS
		$('#runner').css('left', runnerPos);

		//console.log(runnerPos);

		// jika berada pada range tanjakan
		if(runnerPos > startInclinePos && runnerPos < endInclinePos) {

			// ambil nilai bottom saat ini, parse dari string ke integer
			var currentBottom = parseInt($('#runner').css('bottom'));

			// penambahan berdasarkan kenaikan nilai runnerPos
			var penambah = (runnerPos - startInclinePos) / 30;

			var kenaikan = currentBottom + penambah;

			// atur attribute 'bottom' untuk mendaki
			$('#runner').css('bottom', kenaikan + 'px');
		}

		if(runnerPos > stopPosition) {
			// stop timer untuk scrolling
			clearInterval(timerScroll);

			// stop timer untuk perpindahan runner
			clearInterval(timerMoveRunner);

			// ubah status runner menjadi ready
			$('#runner').attr('class', 'runner-ready');
		}
	}

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

			// kondisi pengaturan runway, diatur dengan CSS
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

		// jika tidak sedang lompat, untuk menghindari stacked jump
		if(!isJump) {

			// ubah status tidak lompat menjadi lompat
			isJump = true;

			// sebelum lompat, ubah status runner pada posisi animasi lompat (kaki terbuka)
			$('#runner').attr('class', 'runner-jump');

			// animasikan runner ke posisi naik
			$('#runner').animate(
				{ 
					top: "-=50px"
				}, 
				200, // durasi
				'linear', // lompat normal
				function() { // onComplete (fungsi ketika animasi #1 telah selesai)

					// animasikan runner ke posisi turun
					$('#runner').animate(
						{ 
							top: "+=50px"
						}, 
						200, // durasi
						'linear', // lompat normal
						function() { // onComplete (fungsi ketika animasi #2 telah selesai)
							// FIX: reset top
							// jika tidak di-reset setelah jump
							// runway tidak dapat diganti
							$('#runner').css('top', ''); 

							// ubah status runner dari lompat ke status lari
							$('#runner').attr('class', 'runner-animate-run');

							// reset status lompat
							isJump = false;
						}
					);
				}
			);
		}
	}

	// ============================================================ //

	// fungsi ketika tombol Start ditekan
	$('#startButton').on('click', function() {
		
		// buat timer untuk perpindahan scrollbar
		timerScroll = setInterval(function() {
			scrollPage(5); // parameter 5 => penambah nilai posisi
		}, 10); // 10 ms

		// buat timer untuk perpindahan posisi horizontal runner
		timerMoveRunner = setInterval(function() {
			moveRunner(5); // parameter 5 => penambah nilai posisi
		}, 10); // 10 ms

		// ubah status runner ke animasi berlari
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