"use client";

import { useState, useEffect, Fragment, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
	CheckCircle,
	AlertTriangle,
	ChevronDown,
	ChevronRight,
	Filter,
	Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectItem,
	SelectContent,
} from "@/components/ui/select";

const API_BASE_URL = "https://2emj712evi.execute-api.ap-south-1.amazonaws.com";

type StatusFilter = "all" | "passed" | "adulterated";

// Define the data structure for a single scan history item
interface ScanHistory {
	scan_id: string;
	timestamp: number;
	herb_name: string;
	confidence: number;
	adultaration_alert: boolean;
	sensor_data: string; // The data comes in as a JSON string
}

export default function HistoryPage() {
	const [history, setHistory] = useState<ScanHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedRow, setExpandedRow] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "passed" | "adulterated"
	>("all");

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				setLoading(true);
				setError(null);
				// Fetch ALL history, so we don't add a limit parameter
				const res = await fetch(`${API_BASE_URL}/history`);
				if (!res.ok) {
					throw new Error(`Failed to fetch scan history: ${res.status}`);
				}
				const data = await res.json();
				setHistory(data.items || []);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "An unknown error occurred";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};
		fetchHistory();
	}, []);

	// Filter and sort history based on search and filters
	const filteredHistory = useMemo(() => {
		return history
			.filter((item) => {
				const matchesSearch = item.herb_name
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
				const matchesStatus =
					statusFilter === "all" ||
					(statusFilter === "passed" && !item.adultaration_alert) ||
					(statusFilter === "adulterated" && item.adultaration_alert);

				return matchesSearch && matchesStatus;
			})
			.sort((a, b) => b.timestamp - a.timestamp); // Newest first
	}, [history, searchTerm, statusFilter]);

	const handleRowClick = useCallback((scanId: string) => {
		setExpandedRow((prev) => (prev === scanId ? null : scanId));
	}, []);

	const exportToCSV = useCallback(() => {
		const headers = [
			"Scan ID",
			"Herb Name",
			"Date",
			"Confidence",
			"Result",
			"Sensor Data",
		];
		const csvData = filteredHistory.map((item) => [
			item.scan_id,
			item.herb_name,
			new Date(item.timestamp * 1000).toLocaleString(),
			`${(item.confidence * 100).toFixed(1)}%`,
			item.adultaration_alert ? "Adulterated" : "Quality Passed",
			item.sensor_data,
		]);

		const csvContent = [
			headers.join(","),
			...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "scan-history.csv";
		a.click();
		URL.revokeObjectURL(url);
	}, [filteredHistory]);

	const renderSkeleton = () => (
		<div className='space-y-2'>
			{[...Array(5)].map((_, i) => (
				<Skeleton
					key={i}
					className='h-12 w-full bg-slate-800'
				/>
			))}
		</div>
	);

	return (
		<div className='animate-in fade-in-50 duration-500'>
			<div className='flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between mb-6'>
				<h1 className='text-3xl font-bold tracking-tight text-white'>
					Full Scan History
				</h1>

				{/* Container for all filter controls */}
				<div className='flex flex-col w-full sm:flex-row sm:w-auto items-stretch gap-3'>
					{/* Search Input */}
					<div className='relative flex-grow'>
						<Filter className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
						<Input
							placeholder='Search herbs...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='h-9 w-full rounded-md border-slate-700 bg-slate-800/80 pl-10 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus-visible:ring-emerald-500/50'
						/>
					</div>

					<div className='flex gap-3'>
						{/* NEW: Replaced <select> with shadcn/ui Select component */}
						<Select
							value={statusFilter}
							onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
							<SelectTrigger className='h-10 w-[180px] rounded-md border-slate-700 bg-slate-800/80 text-white focus:ring-emerald-500/50'>
								<SelectValue placeholder='Filter by result' />
							</SelectTrigger>
							<SelectContent className='border-slate-700 bg-slate-800 text-white'>
								<SelectItem value='all'>All Results</SelectItem>
								<SelectItem value='passed'>Quality Passed</SelectItem>
								<SelectItem value='adulterated'>Adulterated</SelectItem>
							</SelectContent>
						</Select>

						{/* Polished Export Button */}
						<Button
							onClick={exportToCSV}
							variant='outline'
							className='h-9 rounded-md border-slate-700 bg-slate-800/80 text-slate-300 transition-colors hover:border-emerald-500/50 hover:bg-slate-700/50 hover:text-white'>
							<Download className='mr-2 h-4 w-4' />
							Export
						</Button>
					</div>
				</div>
			</div>

			<Card className='bg-slate-900 border-slate-800'>
				<CardContent className='pt-6'>
					{loading && renderSkeleton()}

					{error && (
						<div className='text-center p-6'>
							<p className='text-red-400 mb-2'>{error}</p>
							<Button
								onClick={() => window.location.reload()}
								variant='outline'
								className='bg-slate-800 border-slate-700 text-white hover:bg-slate-700'>
								Try Again
							</Button>
						</div>
					)}

					{!loading && !error && (
						<>
							<div className='mb-4 text-sm text-slate-400'>
								Showing {filteredHistory.length} of {history.length} scans
							</div>

							<div className='overflow-auto max-h-[70vh] rounded-lg border border-slate-800 pr-2'>
								<Table className='relative'>
									<TableHeader className='sticky top-0 bg-slate-800 z-10'>
										<TableRow className='border-slate-700 hover:bg-transparent'>
											<TableHead className='w-12 bg-slate-800'></TableHead>
											<TableHead className='text-slate-400 uppercase tracking-wider bg-slate-800'>
												Herb Name
											</TableHead>
											<TableHead className='text-slate-400 uppercase tracking-wider bg-slate-800'>
												Date
											</TableHead>
											<TableHead className='text-slate-400 uppercase tracking-wider text-right bg-slate-800'>
												Confidence
											</TableHead>
											<TableHead className='text-slate-400 uppercase tracking-wider text-right bg-slate-800'>
												Result
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredHistory.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={5}
													className='text-center text-slate-400 py-6'>
													No scan history found{" "}
													{searchTerm ? `for "${searchTerm}"` : ""}
												</TableCell>
											</TableRow>
										) : (
											filteredHistory.map((scan) => {
												const isExpanded = expandedRow === scan.scan_id;
												const isAdulterated = scan.adultaration_alert;

												// Parse sensor data safely
												let sensorDataParsed: { [key: string]: number } = {};
												try {
													sensorDataParsed = JSON.parse(scan.sensor_data);
												} catch {
													// Handle cases where sensor_data might not be valid JSON
												}

												return (
													<Fragment key={scan.scan_id}>
														{/* Main Clickable Row */}
														<TableRow
															className='border-slate-800 cursor-pointer even:bg-slate-800/50 hover:bg-slate-700/50'
															onClick={() => handleRowClick(scan.scan_id)}>
															<TableCell>
																{isExpanded ? (
																	<ChevronDown className='text-slate-400' />
																) : (
																	<ChevronRight className='text-slate-400' />
																)}
															</TableCell>
															<TableCell className='font-medium text-white'>
																{scan.herb_name}
															</TableCell>
															<TableCell className='text-slate-300'>
																{new Date(
																	scan.timestamp * 1000
																).toLocaleString()}
															</TableCell>
															<TableCell className='text-right font-semibold text-white'>
																{(scan.confidence * 100).toFixed(1)}%
															</TableCell>
															<TableCell className='text-right'>
																<div
																	className={cn(
																		"inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
																		isAdulterated
																			? "bg-red-500/10 text-red-400"
																			: "bg-green-500/10 text-green-400"
																	)}>
																	{isAdulterated ? (
																		<AlertTriangle size={14} />
																	) : (
																		<CheckCircle size={14} />
																	)}
																	{isAdulterated
																		? "Adulterated"
																		: "Quality Passed"}
																</div>
															</TableCell>
														</TableRow>

														{/* Collapsible Row with Sensor Details */}
														{isExpanded && (
															<TableRow className='bg-slate-950 hover:bg-slate-950'>
																<TableCell
																	colSpan={5}
																	className='p-0'>
																	<div className='p-6'>
																		<h4 className='text-md font-semibold text-white mb-3'>
																			Sensor Data Breakdown
																		</h4>
																		<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
																			{Object.entries(sensorDataParsed).map(
																				([key, value]) => (
																					<div
																						key={key}
																						className='bg-slate-800/80 p-3 rounded-md'>
																						<p className='text-xs text-slate-400 uppercase'>
																							{key}
																						</p>
																						<p className='text-lg font-bold text-white'>
																							{value.toFixed(2)}
																						</p>
																					</div>
																				)
																			)}
																		</div>
																	</div>
																</TableCell>
															</TableRow>
														)}
													</Fragment>
												);
											})
										)}
									</TableBody>
								</Table>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
