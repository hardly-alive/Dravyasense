# PCB Files – Dravyasense

This directory contains the **Altium Designer project** for the Dravyasense IoT hardware.  
The design was built entirely from scratch to support the ESP32-based system and connected sensors.

---

## 📂 Contents
- `*.PrjPcb` → Main Altium PCB project file
- `*.PrjPcbStructure` → Defines the schematic/PCB hierarchy and document relationships
- `*.SchDoc` → Schematic documents
- `*.SchLib` → Custom schematic symbol libraries

---

## 🛠️ Tools Required
- [Altium Designer](https://www.altium.com/) v20 or later recommended
- Access to the included schematic libraries (`.SchLib`)

---

## 📝 Notes
- Represents the **MVP prototype hardware** of Dravyasense
- Pin mappings align with the ESP32 firmware in `../esp32-scripts/`
- Before fabrication:
  - Validate footprints and net assignments against sensors/modules
  - Run ERC (Electrical Rule Check) and DRC (Design Rule Check) in Altium
- Gerbers and fabrication outputs can be generated directly within Altium