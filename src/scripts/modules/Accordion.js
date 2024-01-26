import svg from '../templates/svg';

export default class Accordion {
  static Attributes = {
    CONTENT: 'data-accordion-content',
    HEADING: 'data-accordion-heading',
    TRIGGER: 'data-accordion-trigger',
  };

  static Options = {
    id: undefined,
  };

  /**
   * @param {HTMLElement} element
   * @param {object} options
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...Accordion.Options, ...options };
    this.isOpen = false;

    if (!this.options.id) {
      this.options.id = Math.floor(Math.random() * 1000000000);
    }

    this.headingId = `heading-${this.options.id}`;
    this.contentId = `content-${this.options.id}`;

    this.init();
  }

  /**
   * @returns {Accordion}
   */
  init() {
    this.createChildRefs().layout().enable();

    return this;
  }

  /**
   * @returns {Accordion}
   */
  createChildRefs() {
    this.heading = this.element.querySelector(
      `[${Accordion.Attributes.HEADING}]`,
    );
    if (!this.heading) {
      throw new Error(
        `Accordion: The attribute "${Accordion.Attributes.HEADING}" is missing.`,
      );
    }

    this.content = this.element.querySelector(
      `[${Accordion.Attributes.CONTENT}]`,
    );
    if (!this.content) {
      throw new Error(
        `Accordion: The attribute "${Accordion.Attributes.CONTENT}" is missing.`,
      );
    }

    this.headingInnerHTML = this.heading.innerHTML;
    this.trigger = this.renderTrigger();

    return this;
  }

  /**
   * @returns {Accordion}
   */
  layout() {
    this.heading.innerHTML = '';
    this.heading.appendChild(this.trigger);

    this.content.setAttribute('aria-labelledby', this.headingId);
    this.content.setAttribute('hidden', '');
    this.content.setAttribute('id', this.contentId);
    this.content.setAttribute('role', 'region');

    this.element.setAttribute('enabled', 'true');

    return this;
  }

  /**
   * @returns {Accordion}
   */
  enable() {
    this.trigger.addEventListener('click', this.handleClick);
    this.trigger.addEventListener('keydown', this.handleKeydown);

    return this;
  }

  /**
   * @returns {Accordion}
   */
  destroy() {
    this.trigger.removeEventListener('click', this.handleClick);
    this.trigger.removeEventListener('keydown', this.handleKeydown);

    this.heading.innerHTML = '';
    this.heading.innerHTML = this.headingInnerHTML;

    this.content.removeAttribute('aria-labelledby');
    this.content.removeAttribute('hidden');
    this.content.removeAttribute('id');
    this.content.removeAttribute('role');

    this.element.setAttribute('enabled', 'false');

    return this;
  }

  /**
   * @returns {HTMLButtonElement}
   */
  renderTrigger() {
    const trigger = document.createElement('button');
    trigger.setAttribute('aria-controls', this.contentId);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute(
      'class',
      'w-full flex justify-between gap-4 lg:gap-x-8 text-left',
    );
    trigger.setAttribute(Accordion.Attributes.TRIGGER, '');
    trigger.setAttribute('id', this.headingId);
    trigger.setAttribute('type', 'button');
    trigger.innerHTML = `${this.heading.innerHTML}${svg.useIcon(
      'chevron-down',
      { class: 'mt-1 shrink-0 w-4 h-4' },
    )}`;

    return trigger;
  }

  /**
   * @param {MouseEvent} event
   */
  handleClick = (event) => {
    event.preventDefault();

    if (!this.isOpen) {
      this.open();
    } else {
      this.close();
    }
  };

  /**
   * @param {KeyboardEvent} event
   */
  handleKeydown = (event) => {
    if (this.isOpen && event.key === 'Escape') {
      this.close();
    }
  };

  /**
   * @returns {void}
   */
  close() {
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('hidden', '');
  }

  /**
   * @returns {void}
   */
  open() {
    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.content.removeAttribute('hidden');
  }
}
