(function () {
  'use strict';
  const videos=Array.from(document.querySelectorAll('video[data-land-webm]'));
  const button=document.getElementById('motion-toggle');
  if(!button)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const landscape=window.matchMedia('(orientation: landscape) and (min-width: 700px)').matches;
  let paused=reduced.matches || !!(navigator.connection && navigator.connection.saveData);
  const visible=new Set();
  function update(video){
    if(paused || !visible.has(video)){video.pause();return;}
    if(!video.dataset.loaded){
      video.querySelectorAll('source').forEach(function(source){
        source.src=landscape ? (source.type==='video/webm'?video.dataset.landWebm:video.dataset.landMp4) : source.dataset.src;
      });
      video.dataset.loaded='1';video.load();
    }
    video.play().catch(function(){});
  }
  function sync(){
    button.textContent=paused?'Play background animation':'Pause background animation';
    button.setAttribute('aria-pressed',String(paused));
    document.body.classList.toggle('motion-paused',paused);
    document.documentElement.classList.toggle('motion-paused',paused);
    videos.forEach(update);
    window.dispatchEvent(new CustomEvent('site-motion-change',{detail:{paused:paused}}));
  }
  videos.forEach(function(video){if(landscape)video.poster=video.dataset.landPoster;});
  button.addEventListener('click',function(){paused=!paused;sync();});
  reduced.addEventListener('change',function(){paused=reduced.matches || !!(navigator.connection && navigator.connection.saveData);sync();});
  button.hidden=false;
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);update(entry.target);});},{threshold:0.01});
    videos.forEach(video=>observer.observe(video));
  }else if(videos[0])visible.add(videos[0]);
  sync();
})();
