export default class App {
  static Attributes = {
    COLOR_THEME: 'data-color-theme',
    MODULE: 'data-module',
    MODULE_OPTIONS: 'data-module-options',
  };

  static defaults = {
    DynamicModules: [],
    InitialModules: {},
    LazyModules: [],
    scope: document.documentElement,
  };

  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.options = { ...App.defaults, ...options };
    this.storage = [];
  }

  /**
   * Initializes all modules that are attached to a DOM element.
   * @returns {App}
   */
  init() {
    const allElements = this.options.scope.querySelectorAll(
      `[${App.Attributes.MODULE}]`,
    );

    allElements.forEach((element) => {
      const name = element.getAttribute(App.Attributes.MODULE);

      // Initial modules are already imported and can be added right away.
      const InitialModule = this.options.InitialModules[name];
      if (InitialModule) {
        this.createModule(InitialModule, element);
        return;
      }

      // Dynamically import default modules.
      if (this.options.DynamicModules.includes(name)) {
        this.loadAndCreateModule(name, element);
        return;
      }

      // Lazy modules will be imported when the element is in the viewport.
      if (this.options.LazyModules.includes(name)) {
        this.observeLazyModule(name, element);
        return;
      }
    });

    return this;
  }

  /**
   * Initializes modules from a list of module names.
   * @param {string[]} names
   * @returns {App}
   */
  initModules(names) {
    names.forEach((name) => {
      const elements = this.getModuleElementsByName(name);
      elements.forEach((element) => {
        this.initModule(name, element);
      });
    });

    return this;
  }

  /**
   * Initializes modules that are not attached to a DOM element.
   * @param {string[]} names
   * @returns {App}
   */
  initDetachedModules(names) {
    names.forEach((name) => {
      this.initModule(name, null);
    });

    return this;
  }

  /**
   * Initializes a module by name for the given element if it doesn't exist yet.
   * @param {string} name
   * @param {Element} [element]
   */
  initModule(name, element) {
    if (!this.isExistingModule(name, element)) {
      this.loadAndCreateModule(name, element);
    }
  }

  /**
   * @param {Function} Constructor
   * @param {Element} [element]
   */
  createModule(Constructor, element) {
    // Bail out if an existing module already exists for this element.
    if (this.isExistingModule(Constructor.name, element)) {
      return;
    }

    let module;

    if (element) {
      const options = this.getModuleOptionsFromElement(element);
      module = new Constructor(element, options);
    } else {
      module = new Constructor();
    }

    this.storage.push({
      element: element || null,
      name: Constructor.name,
      module,
    });
  }

  /**
   * @param {string} name
   * @param {Element} [element]
   */
  loadAndCreateModule(name, element) {
    import(`./modules/${name}.js`)
      .then(({ default: Constructor }) => {
        this.createModule(Constructor, element);
      })
      .catch((error) => {
        console.error(`Failed to load module "${name}"`, error);
      });
  }

  /**
   * @param {string} name
   * @returns {NodeList}
   */
  getModuleElementsByName(name) {
    return this.options.scope.querySelectorAll(
      `[${App.Attributes.MODULE}="${name}"]`,
    );
  }

  /**
   * @param {Element} element
   * @returns {Object}
   */
  getModuleOptionsFromElement(element) {
    let options = {};

    if (element.hasAttribute(App.Attributes.MODULE_OPTIONS)) {
      const optionString = element.getAttribute(App.Attributes.MODULE_OPTIONS);

      try {
        options = JSON.parse(optionString);
      } catch (error) {
        const name = element.getAttribute(App.Attributes.MODULE);
        console.error(`Error parsing module options for "${name}"`, {
          error,
          options: optionString,
        });
      }
    }

    return options;
  }

  /**
   * @param {string} name
   * @param {Element} [element]
   * @returns {boolean}
   */
  isExistingModule(name, element = null) {
    return (
      this.storage.filter((item) => {
        return item.name === name && item.element === element;
      }).length > 0
    );
  }

  /**
   * @param {string} name
   * @param {Element} element
   */
  observeLazyModule(name, element) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadAndCreateModule(name, element);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '150px 0px 150px 0px',
      },
    );

    observer.observe(element);
  }
}
