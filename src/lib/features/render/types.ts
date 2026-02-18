/**
 * Represents an individual asset that can be rendered in a custom view.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CustomViewAsset {
  /** Optional type. If not provided, auto-detected from src/content. */
  type?: 'image' | 'text' | 'html' | string;
  /** Image source URL */
  src?: string;
  /** Alt text for images */
  alt?: string;
  /** Text or HTML content */
  content?: string;
  /** CSS class name(s) to apply */
  className?: string;
  /** Inline CSS styles to apply */
  style?: string;
  [key: string]: any;
}
