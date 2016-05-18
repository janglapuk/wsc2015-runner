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
	var stopPosition = 5150;

	// landmark panels
	var landmarkNames = [
		'amazon', // Amazon Rainforest – Manaus – AM
		'bahia', // Lacerda Elevator – Salvador – BA
		'parana', // Iguaçu Falls – Foz do Iguaçu – PR
		'saopaulo', // Cable-Stayed Bridge – São Paulo – SP
		'rio'  // Christ the Redeemer – Rio de Janeiro – RJ
	];

	// database untuk menampung nama-nama landmark pada panel
	// jadi tidak perlu menulis manual nama-namanya, cukup ambil dari text HTML-nya saja
	var landmarkPanelNames = ['', '', '', '', ''];

	// indikator landmark yang telah dilewati
	// ini digunakan untuk menentukan element berdasarkan index-nya
	// nilai indikator incremented hingga total jumlah landmark
	var landmarkPassed = 0;

	// efek animasi pada masing-masing landmark saat muncul
	// PENTING: lihat deskripsi project nomor 9
	var landmarkShowEffects = [
		'slide',
		'drop',
		'pulsate',
		'clip',
		'shake'
	];

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

	// indikator jika telah finish
	var isFinished = false;

	// obstacles database
	//var obstacleDatabase = [[], []]; // FIXME

	// sementara menggunakan 3 obstacles aja :(
	var obstacleDatabase = [];

	// ============================================================ //
	function scrollPage(val) {
		if(runnerPos > 100)
			window.scrollBy(val, 0);
	}

	function generateObstaclePos() {
		obstacleDatabase[2] = Math.floor(Math.random() * (startInclinePos - 1000 + 1) + 0); // atas
		obstacleDatabase[1] = Math.floor(Math.random() * (startInclinePos - 1000 + 1) + 0); // tengah
		obstacleDatabase[0] = Math.floor(Math.random() * (startInclinePos - 1000 + 1) + 0); // bawah

		//console.dir(obstacleDatabase);
	}

	function buildObstacles() {

		el = $('<span/>').attr('class', 'obstacle').css('margin-left', obstacleDatabase[2]+'px').css('left', '0');
		$('#runway1').append(el);

		el = $('<span/>').attr('class', 'obstacle').css('margin-left', obstacleDatabase[1]+'px').css('left', '0');
		$('#runway2').append(el);

		el = $('<span/>').attr('class', 'obstacle').css('margin-left', obstacleDatabase[0]+'px').css('left', '0');
		$('#runway3').append(el);

	}

	// fungsi untuk memeriksa apakah posisi runner berada di area tabrakan
	// PENTING: lihat deskripsi project nomor 6
	function isObstacleCollided(curRunnerPos, curRunwayPos) {
		
		// ambil posisi obstacle di mana runner sedang berada
		var obsInRunway = obstacleDatabase[curRunwayPos];

		// buat posisi aman sebelum obstacle
		var safePosBefore = obsInRunway - 10;

		// buat posisi aman setelah obstacle
		var safePosAfter = obsInRunway + 10;

		// cek apakah posisi runner sedang berada di range posisi tidak aman dan tidak lompat
		if(curRunnerPos >= safePosBefore && curRunnerPos <= safePosAfter && !isJump) {
			return true;
		}

		return false;
	}

	function landmarkPassingCheck(curRunnerPos) {
		// karena landmark awal dimulai dari posisi 800
		var landmarkPos = 800 + (landmarkPassed * 800);

		// landmark  
		var nextLandmarkPos = landmarkPos + 800;

		//console.log('landmarkPos: ' + landmarkPos + ' / nextLandmarkPos: ' + nextLandmarkPos);
		// lakukan sejumlah total landmark saja
		if(landmarkPassed < landmarkNames.length) {

			// jika posisi runner berada pada range mendekati landmark tujuan dan landmark berikutnya
			if(curRunnerPos >= landmarkPos && curRunnerPos < nextLandmarkPos) {

				// tampung element panel berdasarkan index
				var panel = $('#panels > .panel').get(landmarkPassed);

				// atur panel text
				// PENTING: lihat deskripsi project nomor 8
				$(panel).text(landmarkPanelNames[landmarkPassed]);

				// tampilkan gambar landmark yang disembuyikan
				//$('#' + landmarkNames[landmarkPassed] + ' > img').show();

				// animasikan masing-masing landmark yang dilewati
				// PENTING: lihat deskripsi project nomor 9
				var animateType = landmarkShowEffects[landmarkPassed];
				$('#' + landmarkNames[landmarkPassed] + ' > img').show(animateType, {direction: "up"}, 500);

				//console.log('Passed: ' + landmarkPassed);

				landmarkPassed++;
			}			
		}
	}
	
	function showFinishPopup() {
		$('#end > .box > .error').hide();
		$('#end > .box > .success').show();
		$('#end').show();
	}

	function showGameOverPopup() {
		$('#end > .box > .error').show();
		$('#end > .box > .success').hide();
		$('#end').show();
	}

	function finished() {
		isFinished = true;

		// ubah status gambar pyre normal ke pyre terbakar
		$('#pyre img').attr('src', 'imgs/pyre_fire.svg');

		// hentikan permainan
		stopGame();

		// tampilkan popup GAME OVER
		//showFinishPopup(); // no delay

		// adanya setTimeout 1000ms supaya ada jeda agar api di couldron kelihatan ada perubahan
		// PENTING: lihat deskripsi project nomor 11
		setTimeout(showFinishPopup, 1000);
	}

	function gameOver() {
		isFinished = false;

		// hentikan permainan
		stopGame();

		// tampilkan popup GAME OVER
		showGameOverPopup();
	}

	function moveRunner(val) {
		// penambahan posisi runner
		runnerPos += val;

		// atur posisi runner dengan mengatur attribut 'left' pada CSS
		$('#runner').css('left', runnerPos);

		//console.log(runnerPos);
		landmarkPassingCheck(runnerPos);

		// cek apakah terjadi tabrakan?
		// PENTING: lihat deskripsi project nomor 6
		if(isObstacleCollided(runnerPos, runwayPos)) {
			gameOver();
			return;
		}

		// jika berada pada range tanjakan
		// PENTING: lihat deskripsi project nomor 11
		if(runnerPos > startInclinePos && runnerPos < endInclinePos) {

			// ambil nilai bottom saat ini, parse dari string ke integer
			var currentBottom = parseInt($('#runner').css('bottom'));

			// penambahan berdasarkan kenaikan nilai runnerPos
			var penambah = (runnerPos - startInclinePos) / 30;

			var kenaikan = currentBottom + penambah;

			// atur attribute 'bottom' untuk mendaki
			$('#runner').css('bottom', kenaikan + 'px');
		}

		// FINISH!
		// PENTING: lihat deskripsi project nomor 11
		if(runnerPos > stopPosition) {
			finished();
			return;
		}
	}

	function resetRunway() {
		$('#runner').css('bottom', '90px');
		$('#runner').css('transform', 'scale(0.9, 0.9)');
	}

	// fungsi untuk mengatur perspektif runner
	// ketika di runway atas, ukuran runner mengecil
	// ketika di runway tengah, ukuran runner normal
	// ketika di runway bawah, ukuran runner membesar
	// PENTING: lihat deskripsi project nomor 3.4
	function rescaleRunnerPerspective(curRunwayPos) {
		
		//var leftDistance = parseInt($('#runner').css('left'));

		switch(curRunwayPos) {
			case 0: // bawah
				//$('#runner').css('left', (leftDistance + 100) + 'px');
				$('#runner').css('bottom', '65px');	
				$('#runner').css('transform', 'scale(1.0, 1.0)');
				$('#runner').css('-webkit-transform', 'scale(1.0, 1.0)');
				$('#runner').css('-moz-transform', 'scale(1.0, 1.0)');
				break;

			case 1: // tengah
				$('#runner').css('bottom', '90px'); 
				$('#runner').css('transform', 'scale(0.9, 0.9)');
				$('#runner').css('-webkit-transform', 'scale(0.9, 0.9)');
				$('#runner').css('-moz-transform', 'scale(0.9, 0.9)');
				break;

			case 2: // atas
				//$('#runner').css('left', (leftDistance - 100) + 'px');
				$('#runner').css('bottom', '110px'); 
				$('#runner').css('transform', 'scale(0.8, 0.8)');
				$('#runner').css('-webkit-transform', 'scale(0.8, 0.8)');
				$('#runner').css('-moz-transform', 'scale(0.8, 0.8)');
				break;
		}
	}

	function changeRunway(keyCode) {

		// hanya jika tidak sedang melompat
		if(!isJump) {

			// PENTING: lihat deskripsi project nomor 3.2
			if(keyCode == KEYBOARD_UP)
				runwayPos++;
			else if(keyCode == KEYBOARD_DOWN)
				runwayPos--;

			// hanya ijinkan runwayPos memiliki nilai 0 hingga 2 saja
			// jika kurang dari 0, paksa menjadi 0
			// jika lebih dari 2, paksa menjadi 2
			// PENTING: lihat deskripsi project nomor 3.3
			if(runwayPos < 0)
				runwayPos = 0;
			else if(runwayPos > 2)
				runwayPos = 2;

			// ubah perspektif runner sesuai runway-nya
			// PENTING: lihat deskripsi project nomor 3.4
			rescaleRunnerPerspective(runwayPos);
		}
		
	}

	// TODO: chrome jump
	function jumpRunner() {

		// jika tidak sedang lompat dan belum finish
		// untuk menghindari stacked jump / jump while in the air
		// PENTING: lihat deskripsi project nomor 4
		if(!isJump && !isFinished) {

			// ubah status tidak lompat menjadi lompat
			isJump = true;

			// sebelum lompat, ubah status runner pada posisi animasi lompat (kaki terbuka)
			// PENTING: lihat deskripsi project nomor 4
			$('#runner').attr('class', 'runner-jump');

			// animasikan runner ke posisi naik
			$('#runner').animate(
				{ 
					top: "-=50px" // sekian pixel akan naik dari posisi semula
				}, 
				200, // durasi
				'linear', // lompat normal
				function() { // onComplete (fungsi ketika animasi #1 telah selesai)

					// animasikan runner ke posisi turun
					$('#runner').animate(
						{ 
							top: "+=50px" // sekian pixel akan turun dari posisi saat di puncak
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

	// Fungsi untuk start/restart
	function prepareGame() {
		// reset posisi runner
		runnerPos = 0;

		// reset posisi runway
		runwayPos = 1;

		// atur posisi scroll ke default
		window.scrollTo(0, 0);

		// hilangkan default runner image
		$('#runner img').remove();

		// reset posisi runner di runway menjadi posisi default
		resetRunway();

		// ubah status awal runner ke ready
		$('#runner').attr('class', 'runner-ready');

		// hapus semua obstacles yang ada
		$('span.obstacle').remove();

		// generate posisi obstacles secara random
		// PENTING: lihat deskripsi project nomor 5
		generateObstaclePos();

		// letakkan obstacles berdasarkan posisi yang ditentukan di atas (random)
		// PENTING: lihat deskripsi project nomor 5
		buildObstacles();

		// FIX: ubah status pyre terbakar ke normal
		// berpengaruh ketika restart setelah finish
		$('#pyre img').attr('src', 'imgs/pyre.svg');

		// simpan nama panel masing-masing landmark ke database
		$('#panels > .panel').each(function(idx, el) {
			
			// simpan nama landmark ke database jika sedang kosong saja
			// FIXED: ini terjadi ketika restart
			if(landmarkPanelNames[idx].length == 0) {
				// simpan ke database
				landmarkPanelNames[idx] = $(el).text();	
			}
						
			// hapus text dari panel
			// PENTING: lihat deskripsi project nomor 8 dan 9
			$(el).text('');
		});

		// sembunyikan gambar landmark pada index greater than 0 (karena ada 6 elements)
		// PENTING: lihat deskripsi project nomor 8 dan 9
		$('#points > section :gt(0)').hide();

		// reset indikator landmark yang telah dilewati
		landmarkPassed = 0;
	}

	// fungsi untuk memulai permainan
	function startGame() {
		// buat timer untuk perpindahan scrollbar
		timerScroll = setInterval(function() {
			scrollPage(5); // parameter 5 => penambah nilai posisi
		}, 10); // 10 ms

		// buat timer untuk perpindahan posisi horizontal runner
		// PENTING: lihat deskripsi project nomor 7
		timerMoveRunner = setInterval(function() {
			moveRunner(5); // parameter 5 => penambah nilai posisi
		}, 10); // 10 ms

		// ubah status runner ke animasi berlari
		$('#runner').attr('class', 'runner-animate-run');
	}

	function stopGame() {

		// stop timer untuk scrolling
		clearInterval(timerScroll);

		// stop timer untuk perpindahan runner
		clearInterval(timerMoveRunner);

		// ubah status runner menjadi ready
		$('#runner').attr('class', 'runner-ready');
	}

	// ============================================================ //
	// Perintah-perintah yang akan dipanggil pertama kali adalah 
	// fungsi-fungsi yang berada di bawah ini:
	// ============================================================ //

	// persiapan semua kondisi ke default untuk pertama kali
	prepareGame();

	// fungsi ketika tombol Start ditekan
	$('#startButton').on('click', function() {
		startGame();
	});

	// fungsi click ketika tombol Restart ditekan
	$('#restartButton').on('click', function() {
		// persiapan semua kondisi ke default
		prepareGame();

		// setelah persiapan, mulai permainan
		startGame();
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
