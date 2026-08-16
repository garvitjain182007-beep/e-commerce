import React from 'react';
import { IndianRupee, ShoppingBag, Eye, Star, TrendingUp, ArrowUpRight } from 'lucide-react';
import { MOCK_SELLER_METRICS } from '@/data/mockData';
import { formatINR } from '@/lib/formatters';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
}

export function SellerMetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-charcoal-100 p-5 shadow-soft hover:shadow-hover transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-charcoal-900">{value}</span>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" />
          {change}
        </span>
      </div>
    </div>
  );
}

export function SellerMetricsGrid() {
  return (
    <div className="space-y-4">
      {/* Demo Data Banner */}
      <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span><strong>Demo Dashboard:</strong> Metrics shown below reflect realistic sample store analytics.</span>
        </div>
        <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Mock Data</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SellerMetricCard
          title="Total Revenue"
          value={formatINR(MOCK_SELLER_METRICS.totalRevenue)}
          change={MOCK_SELLER_METRICS.monthlyRevenueGrowth}
          icon={IndianRupee}
        />
        <SellerMetricCard
          title="Total Orders"
          value={MOCK_SELLER_METRICS.totalOrders.toString()}
          change={MOCK_SELLER_METRICS.monthlyOrderGrowth}
          icon={ShoppingBag}
        />
        <SellerMetricCard
          title="Store Views"
          value={MOCK_SELLER_METRICS.totalViews.toLocaleString()}
          change="+24%"
          icon={Eye}
        />
        <SellerMetricCard
          title="Average Rating"
          value={MOCK_SELLER_METRICS.averageRating.toString()}
          change="98% Positive"
          icon={Star}
        />
      </div>
    </div>
  );
}
