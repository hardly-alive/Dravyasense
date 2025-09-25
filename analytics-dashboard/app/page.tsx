// /app/page.tsx (Fully Responsive Version)
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { LatestScanDisplay } from "@/components/LatestScanDisplay";
import {
	ClipboardList,
	Timer,
	ShieldAlert,
	Leaf,
	ArrowRight,
} from "lucide-react";
import { animate } from "framer-motion";

const API_BASE_URL = "https://2emj712evi.execute-api.ap-south-1.amazonaws.com";

// Types
interface HerbStandard {
	herb_name: string;
	avg_pH: number;
	avg_tds: number;
	avg_orp: number;
	avg_temp: number;
	avg_red: number; // <-- Moved to top level
	avg_green: number; // <-- Moved to top level
	avg_blue: number; // <-- Moved to top level
	quality_threshold: number;
}
interface ScanHistory {
	scan_id: string;
	timestamp: number;
	herb_name: string;
	confidence: number;
	adultaration_alert: boolean;
	sensor_data: string;
}
interface Stats {
	totalTests: number;
	recentTests: number;
	adulterationRate: number;
}

// AnimatedNumber component with responsive text size
function AnimatedNumber({ to, suffix = "" }: { to: number; suffix?: string }) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const node = ref.current;
		if (node) {
			const controls = animate(0, to, {
				duration: 1.5,
				ease: "easeOut",
				onUpdate(value) {
					node.textContent = value.toFixed(0) + suffix;
				},
			});
			return () => controls.stop();
		}
	}, [to, suffix]);
	// RESPONSIVE CHANGE: Font size scales up on larger screens
	return (
		<div
			ref={ref}
			className='text-2xl sm:text-3xl font-bold text-white'>
			0
		</div>
	);
}

export default function DashboardPage() {
	const [referenceHerbs, setReferenceHerbs] = useState<HerbStandard[]>([]);
	const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Fetching logic remains the same
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				const [statsRes, standardsRes, historyRes] = await Promise.all([
					fetch(`${API_BASE_URL}/stats`),
					fetch(`${API_BASE_URL}/standards`),
					fetch(`${API_BASE_URL}/history?limit=5`),
				]);

				if (!statsRes.ok)
					throw new Error(`Failed to fetch stats: ${statsRes.status}`);
				if (!standardsRes.ok)
					throw new Error(`Failed to fetch standards: ${standardsRes.status}`);
				if (!historyRes.ok)
					throw new Error(`Failed to fetch history: ${historyRes.status}`);

				const statsData = await statsRes.json();
				const standardsData = await standardsRes.json();
				const historyData = await historyRes.json();

				setStats(statsData);
				setReferenceHerbs(standardsData.items || []);
				setScanHistory(historyData.items || []);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "An unknown error occurred";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<div className='space-y-6 md:space-y-8 animate-in fade-in-50 duration-500'>
			{/* RESPONSIVE CHANGE: Font size scales up on larger screens */}
			<h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-white'>
				Dashboard Overview
			</h1>

			{error && (
				<div className='bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-md'>
					{error}
				</div>
			)}

			{/* Stats Overview Grid - Already responsive with `md:grid-cols-3` */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<Card className='bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-colors duration-300'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-slate-400'>
							Total Tests
						</CardTitle>
						<ClipboardList className='h-5 w-5 text-blue-400' />
					</CardHeader>
					<CardContent>
						{loading || !stats ? (
							<Skeleton className='h-8 w-16 bg-slate-700' />
						) : (
							<AnimatedNumber to={stats.totalTests} />
						)}
					</CardContent>
				</Card>
				<Card className='bg-slate-900/50 border-slate-800 hover:border-yellow-500/50 transition-colors duration-300'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-slate-400'>
							Recent Tests (24h)
						</CardTitle>
						<Timer className='h-5 w-5 text-yellow-400' />
					</CardHeader>
					<CardContent>
						{loading || !stats ? (
							<Skeleton className='h-8 w-16 bg-slate-700' />
						) : (
							<AnimatedNumber to={stats.recentTests} />
						)}
					</CardContent>
				</Card>
				<Card className='bg-slate-900/50 border-slate-800 hover:border-red-500/50 transition-colors duration-300'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-slate-400'>
							Adulteration Rate
						</CardTitle>
						<ShieldAlert className='h-5 w-5 text-red-400' />
					</CardHeader>
					<CardContent>
						{loading || !stats ? (
							<Skeleton className='h-8 w-16 bg-slate-700' />
						) : (
							<AnimatedNumber
								to={stats.adulterationRate}
								suffix='%'
							/>
						)}
					</CardContent>
				</Card>
			</div>

			<LatestScanDisplay />

			{/* RESPONSIVE CHANGE: Grid now breaks at `md` instead of `lg` for better tablet view */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
				<div className='md:col-span-2'>
					<Card className='bg-slate-900 border-slate-800'>
						<CardHeader>
							<CardTitle className='text-slate-200'>
								Reference Herb Data
							</CardTitle>
						</CardHeader>
						<CardContent>
							{loading ? (
								<Skeleton className='h-40 w-full bg-slate-800' />
							) : (
								// RESPONSIVE CHANGE: Added overflow-x-auto as a safety measure and hidden columns on small screens
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader>
											<TableRow className='border-slate-800 hover:bg-transparent'>
												<TableHead className='text-slate-400 uppercase tracking-wider'>
													Herb
												</TableHead>
												<TableHead className='text-slate-400 uppercase tracking-wider text-right'>
													pH
												</TableHead>
												<TableHead className='hidden sm:table-cell text-slate-400 uppercase tracking-wider text-right'>
													TDS
												</TableHead>
												<TableHead className='hidden md:table-cell text-slate-400 uppercase tracking-wider text-right'>
													ORP
												</TableHead>
												<TableHead className='hidden md:table-cell text-slate-400 uppercase tracking-wider text-center'>
													Temp
												</TableHead>
												<TableHead className='hidden md:table-cell text-slate-400 uppercase tracking-wider text-center'>
													RGB
												</TableHead>
												<TableHead className='hidden md:table-cell text-slate-400 uppercase tracking-wider text-right'>
													Threshold
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{referenceHerbs.map((herb) => (
												<TableRow
													key={herb.herb_name}
													className='border-slate-800 even:bg-slate-800/50 hover:bg-slate-700/50'>
													<TableCell className='font-medium text-white'>
														{herb.herb_name}
													</TableCell>
													<TableCell className='text-right text-slate-300'>
														{herb.avg_pH.toFixed(1)}
													</TableCell>
													<TableCell className='hidden sm:table-cell text-right text-slate-300'>
														{herb.avg_tds}
													</TableCell>
													<TableCell className='hidden md:table-cell text-right text-slate-300'>
														{herb.avg_orp}
													</TableCell>
													<TableCell className='hidden md:table-cell text-center text-slate-300'>
														{herb.avg_temp}
													</TableCell>
													<TableCell className='hidden md:table-cell text-center text-slate-300'>
														({herb.avg_red},{herb.avg_green},{herb.avg_blue})
													</TableCell>
													<TableCell className='hidden md:table-cell text-center text-slate-300'>
														{herb.quality_threshold}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className='md:col-span-1'>
					{/* This component is already mobile-friendly */}
					<Card className='bg-slate-900 border-slate-800'>
						<CardHeader>
							<CardTitle className='text-slate-200'>Recent Scans</CardTitle>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className='space-y-4'>
									<Skeleton className='h-12 w-full bg-slate-800' />
									<Skeleton className='h-12 w-full bg-slate-800' />
									<Skeleton className='h-12 w-full bg-slate-800' />
								</div>
							) : (
								<div className='space-y-2 divide-y divide-slate-800'>
									{scanHistory.map((scan) => (
										<div
											key={scan.scan_id}
											className='flex items-center justify-between pt-2'>
											<div className='flex items-center gap-3'>
												<Leaf className='h-5 w-5 text-emerald-500 flex-shrink-0' />
												<div>
													<p className='font-semibold text-white'>
														{scan.herb_name}
													</p>
													<p className='text-xs text-slate-400'>
														{new Date(
															scan.timestamp * 1000
														).toLocaleDateString()}
													</p>
												</div>
											</div>
											<div
												className={`px-2 py-1 text-xs font-semibold rounded-full ${
													scan.adultaration_alert
														? "bg-red-500/20 text-red-400"
														: "bg-green-500/20 text-green-400"
												}`}>
												{(scan.confidence * 100).toFixed(1)}%
											</div>
										</div>
									))}
								</div>
							)}
							<Button
								asChild
								variant='outline'
								className='w-full mt-6 bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 hover:text-white text-slate-300 transition-colors'>
								<Link href='/history'>
									View Full History
									<ArrowRight className='ml-2 h-4 w-4' />
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
