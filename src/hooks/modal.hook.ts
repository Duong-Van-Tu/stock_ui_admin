import { createContext, useContext, ReactElement } from 'react';

export type ModalOptions = {
  showCloseIcon?: boolean;
  autoClose?: boolean;
  centered?: boolean;
  width?: number;
  onClose?: () => void;
};
interface ModalContextType {
  openModal: (content: ReactElement, options?: ModalOptions) => void;
  changeModalContent: (content: ReactElement, options?: ModalOptions) => void;
  closeModal: () => void;
  isOpen: boolean;
  width?: number;
  onClose: () => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
