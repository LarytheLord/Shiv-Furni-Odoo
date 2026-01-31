import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BudgetPieChart = ({ budgeted, achieved, size = 200 }) => {
    // If no budget, show empty state or grey ring
    if (!budgeted || budgeted <= 0) {
        return (
            <div className="flex items-center justify-center p-4 text-slate-400 text-xs text-center" style={{ height: size }}>
                No Data
            </div>
        );
    }

    const remaining = Math.max(0, budgeted - achieved);

    const data = [
        { name: 'Achieved', value: achieved },
        { name: 'Balance', value: remaining }
    ];

    const COLORS = ['#0ea5e9', '#fca5a5']; // Blue (Achieved), Redish (Balance) - matching design image vaguely
    // Design image: Blue (Achieved) left, Red (Balance) right, Split pie.
    // Use proper colors from provided image
    // Pie image: Right side is red (Balance), Left side is Blue (Achieved).

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-slate-200 shadow-lg rounded text-xs">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p>{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: size }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={size * 0.25}
                        outerRadius={size * 0.45}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={180}
                        endAngle={-180}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BudgetPieChart;
