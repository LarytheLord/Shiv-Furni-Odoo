import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ConflictResolutionModal({ billId, onClose, onResolve }) {
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (billId) fetchConflicts();
    }, [billId]);

    const fetchConflicts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/vendor-bills/${billId}/conflicts`);
            setConflicts(data.data.conflicts || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (suggestionId) => {
        try {
            await api.post('/ml/resolve', { suggestionId });
            // Remove resolved conflict from list
             const updated = conflicts.map(c => {
                 const remaining = c.suggestions.filter(s => s.id !== suggestionId); // Wait, if resolved, line is done?
                 // Usually fetching conflicts again is safer, or remove the line entirely if fully resolved.
                 // A line has multiple suggestions. If one is accepted, the conflict is resolved for that line.
                 // So remove the line from conflicts list.
                 return remaining.length > 0 && false ? c : null; // Logic depends on backend behavior.
                 // Backend sets status=ACCEPTED for one, REJECTED for others.
                 // So the line no longer has PENDING conflicts.
             }).filter(Boolean);
             
             // Just re-fetch or remove locally.
             // Remove the line that contained this suggestion.
             setConflicts(prev => prev.filter(line => !line.suggestions.find(s => s.id === suggestionId)));
             
             if (onResolve) onResolve();
             
             // If no more conflicts, close?
             // Checking length of PREV state is hard here.
             // Let's rely on re-render.
             if (conflicts.length <= 1) onClose(); 
        } catch (error) {
            console.error(error);
            alert('Failed to resolve conflict');
        }
    };

    if (!billId) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Review Categorization Suggestions</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-slate-500">Loading suggestions...</div>
                ) : conflicts.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No conflicts found. This bill looks good!
                        <button onClick={onClose} className="block mx-auto mt-4 text-indigo-600">Close</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {conflicts.map((line) => (
                            <div key={line.lineId} className="border rounded-lg p-4 bg-slate-50">
                                <div className="flex justify-between mb-3 border-b pb-2">
                                    <div>
                                        <div className="font-semibold text-slate-700">{line.productName}</div>
                                        <div className="text-xs text-slate-500">Amount: {line.amount}</div>
                                    </div>
                                    <div className="text-xs text-orange-600 font-bold uppercase tracking-wider">Uncertain</div>
                                </div>
                                <div className="text-sm text-slate-600 mb-2">The model suggested multiple categories. Please select the correct one:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {line.suggestions.map(s => (
                                        <div key={s.id} className="border bg-white p-3 rounded hover:border-indigo-500 cursor-pointer transition-colors relative group"
                                            onClick={() => handleSelect(s.id)}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-slate-800">{s.accountName}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${s.confidenceScore > 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {Math.round(s.confidenceScore * 100)}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Based on: {s.parametersUsed.join(', ')}
                                            </div>
                                            <button className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 bg-indigo-600 text-white text-xs px-3 py-1 rounded">
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
