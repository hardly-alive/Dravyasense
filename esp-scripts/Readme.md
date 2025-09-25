# ESP32 Scripts – Sensor Calibration & Data Transmission

This folder contains **ESP32 Arduino sketches** for:

* **Calibrating individual sensors**
* **Main firmware** that aggregates sensor readings and transmits them to the cloud API.

---

## 📂 Files Overview

* **Calibration Sketches**
  Each sensor has its own calibration sketch to fine-tune readings before deployment:

  * `PH_CALIB_CODE.ino` → Calibration for pH sensor
  * `TDS_CALIB_CODE.ino` → Calibration for TDS sensor
  * `ORP_CALIB_CODE.ino` → Calibration for ORP sensor
  * `TEMP_CALIB_CODE.ino` → Calibration for temperature sensor
  * `RGB_CALIB_CODE.ino` → Calibration for RGB color sensor

* **`API_CALL_CODE.ino`**
  The main firmware that:

  * Connects ESP32 to WiFi
  * Reads data from sensors
  * Applies calibration formulas
  * Packages values into JSON
  * Sends data via HTTP POST to an **AWS API Gateway endpoint**

---

## ⚙️ Setup Instructions

1. **Install Arduino IDE**
   [Download Arduino IDE](https://www.arduino.cc/en/software) and add ESP32 board support.

2. **Install Required Libraries**

   * `WiFi.h`
   * `HTTPClient.h`
   * `ArduinoJson`
   * Sensor-specific libraries (Adafruit, DFRobot, etc.)

3. **Configure WiFi & API Endpoint**
   In `API_CALL_CODE.ino`, update:

   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* serverName = "https://<your-api-endpoint>";
   ```

4. **Upload Code**
   Choose **ESP32 Dev Module** under Tools → Board and upload the sketch you want to run.

---

## 📡 API Call Firmware Details

### Example JSON Payload

```json
{
  "device_id": "esp32_001",
  "timestamp": 1234567,
  "sensor_readings": {
    "pH": 7.12,
    "TDS_ppm": 245,
    "ORP_mV": 253,
    "Temperature_C": 25.1,
    "Color_R": 125,
    "Color_G": 81,
    "Color_B": 92
  },
  "source": "esp32"
}
```

### Workflow

1. ESP32 connects to WiFi.
2. Reads raw data from sensors.
3. Calibration values (from calibration sketches) are applied.
4. JSON payload is created with readings.
5. Data is sent via POST request to `serverName`.
6. Response code is logged to Serial Monitor.
7. Repeats every **10 seconds** (configurable).

---

## 🚀 Usage

* Run **calibration sketches** (`*_CALIB_CODE.ino`) one by one to obtain proper calibration factors.
* Update calibration constants in `API_CALL_CODE.ino`.
* Upload and run `API_CALL_CODE.ino` for live data transmission.
* Verify reception in **AWS API Gateway / Lambda logs**.