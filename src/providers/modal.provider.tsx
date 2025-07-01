/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react';
import { ModalContext, ModalOptions } from '@/hooks/modal.hook';
import { ReactElement, ReactNode, useCallback, useState } from 'react';
import { Modal } from 'antd';
import { isMobile } from 'react-device-detect';

interface ModalProviderProps {
  children: ReactNode;
}

export default function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [option, setOption] = useState({
    closable: true,
    centered: true,
    autoClose: false,
    width: undefined as number | undefined
  });
  const [modalContent, setModalContent] = useState<ReactElement | null>(null);
  const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | null>(
    null
  );

  const openModal = useCallback(
    (
      content: ReactElement,
      options: ModalOptions = {
        showCloseIcon: true,
        autoClose: false,
        centered: true,
        width: undefined,
        onClose: () => {}
      }
    ) => {
      const {
        showCloseIcon = true,
        autoClose = false,
        centered = true,
        width,
        onClose = () => {}
      } = options;

      setOption({
        closable: showCloseIcon,
        centered,
        autoClose,
        width
      });
      setModalContent(content);
      setIsOpen(true);
      setOnCloseCallback(() => onClose);

      if (autoClose) {
        setTimeout(() => {
          if (onCloseCallback) {
            onCloseCallback();
          }
          setIsOpen(false);
        }, 2000);
      }
    },
    [onCloseCallback]
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
    if (onCloseCallback) {
      onCloseCallback();
    }
  }, [onCloseCallback]);

  const changeModalContent = useCallback(
    (
      content: ReactElement,
      options: ModalOptions = {
        showCloseIcon: true,
        autoClose: false,
        centered: true,
        width: undefined,
        onClose: () => {}
      }
    ) => {
      const {
        showCloseIcon = true,
        autoClose = false,
        centered = true,
        width
      } = options;

      setModalContent(content);

      setOption({
        closable: showCloseIcon,
        centered,
        autoClose,
        width
      });

      if (autoClose) {
        setTimeout(() => {
          if (onCloseCallback) {
            onCloseCallback();
          }
          setIsOpen(false);
        }, 2000);
      }
    },
    [onCloseCallback]
  );

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        changeModalContent,
        isOpen,
        onClose: closeModal
      }}
    >
      {children}
      <Global styles={modalStyles} />
      <Modal
        destroyOnClose
        maskClosable={!option.autoClose}
        open={isOpen}
        onCancel={closeModal}
        closable={option.closable}
        aria-labelledby='modal-title'
        aria-describedby='modal-description'
        centered={option.centered}
        width={option.width}
        footer={null}
      >
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
}

const modalStyles = css`
  .ant-modal-content {
    padding: ${isMobile ? '1.6rem' : '2rem'} !important;
    max-height: ${isMobile ? 'calc(100vh - 20rem)' : 'calc(100vh - 8rem)'};
    overflow-y: auto;
  }
  .ant-modal-body {
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;
