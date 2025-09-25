# Model Scripts – AI Training & Inference

This folder contains **Python scripts, datasets, and model artifacts** used to train and deploy the AI model that powers Dravyasense. The model analyzes IoT sensor readings to predict herbal purity and potential adulteration.

---

## 📂 Contents

* **`main-dataset.csv`**
  Primary dataset containing sensor readings and labeled outcomes for training.

* **Training Scripts**
  Python scripts to preprocess data, train ML models, and export artifacts.

* **Artifacts**
  Saved models, preprocessing pipelines, and evaluation metrics.

---

## ⚙️ Setup Instructions

1. **Create Virtual Environment**

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

2. **Install Dependencies**

```bash
pip install -r requirements.txt
```

3. **Dataset**
   Ensure `main-dataset.csv` is in the same directory. Update script paths if needed.

---

## 🚀 Training Workflow

1. **Preprocessing**

   * Handle missing values
   * Normalize/scale sensor readings
   * Encode categorical features if any

2. **Model Training**

   * Train ML model (e.g., Random Forest, XGBoost, Neural Net)
   * Validate using cross-validation
   * Save trained model as `.pkl` or `.joblib`

3. **Evaluation**

   * Evaluate accuracy, precision, recall, F1-score
   * Generate confusion matrix and ROC curve

4. **Export Artifacts**

   * Store trained model and preprocessing pipeline in `artifacts/`

---

## 🧪 Example Usage

### Train a Model

```bash
python train.py --data main-dataset.csv --out artifacts/model.pkl
```

### Run Inference

```bash
python predict.py --input sample_input.json --model artifacts/model.pkl
```

---

## 📌 Notes

* Ensure consistent preprocessing during training and inference.
* Update dataset regularly to improve model generalization.
* The exported model is packaged for deployment via **AWS Lambda layer**.