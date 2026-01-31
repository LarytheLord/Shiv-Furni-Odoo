import axios from 'axios';

export const getMLCategorization = async (data: any): Promise<any> => {
    // Send parameters selected by user (Product, Partner, Amount, etc.)
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000/predict';

    try {
        const response = await axios.post(mlUrl, data);
        return response.data; // Should return top 2 suggestions + confidence scores: { suggestions: [{ accountId, accountName, confidence }, ...] }
    } catch (error) {
        console.error('ML Service Error:', error);
        // Return empty or null to signal failure
        return { suggestions: [] };
    }
};
