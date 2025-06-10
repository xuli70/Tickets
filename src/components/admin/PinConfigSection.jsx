
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const PinConfigSection = ({ globalPin, onUpdateGlobalPin }) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [currentGlobalPinDisplay, setCurrentGlobalPinDisplay] = useState("••••");

  useEffect(() => {
    setCurrentGlobalPinDisplay(globalPin ? "••••" : "No asignado");
  }, [globalPin]);

  const openPinModal = () => {
    setNewPin('');
    setConfirmNewPin('');
    setShowPinModal(true);
  };

  const handleUpdatePin = async () => {
    if (newPin.length !== 4) {
      toast({ title: "Error", description: "El PIN debe tener 4 cifras.", variant: "destructive" });
      return;
    }
    if (newPin !== confirmNewPin) {
      toast({ title: "Error", description: "Los PINs no coinciden.", variant: "destructive" });
      return;
    }

    const success = await onUpdateGlobalPin(newPin);
    if (success) {
      toast({
        title: "PIN Global Actualizado",
        description: `El PIN global ha sido actualizado.`,
        className: "bg-secondary text-secondary-foreground"
      });
      setCurrentGlobalPinDisplay("••••");
      setShowPinModal(false);
    } else {
      toast({ title: "Error", description: "No se pudo actualizar el PIN global.", variant: "destructive" });
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg p-3 shadow-lg border border-border/50"
      >
        <h3 className="text-base font-semibold text-primary mb-2">Configurar PIN Global</h3>
        <div className="flex items-center justify-between p-2.5 bg-background rounded-md border border-border/30">
            <div>
                <div className="text-xs font-semibold text-foreground">PIN Global Actual</div>
                <div className={`text-sm font-mono ${globalPin ? 'text-secondary' : 'text-destructive'}`}>{currentGlobalPinDisplay}</div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={openPinModal}
                className="text-primary border-primary/50 hover:bg-primary/10 h-7 text-xs px-2"
            >
                <Edit3 className="w-3 h-3 mr-1" />
                {globalPin ? 'Cambiar' : 'Asignar'}
            </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
            Este PIN se utilizará para validar consumos.
        </p>
      </motion.div>

      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg">
              {globalPin ? 'Cambiar' : 'Asignar'} PIN Global
            </DialogTitle>
            <DialogDescription className="pt-1 text-xs">
              El PIN global debe ser un código numérico de 4 cifras.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <div>
              <label htmlFor="new-pin" className="block text-xs font-medium text-foreground/90 mb-0.5">Nuevo PIN (4 cifras)</label>
              <Input
                id="new-pin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                maxLength="4"
                placeholder="••••"
                className="text-center tracking-[0.3em] h-9 text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm-new-pin" className="block text-xs font-medium text-foreground/90 mb-0.5">Confirmar Nuevo PIN</label>
              <Input
                id="confirm-new-pin"
                type="password"
                value={confirmNewPin}
                onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                maxLength="4"
                placeholder="••••"
                className="text-center tracking-[0.3em] h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setShowPinModal(false)} className="h-8 text-xs">
              Cancelar
            </Button>
            <Button onClick={handleUpdatePin} disabled={newPin.length !== 4 || newPin !== confirmNewPin} className="gradient-button-primary h-8 text-xs">
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              Guardar PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PinConfigSection;