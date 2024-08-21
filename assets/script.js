< !DOCTYPE html >
    <html lang="ko">
        <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Serial Communication with Web Serial API</title>
                    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@10"></script>
                    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                    <style>
                        .btn {
                            padding: 10px;
                        cursor: pointer;
        }
                        .green {
                            background - color: green;
                        color: white;
        }
                        .yellow {
                            background - color: yellow;
                        color: black;
        }
                        .red {
                            background - color: red;
                        color: white;
        }
                        .indicator {
                            display: inline-block;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background-color: gray;
                        border: 2px solid gray;
        }
                        .kg {
                            font - size: 1.5rem;
                        font-weight: bold;
        }
                    </style>
                </head>
                <body>
                    <button id="connect" class="btn green"><i class="fa-solid fa-fw fa-plug"></i>&ensp;연결</button>
                    <div id="nano">
                        <span class="indicator"></span> <span class="indicator_text">OFFLINE</span>
                    </div>
                    <div id="data">
                        <div id="FL"><span class="kg">0.0</span> kg (FL)</div>
                        <div id="FR"><span class="kg">0.0</span> kg (FR)</div>
                        <div id="RL"><span class="kg">0.0</span> kg (RL)</div>
                        <div id="RR"><span class="kg">0.0</span> kg (RR)</div>
                        <div id="SUM"><span class="kg">0.0</span> kg (SUM)</div>
                    </div>
                    <canvas id="graph"></canvas>

                    <script>
                        if (!("serial" in navigator)) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Web Serial API 없음',
                                html: `<br>시리얼 통신 API를 지원하지 않는 브라우저입니다.<br><br>이 서비스는<br><br><a class="btn green" href="https://www.google.com/chrome/"><i class="fa-brands fa-chrome"></i>&ensp;Chrome</a>&emsp;<a class="btn blue" href="https://www.microsoft.com/en-us/edge#evergreen"><i class="fa-brands fa-edge"></i>&ensp;Edge</a>&emsp;<a class="btn red" href="https://www.opera.com/ko"><i class="fa-brands fa-opera"></i>&ensp;Opera</a><br><br>에서만 사용 가능합니다.`
                            });
        }

                        let listen = true;
                        let port;
                        let reader;
                        let graph_data = {
                            FL: [],
                        FR: [],
                        RL: [],
                        RR: []
        };

                        document.getElementById("connect").addEventListener("click", async function () {
            if (this.classList.contains("connected")) {
                            disconnectSerial();
            } else {
                            await connectSerial();
            }
        });

                        async function connectSerial() {
            try {
                            port = await navigator.serial.requestPort();
                        await port.open({baudRate: 9600 });

                        document.getElementById("connect").classList.add("connected", "yellow");
                        document.getElementById("connect").classList.remove("green");
                        document.getElementById("connect").innerHTML = '<i class="fa-solid fa-fw fa-plug-circle-exclamation"></i>&ensp;연결 중...';

                        reader = port.readable
                        .pipeThrough(new TextDecoderStream())
                        .pipeThrough(new TransformStream(new LineBreakTransformer()))
                        .getReader();

                        listen = true;
                        while (listen) {
                    const {value, done} = await reader.read();
                        if (done) break;
                        stringParser(value);
                }
            } catch (e) {
                            Swal.fire({
                                icon: 'error',
                                title: '에러 발생',
                                html: `에러: ${e.message}<br>장치가 분리되었거나 연결 중 문제가 발생했습니다.`
                            });
                        updateStatusIndicator("red", "OFFLINE");
            } finally {
                            await disconnectSerial();
            }
        }

                        async function disconnectSerial() {
                            listen = false;
                        if (reader) {
                            await reader.cancel();
                        await reader.releaseLock();
            }
                        if (port) {
                            await port.close();
            }
                        document.getElementById("connect").classList.remove("connected", "yellow", "red");
                        document.getElementById("connect").classList.add("green");
                        document.getElementById("connect").innerHTML = '<i class="fa-solid fa-fw fa-plug"></i>&ensp;연결';
                        updateStatusIndicator("red", "OFFLINE");
        }

                        function stringParser(str) {
                            console.log("수신된 데이터:", str);

                        try {
                if (!str || str.trim() === "") {
                            console.warn("빈 문자열 또는 유효하지 않은 데이터 수신");
                        return;
                }

                        let sum = 0;
                        const weights = str.split('|');
                        console.log("파싱된 데이터:", weights);

                        if (weights.length === 0) {
                    throw new Error("데이터 파싱 실패: 유효하지 않은 형식");
                }

                weights.forEach(weight => {
                    const [key, value] = weight.split(':');
                        if (!key || isNaN(Number(value))) {
                            console.warn(`무시된 데이터: ${weight}`);
                        return;
                    }

                        let parsedValue = Math.abs(Number(value)) < 0.1 ? Math.abs(Number(value)) : Number(value);
                        updateDataDisplay(key, parsedValue);
                        graph_data[key]?.push({x: new Date(), y: parsedValue });
                        sum += parsedValue;
                });

                        if (isNaN(sum)) {
                    throw new Error("총합 계산 실패");
                }

                        updateDataDisplay("SUM", sum);
                        updateStatusIndicator("green", "ONLINE");
            } catch (e) {
                            console.error("데이터 파싱 오류:", e);
                        Swal.fire({
                            icon: 'error',
                        title: '데이터 파싱 오류',
                        html: `데이터 형식이 잘못되었습니다: ${e.message}`
                });
            }
        }

                        function updateDataDisplay(key, value) {
                            document.getElementById(key)?.querySelector(".kg").textContent = value.toFixed(1);
        }

                        function updateStatusIndicator(color, status) {
                            document.getElementById("nano").querySelector(".indicator").style.backgroundColor = color;
                        document.getElementById("nano").querySelector(".indicator").style.borderColor = color;
                        document.getElementById("nano").querySelector(".indicator_text").textContent = status;
        }

                        const graph = new Chart(document.getElementById("graph"), {
                            type: 'line',
                        data: {
                            datasets: [{
                            label: 'FL',
                        data: graph_data.FL,
                        cubicInterpolationMode: 'monotone',
                        tension: 0.2,
                        borderColor: '#ff6384'
                }, {
                            label: 'FR',
                        data: graph_data.FR,
                        cubicInterpolationMode: 'monotone',
                        tension: 0.2,
                        borderColor: '#36a2eb'
                }, {
                            label: 'RL',
                        data: graph_data.RL,
                        cubicInterpolationMode: 'monotone',
                        tension: 0.2,
                        borderColor: '#cc65fe'
                }, {
                            label: 'RR',
                        data: graph_data.RR,
                        cubicInterpolationMode: 'monotone',
                        tension: 0.2,
                        borderColor: '#ffce56'
                }]
            },
                        options: {
                            responsive: true,
                        interaction: {
                            intersect: false,
                },
                        scales: {
                            x: {
                            type: 'realtime',
                        distribution: 'linear',
                        time: {
                            unit: 'second',
                        unitStepSize: 5,
                        stepSize: 5,
                        displayFormats: {
                            hour: 'h:mm:ss',
                        minute: 'h:mm:ss',
                        second: 'h:mm:ss'
                            }
                        },
                        realtime: {
                            duration: 10000,
                        refresh: 100,
                        }
                    },
                        y: {
                            grace: '10%',
                        ticks: {
                            count: 5
                        }
                    }
                },
                        plugins: {
                            legend: {
                            position: 'bottom'
                    }
                },
                        elements: {
                            point: {
                            borderWidth: 0,
                        radius: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0)'
                    }
                }
            }
        });

                        class LineBreakTransformer {
                            constructor() {
                            this.container = '';
            }

                        transform(chunk, controller) {
                            this.container += chunk;
                        const lines = this.container.split('\r\n');
                        this.container = lines.pop();
