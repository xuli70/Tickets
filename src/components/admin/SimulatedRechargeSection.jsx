
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Coins, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const SimulatedRechargeSection = ({ onSimulateRecharge, currentBalance }) => {
  const [amount, setAmount] = useState('10');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setAmount(value);
    }
  };

  const handleSimulate = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Cantidad Inválida",
        description: "Por favor, introduce un número positivo para la recarga.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const result = await onSimulateRecharge(numericAmount);
    setIsProcessing(false);

    if (result && result.success) {
      toast({
        title: "Recarga Simulada Exitosa",
        description: `€${numericAmount.toFixed(2)} añadidos al saldo. Nuevo saldo: €${result.newBalance.toFixed(2)}`,
        className: "bg-blue-500 text-white border-blue-600"
      });
      setAmount('10'); 
    } else {
      toast({
        title: "Error en Recarga Simulada",
        description: result?.error || "No se pudo completar la recarga simulada.",
        variant: "destructive",
      });
    }
  };

  const presetAmounts = [5, 10, 20, 50, 100];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-3 shadow-lg border border-border/50"
    >
      <h3 className="text-base font-semibold text-primary mb-2 flex items-center">
        <Coins className="w-4 h-4 mr-1.5" /> Simular Recarga de Saldo
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">
        Esta herramienta permite añadir saldo virtualmente para probar la aplicación sin usar Stripe.
        El saldo actual es: <span className="font-semibold text-secondary">€{currentBalance.toFixed(2)}</span>.
      </p>
      
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {presetAmounts.map((preset) => (
          <Button
            key={preset}
            variant={parseFloat(amount) === preset ? "default" : "outline"}
            onClick={() => setAmount(String(preset))}
            className={`h-7 text-[10px] font-medium transition-all duration-200 ${parseFloat(amount) === preset ? 'gradient-button-primary scale-105' : 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'}`}
            disabled={isProcessing}
          >
            €{preset}
          </Button>
        ))}
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <Input
          id="simulated-recharge-amount"
          type="text" 
          value={amount}
          onChange={handleAmountChange}
          placeholder="Ej: 25.50"
          className="flex-grow h-8 text-xs"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSimulate} 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="gradient-button-secondary h-8 text-xs px-3"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full"
            />
          ) : (
            <DollarSign className="w-3.5 h-3.5" />
          )}
          <span className="ml-1">Recargar</span>
        </Button>
      </div>

      <div className="text-[10px] text-muted-foreground p-2 bg-amber-900/20 border border-amber-700 rounded-md">
        <span className="font-semibold text-amber-400">Importante:</span> Las recargas simuladas son solo para desarrollo y pruebas. No involucran dinero real ni a Stripe. Se registrarán como transacciones simuladas.
      </div>
    </motion.div>
  );
};

export default SimulatedRechargeSection;