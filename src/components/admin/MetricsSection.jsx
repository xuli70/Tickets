
import React from 'react';
import { motion } from 'framer-motion';
import { Euro, Ticket as TicketIcon, CheckCircle } from 'lucide-react';

const MetricCard = ({ icon: Icon, title, value, gradient }) => (
  <motion.div 
    className={`rounded-lg p-3 text-white shadow-md ${gradient} flex items-center`}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Icon className="w-6 h-6 opacity-90 mr-3" />
    <div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{title}</div>
    </div>
  </motion.div>
);

const MetricsSection = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-2.5">
      <MetricCard icon={Euro} title="Ventas Totales" value={`€${metrics.totalSales.toFixed(2)}`} gradient="bg-gradient-to-br from-sky-500 to-indigo-600" />
      <MetricCard icon={TicketIcon} title="Tickets Vendidos" value={metrics.ticketsSold} gradient="bg-gradient-to-br from-emerald-500 to-green-600" />
      <MetricCard icon={CheckCircle} title="Consumiciones" value={metrics.totalConsumptions} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
    </div>
  );
};

export default MetricsSection;