document.addEventListener('DOMContentLoaded', function(){
  const navToggle = document.getElementById('navToggle');
  const nav = document.querySelector('.nav');
  navToggle && navToggle.addEventListener('click', ()=> nav.classList.toggle('open'));

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      }
    });
  }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const buyBtns = document.querySelectorAll('.buyBtn');
  const buyTop = document.getElementById('buyTop');
  const buyNow = document.getElementById('buyNow');
  const purchaseForm = document.getElementById('purchaseForm');
  const purchaseMsg = document.getElementById('purchaseMsg');

  function openModal(name, price){
    modal.setAttribute('aria-hidden','false');
    modalTitle.textContent = name;
    modalPrice.textContent = 'Total: R$ ' + Number(price).toFixed(2);
    purchaseMsg.textContent = '';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    purchaseForm.reset();
  }

  buyBtns.forEach(b=>{
    b.addEventListener('click', ()=> openModal(b.dataset.product, b.dataset.price));
  });
  buyTop && buyTop.addEventListener('click', ()=> openModal('First Coffee — Escolha', '9.90'));
  buyNow && buyNow.addEventListener('click', ()=> openModal('First Coffee — Oferta', '9.90'));

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

  purchaseForm.addEventListener('submit', function(e){
    e.preventDefault();
    purchaseMsg.textContent = 'Processando pedido...';
    setTimeout(()=>{
      purchaseMsg.textContent = 'Pedido recebido! Um e-mail de confirmação será enviado.';
    }, 900);
  });

  const newsletter = document.getElementById('newsletter');
  newsletter && newsletter.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Obrigado por assinar! Em breve enviaremos novidades.');
    newsletter.reset();
  });

  const hero = document.querySelector('.hero');
  const floating = document.querySelector('.floating');
  if(hero && floating){
    hero.addEventListener('mousemove', (e)=>{
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      floating.style.transform = `translate3d(${x*20}px, ${-Math.abs(y)*18}px, 0)`;
    });
    hero.addEventListener('mouseleave', ()=> floating.style.transform = '');
  }
});