#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>        
#include <HTTPClient.h>

// --- NEW: Wi-Fi and API Configuration ---
const char* ssid = "";         // <-- ENTER YOUR WI-FI NAME
const char* password = ""; // <-- ENTER YOUR WI-FI PASSWORD
const char* serverName = "https://533vnqhw7c.execute-api.ap-south-1.amazonaws.com/v1/predict"; // <-- ENTER YOUR API ENDPOINT URL

// Define the analog pin connected to the pH sensor
const int PH_SENSOR_PIN = 32;

// ADC properties for ESP32
const float ADC_RESOLUTION = 4095.0;
const float REFERENCE_VOLTAGE = 3.3;

// Calibration Parameters
const float CALIBRATION_SLOPE = -5.97;
const float CALIBRATION_OFFSET = 9.6;

// Sensor Variables
float pHValue = 0.0;

void setup() {
    Serial.begin(115200);
    while (!Serial);

    // -- NEW: Connect to Wi-Fi --
    WiFi.begin(ssid, password);
    Serial.println("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    pinMode(PH_SENSOR_PIN, INPUT);

    Serial.println("pH Sensor Reader Initialized.");
    Serial.println("==========================================================");
}

void loop() {
    // Read the raw analog value from the sensor
    int sensorReading = analogRead(PH_SENSOR_PIN);

    // Convert the analog reading to a voltage
    float voltage = (float)sensorReading / ADC_RESOLUTION * REFERENCE_VOLTAGE;

    // Convert the voltage to a pH value
    pHValue = (voltage * CALIBRATION_SLOPE) + CALIBRATION_OFFSET;

    // --- JSON Serialization ---
    StaticJsonDocument<256> doc;
    doc["device_id"] = "esp32_001";
    doc["timestamp"] = millis();
    
    JsonObject sensorReadings = doc.createNestedObject("sensor_readings");
    sensorReadings["pH"] = pHValue;
    sensorReadings["TDS_ppm"] = 245;
    sensorReadings["ORP_mV"] = 253;
    sensorReadings["Temperature_C"] = 25.1;
    sensorReadings["Color_R"] = 125;
    sensorReadings["Color_G"] = 81;
    sensorReadings["Color_B"] = 92;

    doc["source"] = "esp32";

    // --- MODIFIED: Send data instead of just printing ---

    // First, convert the JSON document to a string
    String jsonBuffer;
    serializeJson(doc, jsonBuffer);

    // Also print to Serial for debugging
    Serial.println("Sending data to API:");
    Serial.println(jsonBuffer);

    // Send the data over HTTP
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;

        // Start the request
        http.begin(serverName);
        // Set the content type header to JSON
        http.addHeader("Content-Type", "application/json");

        // Send the actual POST request with the JSON data
        int httpResponseCode = http.POST(jsonBuffer);

        // Check the response
        if (httpResponseCode > 0) {
            Serial.print("HTTP Response code: ");
            Serial.println(httpResponseCode);
        } else {
            Serial.print("Error code: ");
            Serial.println(httpResponseCode);
        }
        // Free resources
        http.end();
    } else {
        Serial.println("WiFi Disconnected");
    }

    // Wait for 10 seconds before the next reading/send
    delay(10000); // Increased delay for API calls
}