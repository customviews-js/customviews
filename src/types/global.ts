/**
 * Global window interface augmentation for CustomViews
 */
declare global {
  interface Window {
    CustomViews: any;
    CustomViewsWidget: any;
    customViewsInstance?: {
      core: any;
      widget?: any;
    };
    __customViewsInitialized?: boolean;
    __customViewsInitInProgress?: boolean;
  }
}

export {}; // Ensure this is a module
