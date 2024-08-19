# 차량 코너웨이트 측정 시스템

상위 프로젝트: [luftaquila/a-fa-landing](https://github.com/luftaquila/a-fa-landing)

### 서비스 URL
https://a-fa.luftaquila.io/weight

1. 가정용 체중계 4개를 개조하여 체중계의 로드셀 신호를 HX711 증폭기로 입력합니다.
2. 아두이노가 증폭된 로드셀 신호를 읽어 차량의 각 바퀴에서의 무게를 측정합니다.
3. Web Serial API 를 통해 웹 브라우저에서 아두이노와 시리얼 통신으로 연결하여 측정한 데이터를 확인합니다.

<img src="https://github.com/luftaquila/a-fa-landing/assets/17094868/63cc9e99-34eb-4603-b608-e3a64374dadd">
<img src="https://github.com/luftaquila/a-fa-landing/assets/17094868/3084c554-012b-439b-a6b1-f17cf9cbc0e0">
