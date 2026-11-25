(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const all = s => Array.from(document.querySelectorAll(s));
  const flavourNames = ['Roses in relief','Ivory & gold','The fruit crown'];
  let feature = 0;
  function switchFeature(step) {
    feature = (feature + step + flavourNames.length) % flavourNames.length;
    all('.hero-image').forEach((img,i) => {
      img.classList.toggle('current',i === feature);
      img.setAttribute('aria-hidden',String(i !== feature));
    });
    $('#feature-name').textContent = flavourNames[feature];
  }
  $('#prev-feature').onclick = () => switchFeature(-1);
  $('#next-feature').onclick = () => switchFeature(1);

  let galleryMotion;
  let category = 'All';
  let shown = 6;
  let selected = 0;
  const filtered = () => catalogue.filter(photo => category === 'All' || photo.type === category);
  const grid = $('#grid'), viewer = $('#viewer');
  function showPhoto(index) {
    const choices = filtered();
    selected = (index + choices.length) % choices.length;
    const photo = choices[selected];
    $('#viewer-image').src = 'assets/photo-' + photo.id + '.webp';
    $('#viewer-image').alt = photo.alt;
    $('#viewer-title').textContent = photo.title;
    $('#viewer-type').textContent = photo.type;
    $('#viewer-source').href = photo.url;
    $('#viewer-page').textContent = (selected+1) + ' / ' + choices.length;
  }
  function card(photo,index) {
    const button = document.createElement('button');
    button.className = 'card';
    button.setAttribute('aria-label','View ' + photo.title);
    button.innerHTML = '<div class="card-media"><img loading="lazy" decoding="async" width="450" height="540"></div><div class="card-title"><strong></strong><small></small></div>';
    const img = button.querySelector('img');
    img.src = 'assets/thumb-' + photo.id + '.webp';
    img.alt = photo.alt;
    button.querySelector('strong').textContent = photo.title;
    button.querySelector('small').textContent = photo.type;
    button.onclick = () => {showPhoto(index);viewer.showModal();viewer.querySelector('.close').focus();};
    return button;
  }
  function updateGrid(append = false) {
    galleryMotion?.revert();
    const entries = filtered();
    const first = append ? grid.children.length : 0;
    if (!append) grid.replaceChildren();
    const cards = entries.slice(first,shown).map((p,i) => card(p,first+i));
    grid.append(...cards);
    $('#photo-count').textContent = entries.length + ' photographs';
    $('#more').hidden = shown >= entries.length;
    if (!$('#more').hidden) $('#more').textContent = 'View ' + Math.min(9,entries.length-shown) + ' more photographs';
    all('#filters button').forEach(b => b.setAttribute('aria-pressed',String(b.textContent === category)));
    if (append && cards.length) cards[0].focus({preventScroll:true});
    animateGallery();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  for (const name of ['All','Cakes','Hampers','Journal']) {
    const b = document.createElement('button');
    b.textContent = name;
    b.onclick = () => {category = name;shown = 6;updateGrid();};
    $('#filters').append(b);
  }
  $('#more').onclick = () => {shown += 9;updateGrid(true);};
  viewer.querySelector('.close').onclick = () => viewer.close();
  viewer.onclick = e => {if(e.target === viewer) viewer.close();};
  $('#prev-photo').onclick = () => showPhoto(selected-1);
  $('#next-photo').onclick = () => showPhoto(selected+1);
  viewer.addEventListener('keydown',e => {
    if(e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();showPhoto(selected + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  updateGrid();

  const words = ['Eggless customised cakes','Shillong','Curated hampers','Love at first bite'];
  const track = $('.ribbon-track');
  for (let i=0;i<4;i++) for (const word of words) {
    const span = document.createElement('span');
    span.innerHTML = '<svg><use href="#flower"></use></svg>';
    span.append(document.createTextNode(word));track.append(span);
  }
  const system = window.matchMedia('(prefers-reduced-motion: reduce)');
  let preference;
  try {preference = localStorage.getItem('bfb-motion');} catch {}
  let context;
  let introPlayed = false;
  const toggle = $('#motion-toggle');
  const journal = $('.journal');
  const strip = $('.film-strip');
  const filmWindow = $('.film-window');

  function scrollRange(trigger, start, end) {
    return {trigger, start, end, scrub:.24, invalidateOnRefresh:true};
  }

  function animateGallery() {
    if (document.documentElement.dataset.motion !== 'full' || !window.ScrollTrigger) return;
    galleryMotion = gsap.context(() => {
      for (const card of grid.children) {
        const enters = gsap.timeline({
          defaults:{ease:'none'},
          scrollTrigger:scrollRange(card,'top 97%','top 59%')
        });
        enters.from(card.querySelector('.card-media'),{y:22,scale:.96},0)
          .from(card.querySelector('.card-title'),{y:10,opacity:.65},.12);
      }
    },grid);
  }

  function chapterMotion() {
    const chapters = all('.chapters .story-copy');
    const layers = all('.story-layer');
    chapters.forEach((chapter,i) => {
      const title = chapter.querySelector('h2');
      const reveal = gsap.timeline({
        defaults:{ease:'none'},
        scrollTrigger:scrollRange(title,'top 97%','top 63%')
      });
      reveal.from(chapter.querySelector('.eyebrow .short-rule'),{scaleX:.12,transformOrigin:'left'},0)
        .from(title,{y:30},0)
        .from(title.querySelector('em'),{x:18,opacity:.65},.08)
        .from(chapter.querySelector('p:last-of-type'),{y:15,opacity:.72},.18);

      if (i === 0) return;
      const layer = layers[i-1];
      const transition = gsap.timeline({
        defaults:{ease:'none'},
        scrollTrigger:scrollRange(chapter,'top 65%','top 29%')
      });
      transition.fromTo(layer,{opacity:0,yPercent:7},{opacity:1,yPercent:0},0)
        .fromTo(layer.querySelector('img'),{scale:1.12,rotation:i%2 ? -1.5 : 1.5},{scale:1.02,rotation:0},0);

    });
    gsap.fromTo('.craft-orbit',{scale:.76,rotation:-65},{scale:1.06,rotation:90,ease:'none',
      scrollTrigger:scrollRange(chapters[0],'top bottom','bottom top')});
    gsap.fromTo('.craft > img',{rotation:-8,scale:.92},{rotation:6,scale:1.03,ease:'none',
      scrollTrigger:scrollRange(chapters[0],'top bottom','bottom top')});
  }

  function journalMotion() {
    const media = gsap.matchMedia();
    media.add('(min-height: 540px)',() => {
      journal.classList.add('travelling');
      const travel = () => Math.max(0,strip.scrollWidth-filmWindow.clientWidth);
      const measure = () => journal.style.setProperty('--travel',travel()+'px');
      measure();
      ScrollTrigger.addEventListener('refreshInit',measure);
      const timeline = gsap.timeline({
        defaults:{ease:'none',duration:1},
        scrollTrigger:{...scrollRange(journal,'top top',()=>'+='+travel()),id:'bakery-journal'}
      });
      timeline.to(strip,{x:()=>-travel()},0)
        .fromTo('.film-position i',{scaleX:.05},{scaleX:1},0);
      for(const photo of all('.film-photo img')) {
        gsap.fromTo(photo,{xPercent:-3},{xPercent:3,ease:'none',
          scrollTrigger:{trigger:photo.closest('.film-page'),containerAnimation:timeline,
            start:'left right',end:'right left',scrub:true}});
      }
      return () => {
        ScrollTrigger.removeEventListener('refreshInit',measure);
        journal.classList.remove('travelling');
        journal.style.removeProperty('--travel');
      };
    });
    media.add('(max-height: 539px)',() => {
      for (const figure of all('.film-page figure')) {
        gsap.from(figure,{y:24,ease:'none',scrollTrigger:scrollRange(figure,'top bottom','top 58%')});
      }
    });
    return media;
  }

  let journalMedia;
  function configureMotion() {
    const reduced = preference ? preference === 'reduced' : system.matches;
    galleryMotion?.revert();
    journalMedia?.revert();
    context?.revert();
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    toggle.hidden = false;
    toggle.textContent = reduced ? 'Enable full motion' : 'Reduce motion';
    toggle.setAttribute('aria-pressed',String(reduced));
    if (window.gsap && window.ScrollTrigger && !reduced) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ignoreMobileResize:true});
      context = gsap.context(() => {
        if(!introPlayed && scrollY < 100 && !document.documentElement.dataset.intro) {
          introPlayed = true;
          gsap.from('.hero h1 .line > *',{y:23,opacity:.88,duration:.78,stagger:.095,ease:'power3.out'});
        }
        const opening = gsap.timeline({
          defaults:{ease:'none'},scrollTrigger:scrollRange('.hero','top top','bottom top')
        });
        opening.to('.hero-copy',{yPercent:-12},0)
          .to('.hero-gallery',{yPercent:5},0)
          .to('.hero h1 em',{xPercent:8},0)
          .to('.hero-bloom',{rotation:180},0);
        chapterMotion();
        gsap.fromTo('.ribbon-track',{x:0},{x:()=>-Math.min(810,innerWidth*.7),ease:'none',
          scrollTrigger:scrollRange('.ribbon','top bottom','bottom top')});
        gsap.from('.book-head h2',{x:-24,y:10,ease:'none',scrollTrigger:scrollRange('.book-head','top 95%','center 62%')});
        const closing = gsap.timeline({
          defaults:{ease:'none'},scrollTrigger:scrollRange('.enquiry','top 99%','top 42%')
        });
        closing.from('.end-copy .eyebrow .short-rule',{scaleX:.1,transformOrigin:'left'},0)
          .from('.end-copy h2',{y:32},0)
          .from('.end-copy h2 em',{x:20},.1)
          .from('.end-copy .hero-cta',{y:14,opacity:.7},.2);
        gsap.fromTo('.end-visual img',{scale:1.16,yPercent:-3},{scale:1.04,yPercent:1,ease:'none',
          scrollTrigger:scrollRange('.enquiry','top bottom','bottom top')});
        gsap.fromTo('.reading-line',{scaleX:0},{scaleX:1,ease:'none',
          scrollTrigger:{start:0,end:'max',scrub:true}});
      });
      journalMedia = journalMotion();
      animateGallery();
    }
    window.ScrollTrigger?.refresh();
    window.dispatchEvent(new Event('bakery-motion'));
  }
  toggle.onclick = () => {
    preference = document.documentElement.dataset.motion === 'full' ? 'reduced' : 'full';
    try {localStorage.setItem('bfb-motion',preference);} catch {}
    configureMotion();
  };
  system.addEventListener('change',configureMotion);
  configureMotion();
  document.fonts.ready.then(() => window.ScrollTrigger?.refresh());

  const craft = $('.craft');
  if('IntersectionObserver' in window && location.protocol !== 'file:') {
    const observer = new IntersectionObserver(items => {
      if(!items[0].isIntersecting || document.documentElement.dataset.motion === 'reduced')return;
      import('./assets/pastry.js?v=scroll-2').then(module=>module.mount(craft)).catch(()=>{});
      observer.disconnect();
    },{rootMargin:'100% 0px'});
    const observeWhenReady = () => {
      if(!document.documentElement.dataset.intro && !craft.dataset.mounted) observer.observe(craft);
    };
    window.addEventListener('bakery-opened',observeWhenReady,{once:true});
    window.addEventListener('bakery-motion',observeWhenReady);
    observeWhenReady();
  }
})();
