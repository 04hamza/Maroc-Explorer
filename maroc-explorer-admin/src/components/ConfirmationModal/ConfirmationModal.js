import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="confirmation-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="confirmation-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>{t('dashboard.confirm_action')}</h3>
          <p>{message}</p>
          <div className="confirmation-buttons">
            <button className="confirm-button" onClick={onConfirm}>
              {t('dashboard.confirm')}
            </button>
            <button className="cancell-button" onClick={onCancel}>
              {t('dashboard.cancel')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;