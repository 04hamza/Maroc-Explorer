import { ToastContainer as ReactToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContainer = () => (
  <ReactToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={localStorage.getItem('language') === 'ar'}
    pauseOnFocusLoss
    draggable
    pauseOnHover
  />
);

export default ToastContainer;