import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({ open, onOpenChange, title = "Are you sure?", description = "This action cannot be undone.", onConfirm, confirmText = "Delete", cancelText = "Cancel", variant = "destructive" }: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="bg-card border border-border rounded-lg p-6 shadow-lg max-w-md w-full"
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"}`}
              >
                <AlertTriangle className={`w-5 h-5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
              </motion.div>
              <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground text-sm pl-[52px]">{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel data-testid="button-confirm-cancel">{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              data-testid="button-confirm-action"
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useConfirmDialog() {
  const [state, setState] = useState<{ open: boolean; onConfirm: () => void; title?: string; description?: string }>({ open: false, onConfirm: () => {} });

  const confirm = (onConfirm: () => void, title?: string, description?: string) => {
    setState({ open: true, onConfirm, title, description });
  };

  const dialogProps = {
    open: state.open,
    onOpenChange: (open: boolean) => setState((s) => ({ ...s, open })),
    onConfirm: () => { state.onConfirm(); setState((s) => ({ ...s, open: false })); },
    title: state.title,
    description: state.description,
  };

  return { confirm, dialogProps };
}
