//
// pH Sensor Reader for ESP32-WROOM
//
// This sketch reads the analog voltage from an electrode-based pH sensor
// connected to an analog pin of the ESP32 and converts it into a pH value.
// The result is then printed to the Serial Monitor in JSON format.
//
// === Hardware Connections ===
// - ESP32-WROOM-32U Board
// - pH Sensor Module (e.g., DFROBOT Gravity Analog pH Sensor)
//
// pH Sensor Module VCC -> ESP32 3.3V
// pH Sensor Module GND -> ESP32 GND
// pH Sensor Module PO -> ESP32 Analog Pin (e.g., GPIO 32)
//
// Note: The ESP32's ADC (Analog-to-Digital Converter) range is 0-3.3V.
// We will use a voltage conversion to get an accurate reading.
//
#include <Arduino.h>
#include <ArduinoJson.h>

// Define the analog pin connected to the pH sensor
const int PH_SENSOR_PIN = 32; // Use an ADC-enabled pin, like GPIO 34-39

// ADC properties for ESP32
const float ADC_RESOLUTION = 4095.0; // 12-bit ADC on ESP32
const float REFERENCE_VOLTAGE = 3.3; // The analog reference voltage of the ESP32

// =======================
// === CALIBRATION ===
// =======================
// IMPORTANT: A single-point calibration with pH 7 water will only provide
// a rough approximation. For accurate readings across the 0-14 pH range,
// a two-point calibration (e.g., with pH 7.0 and pH 4.0 solutions) is required.
//
// This code assumes a standard slope for a typical pH sensor.
const float CALIBRATION_SLOPE = -5.97; // A common slope for pH sensors, in pH units per volt.

// You must find your specific offset value and paste it here.
const float CALIBRATION_OFFSET = 9.6; // This value has been updated after calibration.

// =======================
// === SENSOR VARIABLES ===
// =======================
float pHValue = 0.0;

void setup() {
    // Initialize serial communication at a baud rate of 115200
    Serial.begin(115200);

    // Configure the analog pin
    pinMode(PH_SENSOR_PIN, INPUT);

    Serial.println("pH Sensor Reader Initialized.");
    Serial.println("==========================================================");
    Serial.println("Running in normal mode with calibrated values. JSON output enabled.");
}

void loop() {
    // Read the raw analog value from the sensor
    int sensorReading = analogRead(PH_SENSOR_PIN);

    // Convert the analog reading to a voltage
    float voltage = (float)sensorReading / ADC_RESOLUTION * REFERENCE_VOLTAGE;

    // Convert the voltage to a pH value using the calibration formula
    pHValue = (voltage * CALIBRATION_SLOPE) + CALIBRATION_OFFSET;

    // --- JSON Serialization ---
    StaticJsonDocument<256> doc; // Create a JSON document object on the stack

    // Add key-value pairs to the JSON document
    doc["device_id"] = "esp32_001";
    doc["timestamp"] = millis(); // Using milliseconds since startup as a simple timestamp
    doc["new_key"] = "example_value"; // <<-- This is the new key added
    
    JsonObject sensorReadings = doc.createNestedObject("sensor_readings");
    sensorReadings["pH"] = pHValue;
    sensorReadings["TDS_ppm"] = 245; // Dummy value
    sensorReadings["ORP_mV"] = 253; // Dummy value
    sensorReadings["Temperature_C"] = 25.1; // Dummy value
    sensorReadings["Color_R"] = 125; // Dummy value
    sensorReadings["Color_G"] = 81; // Dummy value
    sensorReadings["Color_B"] = 92; // Dummy value

    doc["source"] = "esp32";

    // Serialize JSON and print to Serial Monitor
    serializeJson(doc, Serial);
    Serial.println(); // Add a newline for each new JSON object

    // Add a small delay before the next reading
    delay(2000); // Wait for 2 seconds
}