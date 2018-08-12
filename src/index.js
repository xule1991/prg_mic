import dva from 'dva';
import './index.css';
import Router from './router'
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'

// 1. Initialize
const app = dva();

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example').default);

// 4. Router
app.router(Router);

// 5. Start
app.start('#root');
