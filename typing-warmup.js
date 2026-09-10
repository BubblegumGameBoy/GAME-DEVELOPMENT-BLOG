(function () {
  'use strict';
  function checkInput(candidate, target, previous) {
    const normalized = candidate.toLowerCase();
    if (/[^a-z]/.test(normalized)) return {value: previous, message: 'Use Latin letters. Turn Japanese IME off for this exercise.', complete:false};
    if (!target.startsWith(normalized)) return {value: previous, message: 'Try again: the next letter is '+target[previous.length].toUpperCase()+'.', complete:false};
    return {value:normalized, message:normalized === target ? 'Word complete.' : 'Next letter: '+target[normalized.length].toUpperCase()+'.', complete:normalized === target};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {checkInput};
  if (typeof document === 'undefined') return;
  const input=document.getElementById('warmup-input');
  if(!input)return;
  const words=[['はな','hana','flower'],['むし','mushi','insect'],['さかな','sakana','fish'],['さくら','sakura','cherry blossom']];
  const kana=document.getElementById('warmup-kana'),roman=document.getElementById('warmup-roman'),status=document.getElementById('warmup-status'),next=document.getElementById('warmup-next'),progress=document.getElementById('warmup-progress');
  let index=0,previous='';
  function render(){
    const word=words[index]; previous=''; input.value='';input.disabled=false;next.disabled=true;
    kana.textContent=word[0]+' · '+word[2];roman.textContent=word[1];
    progress.textContent='Word '+(index+1)+' of '+words.length;
    status.textContent='Copy the Latin letters below. There is no timer.';
    next.textContent=index===words.length-1?'Practice again':'Next word';
  }
  input.addEventListener('input',function(event){
    if(event.isComposing)return;
    const result=checkInput(input.value,words[index][1],previous);
    input.value=result.value;previous=result.value;status.textContent=result.message;
    next.disabled=!result.complete;
    if(result.complete){input.disabled=true;status.textContent=index===words.length-1?'All four words complete. You are ready to try the games below.':'Word complete. Choose Next word when ready.';next.focus();}
  });
  input.addEventListener('compositionend',function(){input.value=previous;status.textContent='Switch your keyboard to Latin letters, then try again.';});
  next.addEventListener('click',function(){index=(index+1)%words.length;render();input.focus();});
  document.getElementById('warmup-reset').addEventListener('click',function(){index=0;render();input.focus();});
  render();
})();
