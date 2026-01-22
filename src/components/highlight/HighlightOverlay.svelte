<script lang="ts">
  import { type RectData } from '../../core/services/highlight-types';

  interface Props {
    box: { rects: RectData[] };
  }

  let { box }: Props = $props();
  let rects = $derived(box.rects);

  function getArrowClass(rect: RectData): string {
    const viewportWidth = window.innerWidth;
    const rectLeftViewport = rect.left - (window.pageXOffset || document.documentElement.scrollLeft);

    if (rectLeftViewport >= 50) return 'left';
    if (viewportWidth - (rectLeftViewport + rect.width) >= 50) return 'right';
    if (rect.top - (window.pageYOffset || document.documentElement.scrollTop) >= 50) return 'top';
    return 'bottom';
  }

  function getArrowStyle(rect: RectData, direction: string): string {
     let style = '';
     if (direction === 'left') {
         style = `top: ${rect.top}px; left: ${rect.left - 40}px;`;
     } else if (direction === 'right') {
         style = `top: ${rect.top}px; left: ${rect.left + rect.width + 10}px;`;
     } else if (direction === 'top') {
         style = `top: ${rect.top - 40}px; left: ${rect.left + (rect.width / 2) - 15}px;`;
     } else {
         style = `top: ${rect.top + rect.height + 10}px; left: ${rect.left + (rect.width / 2) - 15}px;`;
     }
     return style;
  }

  function getArrowSymbol(direction: string): string {
      switch(direction) {
          case 'left': return '→';
          case 'right': return '←';
          case 'top': return '↓';
          case 'bottom': return '↑';
      }
      return '';
  }
</script>

<div class="cv-highlight-overlay">
  {#each rects as rect}
    <div 
      class="cv-highlight-box"
      style="top: {rect.top}px; left: {rect.left}px; width: {rect.width}px; height: {rect.height}px;"
    ></div>

    {@const dir = getArrowClass(rect)}
    <div 
      class="cv-highlight-arrow {dir}"
      style={getArrowStyle(rect, dir)}
    >
      {getArrowSymbol(dir)}
    </div>
  {/each}
</div>

<style>
  .cv-highlight-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 8000;
    overflow: visible;
  }

  .cv-highlight-box {
    position: absolute;
    border: 4px solid #d13438;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(209, 52, 56, 0.2);
    pointer-events: none;
  }

  .cv-highlight-arrow {
    position: absolute;
    font-size: 30px;
    color: #d13438;
    font-weight: bold;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .cv-highlight-arrow.left { animation: floatArrowLeft 1.5s infinite; }
  .cv-highlight-arrow.right { animation: floatArrowRight 1.5s infinite; }
  .cv-highlight-arrow.top { animation: floatArrowTop 1.5s infinite; }
  .cv-highlight-arrow.bottom { animation: floatArrowBottom 1.5s infinite; }

  @keyframes floatArrowLeft {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-10px); }
  }
  @keyframes floatArrowRight {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(10px); }
  }
  @keyframes floatArrowTop {
      0%, 100% { transform: translate(-50%, 0); }
      50% { transform: translate(-50%, -10px); }
  }
  @keyframes floatArrowBottom {
      0%, 100% { transform: translate(-50%, 0); }
      50% { transform: translate(-50%, 10px); }
  }
</style>
