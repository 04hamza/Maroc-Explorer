import React, { createContext, useContext, useCallback } from 'react';

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [isContactOpen, setIsContactOpen] = React.useState(false);

  const openContactModal = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsContactOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsContactOpen(false);
  }, []);

  return (
    <ContactContext.Provider value={{ isContactOpen, openContactModal, closeContactModal }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => useContext(ContactContext);