
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const TicketConfigSection = ({ ticketTypes, onUpdateTicketType }) => {
  const handleToggleTicketType = async (type) => {
    await onUpdateTicketType(type.id, { active: !type.active });
    toast({
      title: `Ticket ${type.active ? 'desactivado' : 'activado'}`,
      description: `El tipo de ticket ${type.name} ha sido ${type.active ? 'desactivado' : 'activado'}.`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-3 shadow-lg border border-border/50"
    >
      <h3 className="text-base font-semibold text-primary mb-2">Configuración de Tickets</h3>
      <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar-thin pr-0.5">
        {ticketTypes.map((type) => (
          <motion.div 
            key={type.id} 
            className="flex items-center justify-between p-2 bg-background rounded-md border border-border/30"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-3.5 h-3.5 rounded-full shadow-inner bg-gradient-to-r ${type.color || 'from-gray-400 to-gray-500'}`}></div>
              <div>
                <div className="text-xs font-semibold text-foreground">€{type.value} - {type.name}</div>
              </div>
            </div>
            <Button
              variant={type.active ? "destructive" : "default"}
              size="sm"
              onClick={() => handleToggleTicketType(type)}
              className="opacity-80 hover:opacity-100 h-6 text-[10px] px-1.5"
            >
              {type.active ? 'Desactivar' : 'Activar'}
            </Button>
          </motion.div>
        ))}
        {ticketTypes.length === 0 && <p className="text-center text-muted-foreground py-3 text-xs">No hay tipos de ticket.</p>}
      </div>
    </motion.div>
  );
};

export default TicketConfigSection;