import os
import pandas as pd
import psycopg2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import joblib
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../backend/.env')

# Database connection
def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        # Fallback for local testing if .env loading fails
        db_url = "postgresql://shiv_admin:shiv_secure_pwd_2024@localhost:5432/shiv_furniture_db"
    return psycopg2.connect(db_url)

def fetch_analytical_accounts():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, code, name, description FROM analytical_accounts;')
    rows = cur.fetchall()
    conn.close()
    return pd.DataFrame(rows, columns=['id', 'code', 'name', 'description'])

def generate_mock_data(accounts_df):
    """
    Generates synthetic training data based on account codes/names
    """
    data = []
    
    # Define keywords for each account code to generate text
    keywords = {
        'CC001': ['sofa', 'wood', 'production', 'assemble', 'teak', 'fabric', 'glue', 'nails', 'polish'], # Production
        'CC002': ['raw material', 'purchase', 'timber', 'plywood', 'laminate', 'steel', 'foam'], # Raw Materials
        'CC003': ['labor', 'salary', 'wages', 'worker', 'carpenter', 'technician', 'sweeper'], # Labor
        'CC004': ['overhead', 'electricity', 'water', 'bill', 'rent', 'maintenance', 'repair', 'cleaning'], # Overhead
        'CC005': ['marketing', 'ad', 'facebook', 'google', 'promotion', 'banner', 'campaign', 'seo'], # Marketing
        'CC006': ['admin', 'stationery', 'office', 'paper', 'ink', 'courier', 'legal', 'audit'], # Administration
        'CC007': ['logistics', 'transport', 'delivery', 'fuel', 'truck', 'shipping', 'freight'], # Logistics
    }

    for _, row in accounts_df.iterrows():
        account_id = row['id']
        code = row['code']
        key_list = keywords.get(code, ['misc'])
        
        # Generate varied descriptions
        for _ in range(50): # 50 samples per category
            # Mix product name + partner name logic
            import random
            prod_term = random.choice(key_list)
            partner_term = "Vendor " + str(random.randint(1, 100))
            
            text = f"{prod_term} {random.choice(['supply', 'service', 'charge', 'cost'])}"
            
            data.append({
                'text': text, 
                'partner': partner_term,
                'amount': random.uniform(100, 10000),
                'analyticalAccountId': account_id,
                'accountName': row['name'] # For debugging/checking
            })
            
    return pd.DataFrame(data)

def train_and_save():
    print("Fetching accounts from DB...")
    try:
        accounts_df = fetch_analytical_accounts()
    except Exception as e:
        print(f"Failed to connect to DB: {e}")
        return

    print(f"Found {len(accounts_df)} accounts.")
    
    print("Generating synthetic training data...")
    train_df = generate_mock_data(accounts_df)
    
    # Feature Engineering: Combine text fields
    # We will use a simple implementation: specific text vectorization
    # For a real scenario, we might treat partner and product separately, 
    # but concatenating them is a robust baseline.
    train_df['combined_features'] = train_df['text'] + " " + train_df['partner']
    
    X = train_df['combined_features']
    y = train_df['analyticalAccountId']
    
    # Pipeline
    print("Training model...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    pipeline.fit(X, y)
    
    # Save artifacts
    print("Saving model artifacts...")
    joblib.dump(pipeline, 'model_pipeline.pkl')
    
    # Also save the account mapping (ID -> Name) for easy lookup in app.py
    account_map = accounts_df.set_index('id')['name'].to_dict()
    joblib.dump(account_map, 'account_map.pkl')
    
    print("Done!")

if __name__ == "__main__":
    train_and_save()
