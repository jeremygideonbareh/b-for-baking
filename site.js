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
  let introPlayed = false, context;
  const toggle = $('#motion-toggle');
  function configureMotion() {
    const reduced = preference ? preference === 'reduced' : system.matches;
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    toggle.hidden = false;toggle.textContent = reduced ? 'Enable full motion' : 'Reduce motion';
    toggle.setAttribute('aria-pressed',String(reduced));
    context?.revert();
    if (window.gsap && window.ScrollTrigger && !reduced) {
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        if(!introPlayed && window.scrollY < 100) {
          introPlayed = true;
          gsap.from('.hero h1 .line > *',{y:23,opacity:.88,duration:.78,stagger:.095,ease:'power3.out'});
          gsap.from('.hero-gallery',{y:20,opacity:.9,duration:.9,ease:'power3.out'});
        }
        const scrub = (trigger,start = 'top bottom',end = 'bottom top') => ({trigger,start,end,scrub:.55});
        gsap.to('.hero-gallery',{yPercent:2,ease:'none',scrollTrigger:scrub('.hero','top top')});
        gsap.to('.hero-copy',{yPercent:-8,ease:'none',scrollTrigger:scrub('.hero','top top')});
        gsap.to('.hero-bloom',{rotation:140,ease:'none',scrollTrigger:scrub('.hero','top top')});
        gsap.fromTo('.ribbon-track',{x:0},{x:()=>-Math.min(650,window.innerWidth*.45),ease:'none',scrollTrigger:scrub('.ribbon')});
        gsap.fromTo('.end-visual img',{scale:1.14,yPercent:-3},{scale:1.04,yPercent:1,ease:'none',scrollTrigger:scrub('.enquiry')});
        for(const sel of ['.book-head','.end-copy']) {
          gsap.from(sel+' > *',{y:21,opacity:.2,stagger:.09,duration:.68,ease:'power2.out',scrollTrigger:{trigger:sel,start:'top 92%',once:true}});
        }
        gsap.fromTo('.craft-orbit',{scale:.84,rotation:-38},{scale:1.06,rotation:52,ease:'none',scrollTrigger:scrub('.story')});
        gsap.from('.grid .card',{y:25,stagger:.065,duration:.75,ease:'power3.out',scrollTrigger:{trigger:'.grid',start:'top 90%',once:true}});
      });
    }
    window.dispatchEvent(new Event('bakery-motion'));
  }
  toggle.onclick = () => {
    preference = document.documentElement.dataset.motion === 'full' ? 'reduced' : 'full';
    try{localStorage.setItem('bfb-motion',preference);}catch{}
    configureMotion();
  };
  system.addEventListener('change',configureMotion);configureMotion();
  document.fonts.ready.then(() => window.ScrollTrigger?.refresh());
  const storyChapters = all('.chapters .story-copy');
  const storyLayers = all('.story-layer');
  let storyFrame = 0;
  function syncChapter() {
    storyFrame = 0;
    const centre = window.innerHeight * .58;
    let active = 0;
    storyChapters.forEach((chapter,i) => {if(chapter.getBoundingClientRect().top <= centre) active=i;});
    storyLayers.forEach((layer,i) => layer.classList.toggle('active',active===i+1));
  }
  function queueChapter() {if(!storyFrame) storyFrame = requestAnimationFrame(syncChapter);}
  window.addEventListener('scroll',queueChapter,{passive:true});
  window.addEventListener('resize',queueChapter);syncChapter();
  const craft = $('.craft');
  if('IntersectionObserver' in window && location.protocol !== 'file:') {
    const observer = new IntersectionObserver(items => {
      if(!items[0].isIntersecting || document.documentElement.dataset.motion === 'reduced')return;
      import('./assets/pastry.js').then(module=>module.mount(craft)).catch(()=>{});
      observer.disconnect();
    },{rootMargin:'250px'});
    observer.observe(craft);
    window.addEventListener('bakery-motion',()=>{if(!craft.dataset.mounted)observer.observe(craft);});
  }
})();
