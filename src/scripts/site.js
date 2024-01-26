import 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';
import SiteHeader from './modules/SiteHeader';

window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.loadMode = 1;
window.lazySizesConfig.expand = 200;
window.lazySizesConfig.hFac = 0.4;

window.AC = {};

// Modules included in the initial JS bundle.
const InitialModules = {
  SiteHeader,
};

// Modules dynamically imported if they are included on the page.
const DynamicModules = [
  'Accordion',
  'Modal',
];

// Modules dynamically imported when they are almost in the viewport.
const LazyModules = ['Carousel', 'LogoGrid'];

// Initialize the app and store it on the window object.
window.AC.app = new App({
  InitialModules,
  DynamicModules,
  LazyModules,
});
window.AC.app.init();

// Wait until the DOM has been completely parsed.
window.addEventListener('DOMContentLoaded', () => {
  window.AC.app.initModules([
    'CookieNotice',
  ]);

  window.AC.app.initDetachedModules([
    'Analytics',
    'ApplicationMonitoring',
  ]);
});
