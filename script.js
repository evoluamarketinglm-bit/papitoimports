/* Catálogo premium adaptável — JavaScript puro. */
(() => {
  'use strict';
  const cfg = typeof configuracao === 'object' ? configuracao : null;
  if (!cfg || !Array.isArray(cfg.ligas)) {
    document.getElementById('conteudo').textContent = 'Não foi possível carregar os dados do catálogo.';
    return;
  }
  const $ = (selector, base=document) => base.querySelector(selector);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const normalize = (v) => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  const iconArrow = (dir) => {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','3.5');
    svg.setAttribute('stroke-linecap','square');svg.setAttribute('stroke-linejoin','miter');
    svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',dir==='left'?'M16.5 4.5 9 12l7.5 7.5':'m7.5 4.5 7.5 7.5-7.5 7.5');
    svg.append(path);return svg;
  };
  const allClubs = [];
  const carouselStates = [];
  const reducesMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanWhatsapp = (value) => String(value || '').replace(/\D/g,'');
  const asUrl = (u) => (/^https:\/\//i.test(u || '') || /^assets\/[a-z0-9._-]+$/i.test(u || '')) ? u : '';
  const instagramHref = asUrl(cfg.loja?.instagram);

  function makeWhatsappIcon(){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','currentColor');
    svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M12.04 2A9.94 9.94 0 0 0 2.1 11.92a9.8 9.8 0 0 0 1.34 4.96L2 22l5.29-1.38A9.96 9.96 0 1 0 12.04 2Zm0 18.12a8.15 8.15 0 0 1-4.16-1.14l-.3-.18-3.14.82.84-3.05-.2-.31A8.2 8.2 0 1 1 12.04 20.12Zm4.51-6.13c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.22-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.38.11-.5.11-.11.24-.29.37-.43.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.06-.1-.22-.16-.46-.29Z');
    svg.append(path);return svg;
  }
  const whatsappNumber = cleanWhatsapp(cfg.loja?.whatsapp);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
  function renderFloatingWhatsapp(){
    if(!whatsappHref) return;
    const link=el('a','whatsapp-floating');
    link.href=whatsappHref;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.title='Abrir conversa no WhatsApp';
    link.setAttribute('aria-label','Conversar conosco pelo WhatsApp (abre em nova aba)');
    link.append(makeWhatsappIcon());
    $('#floating-contact').append(link);
  }
  function makeClub(club,isClone=false){
    const href=asUrl(club.link);
    const card=el(href?'a':'div','club-card'+(href?'':' is-unavailable'));
    if(href){card.href=href;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`Abrir catálogo de ${club.nome}`)}
    else{card.setAttribute('title',`Catálogo de ${club.nome} ainda não disponível`)}
    if(isClone){card.setAttribute('aria-hidden','true');if(href) card.tabIndex=-1}
    const circle=el('span','club-circle');
    const image=el('img');image.src=club.imagem;image.alt='';image.width=100;image.height=100;
    image.loading='lazy';image.decoding='async';image.draggable=false;
    const fallback=el('span','club-fallback',club.nome.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toLocaleUpperCase('pt-BR'));
    fallback.setAttribute('aria-hidden','true');
    image.addEventListener('load',()=>circle.classList.add('has-image'),{once:true});
    image.addEventListener('error',()=>circle.classList.add('has-fallback'),{once:true});
    circle.append(image,fallback);
    card.append(circle,el('span','club-name',club.nome.toLocaleUpperCase('pt-BR')));
    return card;
  }
  function makeSet(clubs,isClone){
    const set=el('div','carousel-set');
    if(isClone)set.setAttribute('aria-hidden','true');
    clubs.forEach(club=>set.append(makeClub(club,isClone)));
    return set;
  }
  function makeCarousel(liga){
    const shell=el('div','carousel');
    const viewport=el('div','carousel-viewport');viewport.setAttribute('aria-label',`Clubes de ${liga.nome}`);
    viewport.setAttribute('role','region');viewport.setAttribute('aria-roledescription','carrossel');
    viewport.tabIndex=0;
    const track=el('div','carousel-track');
    const first=makeSet(liga.clubes,true),middle=makeSet(liga.clubes,false),last=makeSet(liga.clubes,true);
    track.append(first,middle,last);viewport.append(track);shell.append(viewport);
    const controls=el('div','carousel-controls');
    for (const dir of ['left','right']) {
      const arrow=el('button','carousel-arrow');arrow.type='button';
      arrow.setAttribute('aria-label',dir==='left'?`Voltar clubes de ${liga.nome}`:`Avançar clubes de ${liga.nome}`);
      arrow.append(iconArrow(dir));
      arrow.addEventListener('click',()=>{
        state.pauseUntil=performance.now()+4000;
        const distance=viewport.querySelector('.club-card').getBoundingClientRect().width+
          parseFloat(getComputedStyle(first).gap || 0);
        viewport.scrollBy({left:(dir==='left'?-1:1)*distance*2,behavior:reducesMotion.matches?'instant':'smooth'});
      });
      controls.append(arrow);
    }
    shell.append(controls);
    const state={viewport,first,segment:0,visible:true,hovered:false,focused:false,dragging:false,pauseUntil:0};
    carouselStates.push(state);
    const resetScroll=()=>{
      const newWidth=first.getBoundingClientRect().width;
      if(newWidth<1) return;
      if(state.segment){
        const fraction=(viewport.scrollLeft-state.segment)/state.segment;
        viewport.scrollLeft=newWidth+fraction*newWidth;
      }else viewport.scrollLeft=newWidth;
      state.segment=newWidth;
    };
    requestAnimationFrame(resetScroll);
    if('ResizeObserver' in window){
      const observer=new ResizeObserver(resetScroll);observer.observe(first);
    }else window.addEventListener('resize',resetScroll,{passive:true});
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting},{threshold:.04});
      observer.observe(shell);
    }
    viewport.addEventListener('mouseenter',()=>state.hovered=true);
    viewport.addEventListener('mouseleave',()=>state.hovered=false);
    viewport.addEventListener('focusin',()=>state.focused=true);
    viewport.addEventListener('focusout',()=>state.focused=viewport.contains(document.activeElement));
    viewport.addEventListener('touchstart',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
    viewport.addEventListener('touchmove',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
    let dragStartX=0,dragStartScroll=0,suppressClickUntil=0,dragMoved=false;
    viewport.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch'||e.button!==0) return;
      state.dragging=true;dragMoved=false;dragStartX=e.clientX;dragStartScroll=viewport.scrollLeft;
      state.pauseUntil=performance.now()+5000;
    });
    viewport.addEventListener('pointermove',e=>{
      if(!state.dragging) return;
      const delta=e.clientX-dragStartX;
      if(Math.abs(delta)>5){
        if(!dragMoved){dragMoved=true;viewport.classList.add('is-dragging')}
        viewport.scrollLeft=dragStartScroll-delta;
        e.preventDefault();
      }
    });
    const dragEnd=()=>{
      if(!state.dragging) return;
      state.dragging=false;viewport.classList.remove('is-dragging');
      if(dragMoved){suppressClickUntil=Date.now()+350;dragMoved=false}
    };
    viewport.addEventListener('pointerup',dragEnd);
    viewport.addEventListener('pointercancel',dragEnd);
    viewport.addEventListener('pointerleave',dragEnd);
    viewport.addEventListener('click',e=>{
      if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}
    },true);
    // Pausar apenas nas entradas do usuário: scroll gerado pelo próprio autoplay não deve interromper o loop.
    viewport.addEventListener('wheel',()=>{state.pauseUntil=performance.now()+4000},{passive:true});
    viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))state.pauseUntil=performance.now()+4000;});
    return shell;
  }
  function renderSections(){
    const root=$('#conteudo');
    cfg.ligas.forEach((liga,i)=>{
      const section=el('section','liga-section');section.id=liga.id;
      section.setAttribute('aria-label',liga.nome);
      const banner=el('div','banner-container');
      const imgUrl=asUrl(liga.bannerMobile && window.matchMedia('(max-width: 619px)').matches ? liga.bannerMobile : liga.bannerDesktop);
      if(imgUrl){
        const image=el('img');image.src=imgUrl;
        image.alt=`Banner ${liga.nome}`;image.width=1080;image.height=608;
        image.loading=i===0?'eager':'lazy';image.decoding='async';
        if(i===0) image.setAttribute('fetchpriority','high');banner.append(image);
      }else{
        const pending=el('div','nba-pending-banner',liga.nome);
        pending.setAttribute('aria-label',`Banner de ${liga.nome} ainda não fornecido`);
        banner.append(pending);
      }
      section.append(banner);
      if(Array.isArray(liga.clubes) && liga.clubes.length){section.append(makeCarousel(liga));}
      root.append(section);
      (liga.clubes||[]).forEach(club=>allClubs.push({club,liga}));
    });
  }
  function renderNavigation(){
    const nav=$('#navigation-content');
    const home=el('a','nav-top-link','INÍCIO');home.href='#inicio';nav.append(home);
    nav.append(el('span','nav-heading','COMPRE POR LIGA'));
    cfg.ligas.forEach(liga=>{
      if(!(liga.clubes||[]).length){
        const link=el('a','nav-top-link',liga.nome.toLocaleUpperCase('pt-BR'));
        link.href='#'+liga.id;nav.append(link);return;
      }
      const details=el('details','nav-league');
      const summary=el('summary','',liga.nome.toLocaleUpperCase('pt-BR'));
      const items=el('div','nav-items');
      liga.clubes.forEach(club=>{
        const href=asUrl(club.link);
        const node=el(href?'a':'span',href?'':'no-link',club.nome.toLocaleUpperCase('pt-BR'));
        if(href){node.href=href;node.target='_blank';node.rel='noopener noreferrer'}
        else node.title='Catálogo indisponível';
        items.append(node);
      });
      details.append(summary,items);nav.append(details);
    });
    const collectionsLink=el('a','nav-top-link nav-collections-link','OUTRAS COLEÇÕES');
    collectionsLink.href='#outras-colecoes';nav.append(collectionsLink);

    if(whatsappHref){
      const contato=el('a','nav-contact-link','WHATSAPP');
      contato.href=whatsappHref;contato.target='_blank';contato.rel='noopener noreferrer';
      contato.setAttribute('aria-label','Entrar em contato pelo WhatsApp (abre em nova aba)');
      nav.append(contato);
    }
    if(instagramHref){
      const insta=el('a','nav-contact-link','INSTAGRAM');
      insta.href=instagramHref;insta.target='_blank';insta.rel='noopener noreferrer';
      insta.setAttribute('aria-label','Abrir Instagram da loja (abre em nova aba)');
      nav.append(insta);
    }
  }
  let openOverlay=null,lastFocused=null;
  const overlays={nav:$('#nav-overlay'),search:$('#search-overlay')};
  const triggers={nav:$('#menu-button'),search:$('#search-button')};
  const panels={nav:$('#navigation-panel'),search:$('#search-panel')};
  function openPanel(type){
    if(openOverlay)closePanel(false);
    lastFocused=document.activeElement;
    overlays[type].hidden=false;document.body.classList.add('overlay-open');
    triggers[type].setAttribute('aria-expanded','true');openOverlay=type;
    requestAnimationFrame(()=>{if(type==='search')$('#search-input').focus();else $('#close-menu').focus()});
  }
  function closePanel(restoreFocus=true){
    if(!openOverlay)return;
    const type=openOverlay;overlays[type].hidden=true;document.body.classList.remove('overlay-open');
    triggers[type].setAttribute('aria-expanded','false');openOverlay=null;
    if(restoreFocus && lastFocused instanceof HTMLElement)lastFocused.focus();
  }
  $('#menu-button').addEventListener('click',()=>openPanel('nav'));
  $('#search-button').addEventListener('click',()=>openPanel('search'));
  $('#close-menu').addEventListener('click',()=>closePanel());
  $('#close-search').addEventListener('click',()=>closePanel());
  document.querySelectorAll('[data-close]').forEach(node=>node.addEventListener('click',()=>closePanel()));
  $('#navigation-content').addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#"]');if(anchor)closePanel(false);
  });
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault();openPanel('search');return;
    }
    if(!openOverlay)return;
    if(e.key==='Escape'){e.preventDefault();closePanel();return;}
    if(e.key==='Tab'){
      const panel=panels[openOverlay];
      const focusables=[...panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(node=>node.getClientRects().length);
      if(!focusables.length){e.preventDefault();panel.focus();return;}
      const first=focusables[0],last=focusables[focusables.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  function searchResult(label,detail,onClick,disabled=false){
    const node=el('button','search-row'+(disabled?' is-unavailable':''));node.type='button';node.disabled=disabled;
    node.append(el('span','',label.toLocaleUpperCase('pt-BR')),el('small','',detail.toLocaleUpperCase('pt-BR')));
    if(!disabled)node.addEventListener('click',onClick);
    return node;
  }
  function renderSearch(query){
    const results=$('#search-results');results.replaceChildren();
    const word=normalize(query);
    if(!word){results.append(el('p','search-message','Digite o nome de uma liga, clube ou seleção.'));return;}
    const frag=document.createDocumentFragment();let count=0;
    cfg.ligas.forEach(liga=>{
      if(normalize(liga.nome).includes(word)){
        frag.append(searchResult(liga.nome,'LIGA',()=>{
          closePanel(false);document.getElementById(liga.id)?.scrollIntoView({behavior:reducesMotion.matches?'instant':'smooth'});
        }));count++;
      }
    });
    if(normalize('Outras Coleções').includes(word)){
      frag.append(searchResult('Outras Coleções','SEÇÃO',()=>{
        closePanel(false);document.getElementById('outras-colecoes')?.scrollIntoView({behavior:reducesMotion.matches?'instant':'smooth'});
      }));count++;
    }

    allClubs.forEach(({club,liga})=>{
      if(count>=70)return;
      if(normalize(club.nome).includes(word)){
        const href=asUrl(club.link);
        frag.append(searchResult(club.nome,href?liga.nome:'SEM CATÁLOGO',()=>{
          if(href){window.open(href,'_blank','noopener,noreferrer')}
        },!href));count++;
      }
    });
    if(!count)results.append(el('p','search-message','Nenhum resultado encontrado.'));
    else results.append(frag);
  }
  $('#search-input').addEventListener('input',e=>renderSearch(e.target.value));

  function renderOutrasColecoes(){
    const data=cfg.loja?.outrasColecoes || {};
    const section=el('section','liga-section other-collections-section');
    section.id='outras-colecoes';
    section.setAttribute('aria-label','Outras Coleções');

    const banner=el('div','banner-container other-collections-banner');
    const desktop=asUrl(data.bannerDesktop);
    const mobile=asUrl(data.bannerMobile);
    if(desktop||mobile){
      const picture=el('picture');
      if(mobile){
        const source=el('source');source.media='(max-width:619px)';source.srcset=mobile;
        picture.append(source);
      }
      const img=el('img');img.src=desktop||mobile;
      img.alt='Banner de Outras Coleções';img.width=1080;img.height=608;
      img.loading='lazy';img.decoding='async';
      picture.append(img);banner.append(picture);
    }else{
      const placeholder=el('div','other-collections-banner-placeholder');
      placeholder.setAttribute('aria-label','Espaço reservado ao banner horizontal de Outras Coleções (1080 por 608 pixels)');
      banner.append(placeholder);
    }
    section.append(banner);

    const entries=Array.isArray(data.imagens)?data.imagens.slice(0,30):[];
    if(entries.length){
      const shell=el('div','carousel collection-carousel');
      const viewport=el('div','carousel-viewport collection-viewport');
      viewport.setAttribute('role','region');
      viewport.setAttribute('aria-roledescription','carrossel');
      viewport.setAttribute('aria-label','Imagens das Outras Coleções');
      viewport.tabIndex=0;
      const track=el('div','carousel-track');
      const createSet=(clone)=>{
        const set=el('div','carousel-set collection-set');
        if(clone)set.setAttribute('aria-hidden','true');
        entries.forEach((item,i)=>{
          const href=asUrl(item?.link);
          const src=asUrl(item?.imagem);
          const nome=String(item?.nome || item?.alt || `Coleção ${String(i+1).padStart(2,'0')}`).trim().toLocaleUpperCase('pt-BR');
          const card=el(href?'a':'div','collection-card'+(src?'':' collection-card--empty'));
          if(href){
            card.href=href;card.target='_blank';card.rel='noopener noreferrer';
            card.setAttribute('aria-label',`Abrir ${nome}`);
            if(clone)card.tabIndex=-1;
          }
          const media=el('div','collection-card-media');
          if(src){
            const img=el('img');img.src=src;
            img.alt=clone?'':`Imagem da coleção ${nome}`;
            img.width=1080;img.height=1080;img.loading='lazy';img.decoding='async';
            img.draggable=false;media.append(img);
          }else{
            media.append(el('span','collection-card-placeholder'));
          }
          card.append(media,el('span','collection-card-name',nome));
          set.append(card);
        });
        return set;
      };
      const first=createSet(true),middle=createSet(false),last=createSet(true);
      track.append(first,middle,last);viewport.append(track);shell.append(viewport);
      const controls=el('div','carousel-controls');
      const state={viewport,first,segment:0,visible:true,hovered:false,focused:false,dragging:false,pauseUntil:0};
      carouselStates.push(state); // compartilha o mesmo movimento automático dos escudos
      for(const dir of ['left','right']){
        const arrow=el('button','carousel-arrow');arrow.type='button';
        arrow.setAttribute('aria-label',dir==='left'?'Voltar imagens de Outras Coleções':'Avançar imagens de Outras Coleções');
        arrow.append(iconArrow(dir));
        arrow.addEventListener('click',()=>{
          state.pauseUntil=performance.now()+4500;
          const card=viewport.querySelector('.collection-card');
          const distance=card.getBoundingClientRect().width + parseFloat(getComputedStyle(first).gap||0);
          viewport.scrollBy({left:(dir==='left'?-1:1)*distance*2,behavior:reducesMotion.matches?'instant':'smooth'});
        });
        controls.append(arrow);
      }
      shell.append(controls);section.append(shell);
      const resetScroll=()=>{
        const width=first.getBoundingClientRect().width;
        if(width<1)return;
        if(state.segment){
          const fraction=(viewport.scrollLeft-state.segment)/state.segment;
          viewport.scrollLeft=width+fraction*width;
        }else viewport.scrollLeft=width;
        state.segment=width;
      };
      requestAnimationFrame(resetScroll);
      if('ResizeObserver' in window){
        const observer=new ResizeObserver(resetScroll);observer.observe(first);
      }else window.addEventListener('resize',resetScroll,{passive:true});
      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver(items=>{state.visible=items[0].isIntersecting},{threshold:.04});
        observer.observe(shell);
      }
      viewport.addEventListener('mouseenter',()=>state.hovered=true);
      viewport.addEventListener('mouseleave',()=>state.hovered=false);
      viewport.addEventListener('focusin',()=>state.focused=true);
      viewport.addEventListener('focusout',()=>state.focused=viewport.contains(document.activeElement));
      viewport.addEventListener('touchstart',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
      viewport.addEventListener('touchmove',()=>{state.pauseUntil=performance.now()+4500},{passive:true});
      viewport.addEventListener('wheel',()=>{state.pauseUntil=performance.now()+4000},{passive:true});
      viewport.addEventListener('keydown',event=>{
        if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))state.pauseUntil=performance.now()+4000;
      });
      let pointerStartX=0,pointerStartScroll=0,dragMoved=false,suppressClickUntil=0;
      viewport.addEventListener('pointerdown',event=>{
        if(event.pointerType==='touch'||event.button!==0)return;
        state.dragging=true;dragMoved=false;pointerStartX=event.clientX;pointerStartScroll=viewport.scrollLeft;
        state.pauseUntil=performance.now()+5000;
      });
      viewport.addEventListener('pointermove',event=>{
        if(!state.dragging)return;
        const delta=event.clientX-pointerStartX;
        if(Math.abs(delta)>5){
          dragMoved=true;viewport.classList.add('is-dragging');
          viewport.scrollLeft=pointerStartScroll-delta;event.preventDefault();
        }
      });
      const endDrag=()=>{
        if(!state.dragging)return;
        state.dragging=false;viewport.classList.remove('is-dragging');
        if(dragMoved){suppressClickUntil=Date.now()+350;dragMoved=false;}
      };
      viewport.addEventListener('pointerup',endDrag);
      viewport.addEventListener('pointercancel',endDrag);
      viewport.addEventListener('pointerleave',endDrag);
      viewport.addEventListener('click',event=>{
        if(Date.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}
      },true);
    }
    $('#conteudo').append(section);
  }

  const gallery = el('section', 'tenis-section');
  const heading = el('h2', 'erpd-section-heading', 'COLEÇÕES PRINCIPAIS');
  heading.id = 'colecoes-principais';
  gallery.setAttribute('aria-labelledby', heading.id);
  const stage = el('div', 'tenis-stage');
  const dots = el('div', 'tenis-dots');
  stage.classList.add('monza-stage');
  gallery.append(heading, stage, dots);
  $('#conteudo').append(gallery);
  const slides = [];
  const buttons = [];
  let active = 0;
  function selectSlide(index) {
    const total = slides.length;
    active = (index + total) % total;
    slides.forEach((slide, i) => {
      const distance = (i - active + total) % total;
      const offset = distance > total / 2 ? distance - total : distance;
      slide.style.setProperty('--offset', offset);
      slide.classList.toggle('is-current', offset === 0);
      slide.classList.toggle('is-adjacent', Math.abs(offset) === 1);
      slide.tabIndex = offset === 0 && slide.hasAttribute('href') ? 0 : -1;
      slide.setAttribute('aria-hidden', String(offset !== 0));
      buttons[i].classList.toggle('is-active', offset === 0);
      buttons[i].setAttribute('aria-pressed', String(offset === 0));
    });
  }
  cfg.loja.destaques.forEach((item, i) => {
    const href = asUrl(item.link);
    const slide = el(href ? 'a' : 'div', 'tenis-slide');
    if (href) {
      slide.href = href;
      slide.target = '_blank';
      slide.rel = 'noopener noreferrer';
      slide.setAttribute('aria-label', 'Abrir catálogo de ' + item.nome);
    }
    const img = el('img');
    img.alt = '';
    img.src = item.imagem;
    slide.append(img, el('span', 'monza-caption', item.nome));
    slide.addEventListener('click', event => {
      if (i !== active) { event.preventDefault(); selectSlide(i); }
    });
    const dot = el('button', 'tenis-dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Mostrar ' + item.nome);
    dot.onclick = () => selectSlide(i);
    slides.push(slide);
    buttons.push(dot);
    stage.append(slide);
    dots.append(dot);
  });
  selectSlide(0);
  let touchX;
  let suppressClick = false;
  stage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; suppressClick = false; }, {passive:true});
  stage.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 40) {
      suppressClick = true;
      selectSlide(active + (delta < 0 ? 1 : -1));
      setTimeout(() => { suppressClick = false; }, 400);
    }
  }, {passive:true});
  stage.addEventListener('click', e => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  setInterval(() => {
    if (!document.hidden && !reducesMotion.matches && !gallery.matches(':focus-within') &&
        !(matchMedia('(hover: hover)').matches && gallery.matches(':hover'))) selectSlide(active + 1);
  }, 4000);
  renderFloatingWhatsapp();
  renderSections();
  renderOutrasColecoes();
  renderNavigation();
  renderSearch('');
  const brandLogo=$('#brand-logo-image');
  const brandPlaceholder=$('#brand-placeholder');
  const headerWhatsapp=$('#header-whatsapp');
  const headerInstagram=$('#header-instagram');
  const logoUrl=asUrl(cfg.loja?.logoCabecalho);
  const remoteLogoUrl=asUrl(cfg.loja?.logoOriginalUrl);
  brandLogo.onerror=()=>{
    if(remoteLogoUrl && !brandLogo.dataset.triedRemote){
      brandLogo.dataset.triedRemote='true';
      brandLogo.src=remoteLogoUrl;
      return;
    }
    brandLogo.hidden=true;
    brandPlaceholder.hidden=false;
    brandPlaceholder.textContent=cfg.loja.nome||'PAPITO IMPORTS';
  };
  if(logoUrl){
    brandLogo.src=logoUrl;
    brandLogo.hidden=false;
    brandLogo.alt=`Logo de ${cfg.loja.nome}`;
    brandPlaceholder.hidden=true;
  }else{
    brandLogo.hidden=true;
    brandPlaceholder.hidden=false;
    brandPlaceholder.textContent=cfg.loja.nome||'PAPITO IMPORTS';
  }
  if(whatsappHref)headerWhatsapp.href=whatsappHref;
  else headerWhatsapp.hidden=true;
  if(instagramHref)headerInstagram.href=instagramHref;
  else headerInstagram.hidden=true;
  $('#brand-link').setAttribute('aria-label',`${cfg.loja.nome} — voltar ao início`);
  $('#footer-name').textContent=cfg.loja.nome;
  $('#footer-year').textContent=String(new Date().getFullYear());
  document.title=`${cfg.loja.nome} | Catálogo Esportivo`;

  // Animação contínua: um único requestAnimationFrame, com pausa em interação,
  // fora da tela, em abas ocultas e quando há preferência de movimento reduzido.
  let lastTime=0;
  function animate(now){
    const delta=lastTime?Math.min(80,now-lastTime):0;lastTime=now;
    if(!document.hidden&&!reducesMotion.matches){
      for(const state of carouselStates){
        const {viewport,segment}=state;
        if(segment<1)continue;
        if(viewport.scrollLeft < segment*.5)viewport.scrollLeft+=segment;
        else if(viewport.scrollLeft>segment*1.5)viewport.scrollLeft-=segment;
        if(!state.visible||state.hovered||state.focused||state.dragging||now<state.pauseUntil)continue;
        viewport.scrollLeft += delta * .024;
      }
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
