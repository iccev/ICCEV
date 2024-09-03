#include "HX711.h"
#define calibration_factor_FR -28490.0
#define calibration_factor_FL 24750.0
#define calibration_factor_RR -28450.0
#define calibration_factor_RL -27300.0
#define DOUT_FR 3
#define CLK_FR 2
#define DOUT_FL 5
#define CLK_FL 4
#define DOUT_RR 7
#define CLK_RR 6
#define DOUT_RL 9
#define CLK_RL 8

HX711 scale1(DOUT_FR, CLK_FR);
HX711 scale2(DOUT_FL, CLK_FL);
HX711 scale3(DOUT_RR, CLK_RR);
HX711 scale4(DOUT_RL, CLK_RL);

void setup() {
  Serial.begin(9600);
  Serial.println("HX711");
  scale1.set_scale(calibration_factor_FR);
  scale1.tare();
  scale2.set_scale(calibration_factor_FL);
  scale2.tare();
  scale3.set_scale(calibration_factor_RR);
  scale3.tare();
  scale4.set_scale(calibration_factor_RL);
  scale4.tare();
  delay(5000);
  
  Serial.println("off");
  delay(1000);
}

void loop() {
  Serial.print("#FL:");
  Serial.print(scale2.get_units(), 1);
  Serial.print("|RL:");
  Serial.print(scale4.get_units(), 1);
  Serial.print("|FR:");
  Serial.print(scale1.get_units(), 1);
  Serial.print("|RR:");
  Serial.println(scale3.get_units(), 1);

  

}
