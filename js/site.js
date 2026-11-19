/* ===== Methana thamai ona deyak wenas karanna (site settings) ===== */
var SITE = {
  name: "ClipLens AI",
  // Google AdSense publisher id
  adsenseClient: "ca-pub-9047490935389649",
  // AdSense ad unit ids (empty = auto ads or wait for unit creation)
  adsenseSlots: { top: "", middle: "", bottom: "" },
  // Google Analytics 4 id (optional)
  gaId: ""
};

(function () {
  /* mobile menu */
  var btn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav-links");
  if (btn && nav) {
    var iconMenu = btn.innerHTML;
    var iconX = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    var setOpen = function (o) {
      nav.className = o ? "nav-links open" : "nav-links";
      btn.setAttribute("aria-expanded", o ? "true" : "false");
      btn.innerHTML = o ? iconX : iconMenu;
    };
    btn.addEventListener("click", function () { setOpen(nav.className.indexOf("open") === -1); });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setOpen(false); });
  }

  /* footer year */
  var y = document.querySelectorAll("[data-year]");
  for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();

  /* AdSense */
  if (SITE.adsenseClient) {
    var s = document.createElement("script");
    s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + SITE.adsenseClient;
    document.head.appendChild(s);
    var m = document.createElement("meta");
    m.name = "google-adsense-account"; m.content = SITE.adsenseClient;
    document.head.appendChild(m);
  }
  var slots = document.querySelectorAll("[data-ad]");
  for (var j = 0; j < slots.length; j++) {
    var slot = SITE.adsenseSlots[slots[j].getAttribute("data-ad")];
    if (!SITE.adsenseClient || !slot) continue;
    slots[j].className = "ad-wrap";
    slots[j].setAttribute("aria-label", "Advertisement");
    slots[j].innerHTML = '<span class="ad-label">Advertisement</span>' +
      '<ins class="adsbygoogle" style="display:block" data-ad-client="' + SITE.adsenseClient +
      '" data-ad-slot="' + slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }

  /* Google Analytics */
  if (SITE.gaId) {
    var g = document.createElement("script");
    g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + SITE.gaId;
    document.body.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", SITE.gaId);
  }
})();
