
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Beer, CheckSquare } from 'lucide-react';

const PinModal = ({
  isOpen,
  onClose,
  onVerifyPin,
  consumptionMode,
  ticketGroupToConsumeName,
  availableTicketsCount
}) => {
  const [pinAttempt, setPinAttempt] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinAttempt('');
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleVerification = async () => {
    setIsVerifying(true);
    await onVerifyPin(pinAttempt);
    // Modal will be closed by parent if verification is successful or handled otherwise
    setIsVerifying(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[calc(100vw-2rem)] w-auto m-2 bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg">
            {consumptionMode === 'all' ? 'Validar Todos los Tickets con PIN' : 'Validar Pedido con PIN'}
          </DialogTitle>
          <DialogDescription className="text-foreground/80 text-xs">
            {consumptionMode === 'all' 
              ? `Introduce el PIN global para consumir todos los ${availableTicketsCount} tickets disponibles.`
              : <>Introduce el PIN global para consumir todos los tickets de: <br /> 
                 <span className="font-semibold text-secondary">{ticketGroupToConsumeName}</span>.</>
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-2">
          <div>
            <label htmlFor="pin-input-modal" className="sr-only">PIN Global</label>
            <Input
              id="pin-input-modal"
              type="password" 
              maxLength="4"
              value={pinAttempt}
              onChange={(e) => setPinAttempt(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="text-center text-xl tracking-[0.3em] h-10"
              disabled={isVerifying}
            />
          </div>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isVerifying} className="h-9 text-sm">
            Cancelar
          </Button>
          <Button 
            onClick={handleVerification} 
            disabled={isVerifying || pinAttempt.length !== 4} 
            className="gradient-button-primary h-9 text-sm"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              consumptionMode === 'all' ? <CheckSquare className="w-4 h-4" /> : <Beer className="w-4 h-4" /> 
            )}
            <span className="ml-1.5">
              {consumptionMode === 'all' ? 'Validar Todo' : 'Validar Pedido'}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PinModal;