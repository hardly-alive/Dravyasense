# DravyaSense – AI-Powered Herbal Purity Analysis

*A real-time IoT + AI system for detecting herbal adulteration.*

---

## 📍 Problem

The herbal and medicinal product market faces widespread **adulteration**:

* Genuine herbs mixed with fillers, substitutes, or harmful chemicals
* Trust issues for consumers
* Potential health risks
* Traditional lab testing is slow, expensive, and inaccessible

---

## 💡 Our Solution

DravyaSense provides a **low-cost, real-time, and scalable purity testing platform**:

1. **IoT Hardware (ESP32 + Sensors)**
   Collects pH, TDS, ORP, Temperature, and RGB data from herbal samples.

2. **AI Model**
   Generates a **digital fingerprint** for authentic herbs. Predicts purity/adulteration risk using machine learning.

3. **Web Dashboard**
   Displays results instantly with charts, trends, and history. Runs on a cloud-backed serverless architecture.

---

## 🖼️ System Architecture

*(Insert diagram from `media/architecture.png` here)*

---

## 📂 Repository Structure

```
/dravyasense
│
├── analytics-dashboard/        # Next.js web app (dashboard & visualization)
├── esp32-scripts/              # Firmware for ESP32 sensor integration
├── model-scripts/              # AI training + inference scripts, model artifacts
├── pcb-files/                  # Altium schematic & PCB design files
├── media/                      # Screenshots, schematics, and diagrams
└── potency-prediction-layer.zip # AWS Lambda layer for model deployment
```

Each folder has its own **README** with setup instructions.

---

## 🚀 Quickstart

Clone the repo:

```bash
git clone <repo-url>
cd dravyasense
```

Then follow instructions in:

* [`analytics-dashboard/`](./analytics-dashboard/README.md) → Run the dashboard
* [`esp32-scripts/`](./esp32-scripts/README.md) → Upload firmware to ESP32
* [`model-scripts/`](./model-scripts/README.md) → Train/run the model

---

## 🌐 Deployment

* **ESP32** pushes data to the cloud
* **AWS Lambda** processes predictions via packaged layer
* **Vercel** hosts the dashboard (CI/CD enabled)

---

## 📌 Roadmap

* Add multi-sensor calibration & data pipelines
* Improve model generalization with larger datasets
* PCB v2 with optimized footprint
* Automated CI/CD pipelines across all components

---

## 🧑‍💻 SIH Team

* Jehkaran Singh – IoT Hardware Integration
* Devansh Sharma – Cloud & Full-Stack Development
* Indrajith Gopinathan – AI/ML Engineering
* Tejas Sharma – Sensor Calibration & Testing
* Sambridhi Sinha – Documentation & Presentation
* Aditya Bisht – Research & Support
