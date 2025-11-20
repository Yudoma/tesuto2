window.onload = function() {
    const canvas = document.getElementById('efk_canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // WebGLコンテキストを取得
    const gl = canvas.getContext('webgl', { 
        alpha: false,
        antialias: true
    });

    if (!gl) {
        console.error('Failed to get WebGL context!');
        return;
    }

    // Effekseerコンテキストの作成と初期化
    const efkContext = effekseer.createContext();
    if (!efkContext) {
        console.error('Failed to create Effekseer context!');
        return;
    }
    
    try {
        efkContext.init(gl, {});
    } catch (e) {
        console.error('Failed to initialize Effekseer context:', e);
        return;
    }

    // Canvasの解像度と2Dカメラをウインドウサイズに合わせる
    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // 正射影行列の設定
        efkContext.setProjectionMatrix(
            effekseer.createMatrix().ortho(0, width, height, 0, -1000, 1000)
        );
        
        // ビュー行列の設定
        efkContext.setCameraMatrix(
            effekseer.createMatrix().lookAt(
                effekseer.createVector3(0, 0, 1),
                effekseer.createVector3(0, 0, 0),
                effekseer.createVector3(0, 1, 0)
            )
        );
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    const effectUrl = './pipoya-saceffect_001.efkefc';
    const scale = 100.0;
    
    // エフェクトの読み込み
    const effect = efkContext.loadEffect(effectUrl, scale, (loadedEffect) => {
        
        console.log('Effect loaded. Playing at center.');

        // 読み込み完了後、画面の中央に再生
        let handle = efkContext.play(loadedEffect, canvas.width / 2, canvas.height / 2, 0);
        
        // スケールを設定（play時に設定済みの場合は不要なことが多いですが、念のため）
        if (handle && handle.setScale) {
            handle.setScale(scale, scale, scale);
        }

        // 3秒ごとにもう一度再生する
        setInterval(() => {
            efkContext.play(loadedEffect, canvas.width / 2, canvas.height / 2, 0);
        }, 3000);

    }, (err) => {
        console.error('Failed to load effect:', err);
        alert('エフェクトファイルの読み込みに失敗しました。\n' + effectUrl);
    });

    // 描画ループを開始
    function loop() {
        requestAnimationFrame(loop);
        
        // WebGL背景クリア
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Effekseerの更新と描画
        efkContext.update();
        efkContext.draw();
    }

    loop();
};