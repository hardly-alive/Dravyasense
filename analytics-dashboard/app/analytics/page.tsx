// /app/analytics/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	LineChart,
	Line,
} from "recharts";
import { AlertCircle, BarChart3 } from "lucide-react";

const API_BASE_URL = "https://2emj712evi.execute-api.ap-south-1.amazonaws.com";

// Define the structure of a scan
interface Scan {
	scan_id: string;
	timestamp: number;
	herb_name: string;
	adultaration_alert: boolean;
}

interface HerbChartData {
  name: string;
  'Adulteration Rate': number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: HerbChartData; // The original data item
  }>;
  label?: string;
}


// Custom Tooltip for charts for better styling
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-md text-sm text-white">
        <p className="font-bold">{label}</p>
        <p className="text-slate-300">
          {`${payload[0].name}: ${payload[0].value.toFixed(1)}%`}
        </p>
      </div>
    );
  }

  return null;
};


export default function AnalyticsPage() {
	const [scans, setScans] = useState<Scan[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAllScans = async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await fetch(`${API_BASE_URL}/history`); // Fetch all history
				if (!res.ok) {
					throw new Error(`Failed to fetch analytics data: ${res.status}`);
				}
				const data = await res.json();
				setScans(data.items || []);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unknown error occurred"
				);
			} finally {
				setLoading(false);
			}
		};
		fetchAllScans();
	}, []);

	// Use useMemo to process data only when scans change, improving performance
	const analyticsData = useMemo(() => {
		if (scans.length === 0) return null;

		// 1. Overall Stats
		const totalScans = scans.length;
		const totalAdulterated = scans.filter((s) => s.adultaration_alert).length;
		const overallAdulterationRate = (totalAdulterated / totalScans) * 100;

		// 2. Data for Adulteration by Herb Chart
		const scansByHerb: {
			[key: string]: { total: number; adulterated: number };
		} = {};
		scans.forEach((scan) => {
			if (!scansByHerb[scan.herb_name]) {
				scansByHerb[scan.herb_name] = { total: 0, adulterated: 0 };
			}
			scansByHerb[scan.herb_name].total++;
			if (scan.adultaration_alert) {
				scansByHerb[scan.herb_name].adulterated++;
			}
		});

		const adulterationRateByHerb = Object.entries(scansByHerb)
			.map(([name, data]) => ({
				name,
				"Adulteration Rate": (data.adulterated / data.total) * 100,
			}))
			.sort((a, b) => b["Adulteration Rate"] - a["Adulteration Rate"]);

		// 3. Data for Scan Volume Chart
		const scansByDate: { [key: string]: number } = {};
		scans.forEach((scan) => {
			const date = new Date(scan.timestamp * 1000).toLocaleDateString("en-CA"); // YYYY-MM-DD
			scansByDate[date] = (scansByDate[date] || 0) + 1;
		});
		const scanVolume = Object.entries(scansByDate)
			.map(([date, count]) => ({ date, count }))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		// 4. Data for Pie Chart
		const purityDistribution = [
			{ name: "Pure", value: totalScans - totalAdulterated },
			{ name: "Adulterated", value: totalAdulterated },
		];

		return {
			totalScans,
			overallAdulterationRate,
			adulterationRateByHerb,
			scanVolume,
			purityDistribution,
		};
	}, [scans]);

	if (loading) {
		return (
			<div>
				<h1 className='text-3xl font-bold tracking-tight text-white mb-6'>
					Analytics
				</h1>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					<Skeleton className='h-24 w-full bg-slate-800' />
					<Skeleton className='h-24 w-full bg-slate-800' />
					<Skeleton className='h-96 col-span-1 md:col-span-2 lg:col-span-4 w-full bg-slate-800' />
				</div>
			</div>
		);
	}

	if (error) {
		return <p className='text-center text-red-400'>{error}</p>;
	}

	if (!analyticsData) {
		return (
			<p className='text-center text-slate-400'>
				No scan data available to generate analytics.
			</p>
		);
	}

	const PIE_COLORS = ["#10b981", "#ef4444"]; // Emerald for Pure, Red for Adulterated

	return (
		<div className='space-y-8 animate-in fade-in-50 duration-500'>
			<h1 className='text-3xl font-bold tracking-tight text-white'>
				Scan Analytics
			</h1>

			{/* KPI Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<Card className='bg-slate-900 border-slate-800'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-slate-400'>
							Total Scans
						</CardTitle>
						<BarChart3 className='h-5 w-5 text-slate-500' />
					</CardHeader>
					<CardContent>
						<div className='text-3xl font-bold text-white'>
							{analyticsData.totalScans}
						</div>
					</CardContent>
				</Card>
				<Card className='bg-slate-900 border-slate-800'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-slate-400'>
							Overall Adulteration
						</CardTitle>
						<AlertCircle className='h-5 w-5 text-red-500' />
					</CardHeader>
					<CardContent>
						<div className='text-3xl font-bold text-white'>
							{analyticsData.overallAdulterationRate.toFixed(1)}%
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Charts */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<Card className='lg:col-span-2 bg-slate-900 border-slate-800'>
					<CardHeader>
						<CardTitle className='text-slate-200'>
							Adulteration Rate by Herb
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer
							width='100%'
							height={300}>
							<BarChart data={analyticsData.adulterationRateByHerb}>
								<XAxis
									dataKey='name'
									stroke='#94a3b8'
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke='#94a3b8'
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => `${value}%`}
								/>
								<Tooltip
									content={<CustomTooltip />}
									cursor={{ fill: "rgba(100, 116, 139, 0.1)" }}
								/>
								<Bar
									dataKey='Adulteration Rate'
									fill='#ef4444'
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className='bg-slate-900 border-slate-800'>
					<CardHeader>
						<CardTitle className='text-slate-200'>
							Purity Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer
							width='100%'
							height={300}>
							<PieChart>
								<Pie
									data={analyticsData.purityDistribution}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={100}
									label>
									{analyticsData.purityDistribution.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={PIE_COLORS[index % PIE_COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip cursor={{ fill: "rgba(100, 116, 139, 0.1)" }} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<Card className='bg-slate-900 border-slate-800'>
				<CardHeader>
					<CardTitle className='text-slate-200'>
						Scan Volume Over Time
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer
						width='100%'
						height={300}>
						<LineChart data={analyticsData.scanVolume}>
							<XAxis
								dataKey='date'
								stroke='#94a3b8'
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke='#94a3b8'
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#1e293b",
									border: "1px solid #334155",
									borderRadius: "0.5rem",
								}}
							/>
							<Line
								type='monotone'
								dataKey='count'
								stroke='#34d399'
								strokeWidth={2}
								dot={false}
								name='Scans'
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}
