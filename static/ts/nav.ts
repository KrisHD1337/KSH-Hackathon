const hamburger = document.querySelector<HTMLButtonElement>('.hamburger');
const navMenu = document.querySelector<HTMLElement>('.nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  navMenu.querySelectorAll<HTMLAnchorElement>('a').forEach(link =>
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    })
  );
}
