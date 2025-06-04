import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { notification } from 'antd';
import { ThemeProvider } from './provider/ThemeContext';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import './i18n/locales/index';
dayjs.extend(relativeTime);
dayjs.locale('en-short', {
  ...dayjs.Ls.en,
  relativeTime: {
    future: '%s',
    past: '%s',
    s: '1s',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy'
  }
});

function App() {
  notification.config({
    placement: 'bottomRight',
    duration: 3
  });

  return (
    <div>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
