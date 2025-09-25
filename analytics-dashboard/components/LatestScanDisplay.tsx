'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, animate } from "framer-motion"; // <-- Import motion and animate

const API_BASE_URL = 'https://2emj712evi.execute-api.ap-south-1.amazonaws.com';

// The data structure for the latest scan
interface LatestScan {
  scan_id: string;
  timestamp: number;
  herb_name: string;
  confidence: number;
  adulteration_alert: boolean;
  sensor_data: string | { [key: string]: number };
}

// A completely redesigned and animated Circular Progress component
const CircularProgress = ({ progress, status }: { progress: number, status: 'success' | 'danger' }) => {
  const countRef = useRef<HTMLSpanElement>(null);
  const stroke = 8;
  const radius = 65;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const node = countRef.current;
    if (node) {
      // Animate the percentage number counting up
      const controls = animate(0, progress, {
        duration: 1.5,
        delay: 0.5,
        ease: "easeInOut",
        onUpdate(value) {
          node.textContent = value.toFixed(1) + "%";
        },
      });
      return () => controls.stop();
    }
  }, [progress]);

  const color = status === 'success' ? 'text-emerald-400' : 'text-red-500';

  return (
    // FIX: Using a CSS Grid layout to perfectly center the text over the SVG
    <div className="grid place-items-center">
      <motion.svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 col-start-1 row-start-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <circle
          className="text-slate-700"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          className={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          // The magic for the drawing animation!
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        />
      </motion.svg>
      {/* The text now also sits in the same grid cell, perfectly centered */}
      <span ref={countRef} className={cn("col-start-1 row-start-1 text-2xl font-bold", color)}>
        0.0%
      </span>
    </div>
  );
};

// The main component remains largely the same, just using the improved progress circle
export function LatestScanDisplay() {
  const [latestScan, setLatestScan] = useState<LatestScan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestScan = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/history?limit=1`);
        if (!res.ok) throw new Error("Could not connect to API.");
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setLatestScan(data.items[0]);
        } else {
          setError("No scan history found.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestScan();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex w-full gap-8">
            <div className="flex-1 space-y-4"><Skeleton className="h-12 w-3/4 bg-slate-700" /><Skeleton className="h-32 w-32 rounded-full bg-slate-700" /></div>
            <div className="flex-1 grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full bg-slate-700" /><Skeleton className="h-20 w-full bg-slate-700" />
                <Skeleton className="h-20 w-full bg-slate-700" /><Skeleton className="h-20 w-full bg-slate-700" />
            </div>
        </div>
      );
    }
    
    // ... the rest of your renderContent function remains the same
    if (error || !latestScan) {
      return <p className="text-center font-medium text-yellow-400">{error || "Could not load data."}</p>;
    }

    let sensorDataObject: { [key: string]: number } = {};
    try {
      sensorDataObject = typeof latestScan.sensor_data === 'string' ? JSON.parse(latestScan.sensor_data) : latestScan.sensor_data;
    } catch (e) {
        // FIX: Log the parsing error and use the variable 'e'
        console.error("Failed to parse sensor data:", e);
        return <p className="text-center font-medium text-red-700">Error: Malformed sensor data.</p>;
    }
    
    const isAdulterated = latestScan.adulteration_alert;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
        {/* Left Side: The Prediction */}
        <div className="flex flex-col items-center text-center md:text-left md:scale-130">
          <p className="text-sm font-semibold text-slate-400">Prediction Result</p>
          <p className="text-4xl lg:text-5xl font-extrabold text-emerald-600 my-2">{latestScan.herb_name}</p>
          <div className="my-4">
            <CircularProgress progress={latestScan.confidence * 100} status={isAdulterated ? 'danger' : 'success'} />
            <p className="text-sm text-slate-400 mt-2 font-semibold">Confidence Score</p>
          </div>
          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold", isAdulterated ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400')}>
            {isAdulterated ? <AlertTriangle size={16} className="animate-caret-blink"/> : <CheckCircle size={16} />}
            <span>{isAdulterated ? 'Adulteration Detected' : 'Quality Passed'}</span>
          </div>
        </div>

        {/* Right Side: The Sensor Evidence */}
        <div>
          <h4 className="font-semibold text-slate-300 mb-3">Sensor Readings</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(sensorDataObject).map(([key, value]) => (
              <div key={key} className="bg-slate-800/80 p-4 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider">{key}</p>
                <p className="text-2xl font-bold text-white">{value?.toFixed(2) ?? 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // The main card styling remains the same
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-slate-200">Latest Scan Analysis</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[280px] flex items-center justify-center p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}