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

$("#connect").click(async function () {
  if ($("#connect").hasClass("connected")) {
      listen = false;
      if (reader) {
          await reader.cancel();  // 리더 해제
          await reader.releaseLock();  // 락 해제
      }
      if (port) {
          await port.close();  // 포트 닫기
      }
      $("#connect").removeClass("connected").removeClass("red").removeClass("yellow").addClass("green").html('<i class="fa-solid fa-fw fa-plug"></i>&ensp;연결');
  } else {
      await readFromSerial();
  }
});

async function readFromSerial() {
  try {
      // 포트 선택 및 열기
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      $("#connect").addClass("connected").addClass("yellow").removeClass("green").removeClass("red").html('<i class="fa-solid fa-fw fa-plug-circle-exclamation"></i>&ensp;연결 중...');

      reader = port.readable
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new TransformStream(new LineBreakTransformer()))
          .getReader();

      listen = true;

      while (listen) {
          const { value, done } = await reader.read();
          if (done) {
              break; // 데이터 읽기 종료
          }
          stringParser(value);
      }
  } catch (e) {
      Swal.fire({
          icon: 'error',
          title: '에러 발생',
          html: `에러: ${e.message}<br>장치가 분리되었거나 연결 중 문제가 발생했습니다.`
      });
      $("#nano .indicator").css("background-color", "red").css("border-color", "red");
      $("#nano .indicator_text").text("OFFLINE");
  } finally {
      // 리더와 포트를 안전하게 해제
      if (reader) {
          await reader.cancel();
          await reader.releaseLock();
      }
      if (port && port.close) {
          await port.close();
      }
      $("#connect").removeClass("connected").removeClass("yellow").addClass("green").html('<i class="fa-solid fa-fw fa-plug"></i>&ensp;연결');
  }
}

function stringParser(str) {
  console.log("수신된 데이터:", str);

  try {
      // 빈 문자열 또는 예상치 못한 데이터 무시
      if (!str || str.trim() === "") {
          console.warn("빈 문자열 또는 유효하지 않은 데이터 수신");
          return;
      }

      let sum = 0;
      const weights = str.slice(1).split('|');
      console.log("파싱된 데이터:", weights);

      if (weights.length === 0) {
          throw new Error("데이터 파싱 실패: 유효하지 않은 형식");
      }

      for (let weight of weights) {
          const [key, value] = weight.split(':');
          if (!key || isNaN(Number(value))) {
              console.warn(`무시된 데이터: ${weight}`);
              continue; // key나 value가 없거나 value가 숫자가 아닌 경우 무시
          }

          let parsedValue = Number(value);
          parsedValue = Math.abs(parsedValue) < 0.1 ? Math.abs(parsedValue) : parsedValue;

          // 이 부분에서 선택자를 확인합니다.
          // ID 기반 선택자라면 #key, 클래스 기반이라면 .kg만 사용해야 합니다.
          $(`#${key}`).find(".kg").text(parsedValue.toFixed(1));
          graph_data[key].push({ x: new Date(), y: parsedValue });
          sum += parsedValue;
      }

      if (isNaN(sum)) {
          throw new Error("총합 계산 실패");
      }

      $("#SUM .kg").text(sum.toFixed(1));
      $("#nano .indicator").css("background-color", "green").css("border-color", "green");
      $("#nano .indicator_text").text("ONLINE");
      $("#connect").addClass("connected").addClass("red").removeClass("yellow").html('<i class="fa-solid fa-fw fa-plug-circle-xmark"></i>&ensp;해제');
  } catch (e) {
      console.error("데이터 파싱 오류:", e);
      Swal.fire({
          icon: 'error',
          title: '데이터 파싱 오류',
          html: `데이터 형식이 잘못되었습니다: ${e.message}`
      });
  }
}


let graph_data = {
  FL: [],
  FR: [],
  RL: [],
  RR: []
};

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

$("#help").click(function () {
  Swal.fire({
      icon: 'info',
      html: `<div style="text-align: left; font-size: 1rem; line-height: 1.5rem;"><h3>사용법</h3><ol><li>저울의 아두이노를 USB 케이블로 컴퓨터와 연결합니다.</li><li><span class="connect noselect btn green" ><i class="fa-solid fa-fw fa-plug"></i>&ensp;연결</span>을 누르고, 표시되는 시리얼 장치와 연결합니다.</li><li>연결될 때까지 잠시 기다립니다. 10초 이상 기다려도 연결되지 않으면 페이지를 새로고침하고, 연결 상태를 확인한 후 다시 시도하세요.</li></ol><h3>주의사항</h3><ul><li><b>영점 조정</b><br>영점은 아두이노가 처음 켜지는 순간을 기준으로 설정됩니다. 영점이 맞지 않는다면 아두이노 보드에 있는 리셋 버튼을 눌러 새로 영점을 맞추세요.<br><br></li><li><b>몇 가지 버그</b><br>기능이 완전하지 않아 가끔 페이지가 멈추거나 튕깁니다(...)<ul><li>차트가 움직이지 않거나 페이지가 멈춘 것 같다면 멈춘 탭을 닫고, 새 탭에서 재접속해 보세요.</li><li>여러 개러 탭에 이 서비스를 동시에 띄워놓고 사용할 수는 없습니다. 새 탭에서 열었다면, 멈춘 탭은 꼭 닫아 주어야 합니다.</li><li>특히 연결 해제가 정상적으로 작동하지 않습니다. 연결을 해제했다가 다시 연결할 때는 페이지를 새로고침해야 합니다.</li></ul><br></li><li><b>브라우저</b><br>이 서비스는 Web Serial API를 지원하는 Chrome, Edge, Opera 최신 버전 브라우저에서만 작동합니다.</li></ul><div style="text-align: right; margin-top: 1rem">개발 코드 출처: 아주대 소프트웨어학과 18학번 <a href="https://luftaquila.io">오병준</a></div></div>`
  });
});

class LineBreakTransformer {
  constructor() {
      this.container = '';
  }

  transform(chunk, controller) {
      this.container += chunk;
      const lines = this.container.split('\r\n');
      this.container = lines.pop();
      lines.forEach(line => controller.enqueue(line));
  }

  flush(controller) {
      controller.enqueue(this.container);
  }
}
