from flask import Flask, request, jsonify
import joblib
import os
import sys

app = Flask(__name__)

# Load Model Artifacts
MODEL_PATH = 'model_pipeline.pkl'
MAP_PATH = 'account_map.pkl'

print("Loading model artifacts...")
try:
    if os.path.exists(MODEL_PATH) and os.path.exists(MAP_PATH):
        pipeline = joblib.load(MODEL_PATH)
        account_map = joblib.load(MAP_PATH)
        print("Model loaded successfully.")
    else:
        print("Model artifacts not found. Please run train_model.py first.")
        pipeline = None
        account_map = {}
except Exception as e:
    print(f"Error loading model: {e}")
    pipeline = None
    account_map = {}

@app.route('/predict', methods=['POST'])
def predict():
    if not pipeline:
         return jsonify({'status': 'error', 'message': 'Model not loaded'}), 503

    data = request.json
    
    product_name = data.get('productName', '')
    partner_name = data.get('partnerName', '')
    # Amount unused in this simple text classifier, but could be added as feature
    
    # Preprocess same as training
    text_feature = f"{product_name} {partner_name}"
    
    try:
        # Get probabilities
        probs = pipeline.predict_proba([text_feature])[0]
        
        # Get class labels (which are account IDs)
        classes = pipeline.classes_
        
        # Create list of (id, prob) tuples
        results = []
        for i, class_label in enumerate(classes):
            results.append({
                'accountId': class_label,
                'accountName': account_map.get(class_label, 'Unknown'),
                'confidence': float(probs[i])
            })
            
        # Sort by confidence desc
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Logic: If diff between top 1 and top 2 is < 0.15, return both (or more?)
        # Requirement: "trigger a conflict resolution flag in the frontend" 
        # -> We will return the relevant top suggestions.
        
        final_suggestions = []
        
        if not results:
             return jsonify({'suggestions': []})

        top1 = results[0]
        final_suggestions.append(top1)
        
        if len(results) > 1:
            top2 = results[1]
            if (top1['confidence'] - top2['confidence']) < 0.15:
                # Conflict detected!
                final_suggestions.append(top2)
                # Maybe include top3 if very close? 
                # Strict reading: "both must be returned" -> usually implies top 2.
                
        return jsonify({'suggestions': final_suggestions})

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': pipeline is not None})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
