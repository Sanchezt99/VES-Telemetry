/*
End-device(Trnasmissor) Xbee code for VES Telemtry:
  This code writes an API zigbee frame for xbee 3.
@Author: Kevin Gutierrez Gomez.
@Date: September 27th 2019.
Frame format:
  Start delimeter (1 byte): Always is 7E.
  Length (2 bytes): Number of bytes between length and checksum fields.
  Frame type (1 byte): By default will 10(transmit request), you can search in xbee domentation for more types of frames.
  Frame ID (1 byte): Identifies the UART data frame for the host to match with a subsequent response, if zero, no response is requested.
  64-bit-dest-address (8 bytes): Address of destination device, The following address are also supported; (00 00 00 00 00 00 FF FF) Broadcast address.
  16-bit-dest-address (2 bytes): Address of destination device if know, set (FF FE) if unknown or if sending a Broadcast. Search in xbee documentation for other reserved 16-bit-address.
  Broadcast radius (1 byte): Set the maximum number of Broadcast hops, is setted (00) for maximum number by default.
  Options (1 byte): See xbee documentation for info, is setted 00 (none).
  RF Data (0 - 65521 bytes): data to be sent.
  Checksum (1 byte): FF - (8-bit sum of bytes between length and checksum fields).
*/

//============================= Libraries ====================//
#include <TinyGPS++.h>
#include <SPI.h>
#include "mcp_can.h"

//========================== FRAME PARAMETERS =================//
const byte start_delimeter = 0x7E;
const byte frame_type = 0x10;
const byte frame_ID = 0x01;
const byte destination_device_address[8] = {0x00, 0x13, 0xA2, 0x00, 0x40, 0x97, 0xA7, 0xAF};
const byte destination_16_address[2] = {0xFF, 0xFE};
const byte broadcast_radius = 0x00;
const byte option = 0x00;
byte data[21] = {0};

int size_data = sizeof(data);
byte frame[39];				//If you wanna add a some byte to data array, you need to increment the frame length too.

//======================== timer ===============================//
unsigned int current_time = 0;
unsigned int final_time = 0;

//=========================== GPS ==============================//
TinyGPSPlus gps;

//========================== CAN ==============================//
const int spiCSPin = 53;
MCP_CAN CAN(spiCSPin);


void setup() {
  	Serial.begin(9600);
  	Serial2.begin(9600);
  	Serial3.begin(9600);

	setup_frame();

	//while (CAN_OK != CAN.begin(CAN_500KBPS)) {
    //    Serial.println("CAN BUS Init Failed");
    //    delay(100);
    //}
    Serial.println("CAN BUS  Init OK!");
}

void loop() {

	//============== CAN ============//

	if(CAN_MSGAVAIL == CAN.checkReceive()) {
		fill_data_can();
    }

	// ============ GPS ==============//
  
    if (Serial3.available()) {
      	gps.encode(Serial3.read());
    }

	// =========== Send frame =======//

  	current_time = millis();
  	if (current_time - final_time > 1000) {

		//displayInfo();
		fill_data_gps();
    	send();
		memset(data,0,size_data);
    
    	final_time = current_time;
  	}
  
}

//=========================== Frame Methods ==================================//

void setup_frame() {
	frame[0] = start_delimeter;
	frame[3] = frame_type;  
	frame[4] = frame_ID;
	byte *addrs64 = destination_device_address;
	for (int i = 5; i <= 12; i++) {
		frame[i] = *addrs64;
		*addrs64++;
	}
	frame[13] = destination_16_address[0];
	frame[14] = destination_16_address[1];
	frame[15] = broadcast_radius;
	frame[16] = option;
}

void send() {

	set_frame_length();
	byte *payload = data;
	for (int i = 17; i <= 17 + size_data; i++) {
		frame[i] = *payload;
		*payload++;
	}
	write_checksum();
	Serial2.write(frame, sizeof(frame));

}

void set_frame_length() {
  unsigned int length = sizeof(data) + 14;
  byte most_significant_byte = length >> 8;
  byte least_significant_byte = length;
  frame[1] = most_significant_byte;
  frame[2] = least_significant_byte;
}

void write_checksum() {
	byte checksum = (0xFF) - (
		frame_type
		+ frame_ID
		+ sum_check(destination_device_address, sizeof(destination_device_address)) 
		+ sum_check(destination_16_address, sizeof(destination_16_address))
		+ broadcast_radius
		+ option 
		+ sum_check(data, size_data));
  	frame[sizeof(frame) - 1] = checksum;
}

byte sum_check(byte arr[], int length) {
  byte arr_sum = 0;
  for(int i = 0; i < length; i++) {
    arr_sum += arr[i];
  }
  return arr_sum;
}

// ========================== fill data methods =============================//

void fill_data_gps() {
	if (gps.time.isValid()) {
		data[0] = gps.time.hour();
		data[1] = gps.time.minute();
		data[2] = gps.time.second();
	}
	if (gps.location.isValid()) {
		long lat = gps.location.lat()*pow(10, 6);
		long lng = gps.location.lng()*pow(10, 6);
		data[3] = (0x000000FF)&lat;
		data[4] = ((0x0000FF00)&lat)>>8;
		data[5] = ((0x00FF0000)&lat)>>16;
		data[6] = ((0xFF000000)&lat)>>24;
		data[7] = (0x000000FF)&lng;
		data[8] = ((0x0000FF00)&lng)>>8;
		data[9] = ((0x00FF0000)&lng)>>16;
		data[10] = ((0xFF000000)&lng)>>24;
	}
	if (gps.speed.isValid()) {
		data[11] = (int)gps.speed.kmph();
	}
}

void fill_data_can() {
	unsigned char len = 0;
    unsigned char buf[8];
	
    CAN.readMsgBuf(&len, buf);

    unsigned long canId = CAN.getCanId();

	if (canId == 0x3CB) {
		data[12] = buf[2];  //most significant minVolt byte
		data[13] = buf[3];	//least significant minVolt byte
		data[14] = buf[4];	//most significant maxvolt byte
		data[15] = buf[5];	//least significant maxVolt byte
	}
	if (canId == 0x3B) {
		data[16] = buf[0];  //most significant current byte
		data[17] = buf[1];	//least significant current byte
		data[18] = buf[2];	//most significant instantVolt byte
		data[19] = buf[3];	//least significant instantVolt byte
		data[20] = buf[6];	//SOC
	}
}
