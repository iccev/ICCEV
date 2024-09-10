# 차량 코너웨이트 측정 시스템

### ICC EV 프로젝트

개발 코드 출처: 아주대 소프트웨어학과 18학번 https://luftaquila.io

자세한 사용방법을 한글 파일에 설명해놨습니다.

### 서비스 URL
https://iccev.github.io/ICCEV

1. 가정용 체중계 4개를 개조하여 체중계의 로드셀 신호를 HX711 증폭기로 입력합니다.
2. 아두이노가 증폭된 로드셀 신호를 읽어 차량의 각 바퀴에서의 무게를 측정합니다.
3. Web Serial API 를 통해 웹 브라우저에서 아두이노와 시리얼 통신으로 연결하여 측정한 데이터를 확인합니다.

### 실사용 사진
![체중계 사용](https://github.com/user-attachments/assets/0a9b9a56-0138-4592-9c69-a4c08f966a3e)
![무게 측정 실시간](https://github.com/user-attachments/assets/edb40c18-4e24-4514-9279-3d8e79d0e6e6)