(() => {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.intro !== 'opening') return;

  const curtain = document.querySelector('.opening');
  const skip = curtain.querySelector('button');
  const listeners = new AbortController();
  const {signal} = listeners;
  const began = performance.now();
  let hold;
  let deadline;

  function clear() {
    delete root.dataset.intro;
    window.dispatchEvent(new Event('bakery-opened'));
    listeners.abort();
    clearTimeout(hold);
    clearTimeout(deadline);
  }

  function reveal() {
    if (root.dataset.intro !== 'opening') return;
    clearTimeout(hold);
    clearTimeout(deadline);
    root.dataset.intro = 'leaving';
    if (document.activeElement === skip) document.querySelector('.brand').focus({preventScroll:true});
    skip.tabIndex = -1;
    curtain.setAttribute('aria-hidden','true');
    curtain.addEventListener('transitionend',event => {
      if (event.target === curtain && event.propertyName === 'transform') clear();
    },{signal});
    deadline = setTimeout(clear,780);
  }

  skip.addEventListener('click',reveal,{signal});
  window.addEventListener('wheel',reveal,{passive:true,signal});
  window.addEventListener('touchmove',reveal,{passive:true,signal});
  window.addEventListener('keydown',event => {
    if (['Escape','Tab','PageDown','ArrowDown',' '].includes(event.key)) reveal();
  },{signal});
  window.addEventListener('pagehide',clear,{once:true,signal});

  // Wait only for the image and display type used in the opening viewport.
  const hero = document.querySelector('.hero-image');
  const ready = [hero.decode?.(), document.fonts?.load('1em "Instrument Serif"'),
    document.fonts?.load('italic 1em "Instrument Serif"')];
  deadline = setTimeout(reveal,2150);
  Promise.allSettled(ready).then(() => {
    if (root.dataset.intro === 'opening')
      hold = setTimeout(reveal,Math.max(0,1120-(performance.now()-began)));
  });
})();
