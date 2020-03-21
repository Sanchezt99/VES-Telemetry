byte frame[37];
int frame_size = sizeof(frame);

float minVolt, maxVolt, current, instantVolt;
int soc;

void setup() {
    Serial.begin(9600);
    Serial2.begin(9600);
}

void loop() {
    Serial2.flush();
  	if (Serial2.available()) {
    	Serial2.readBytes(frame, frame_size);
    	print_data();
  	}
}

void print_data() {
    Serial.print("{");
    print_timestamp();
    Serial.print(", ");
    print_location();
    Serial.print(", ");
    print_canData();  
    Serial.println("}");
}

void print_timestamp() {
    Serial.print("\"timestamp\"");
    Serial.print(": \"");
    if ((int)frame[15] < 10) {
      Serial.print("0");
    }
    Serial.print((int)frame[15]); //hours
    Serial.print(":");
    if ((int)frame[16] < 10) {
      Serial.print("0");
    }
    Serial.print((int)frame[16]); //minutes
    Serial.print(":");
    if ((int)frame[17] < 10) {
      Serial.print("0");
    }
    Serial.print((int)frame[17]); //seconds
    Serial.print("\"");
}

void print_location() {
  	long *latitude = 0;
  	long *longitude = 0;
  	byte latitude_bytes[] = {frame[18], frame[19], frame[20], frame[21]};
  	byte longitude_bytes[] = {frame[22], frame[23], frame[24], frame[25]};
  	latitude = (long *)latitude_bytes;
  	longitude = (long *)longitude_bytes;

    Serial.print("\"latitude\": ");
    Serial.print((long)*latitude/pow(10, 6), 6);
    Serial.print(", \"longitude\": ");
    Serial.print((long)*longitude/pow(10, 6), 6);
    Serial.print(", \"speed\": ");
    Serial.print((int)frame[26]); //speed
}

void print_canData() {
    minVolt = (((float)(frame[27]<<8) + (float)frame[28]))/1000;  
    maxVolt = ((float)(frame[29]<<8) + (float)frame[30])/1000;
    current = ((float)(frame[31]<<8) + (float)frame[32])/10;
    instantVolt = ((float)(frame[33]<<8) + (float)frame[34])/10;
    soc = (int)frame[35];

    Serial.print("\"minVolt\": ");
    Serial.print(minVolt);
    Serial.print(", \"maxVolt\": ");
    Serial.print(maxVolt);
    Serial.print(", \"instantVolt\": ");
    Serial.print(instantVolt);
    Serial.print(", \"current\": ");
    Serial.print(current);
    Serial.print(", \"soc\": ");
    Serial.print(soc);
}
