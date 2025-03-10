import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black opacity-50" />
      {children}
    </DialogPrimitive.Root>
  );
};

export const DialogContent = ({ children }) => {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Content className="fixed bg-white p-6 rounded-lg shadow-lg w-[300px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

export const DialogTitle = ({ children }) => {
  return <h2 className="text-lg font-bold mb-4">{children}</h2>;
};

export const DialogActions = ({ children }) => {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
};
